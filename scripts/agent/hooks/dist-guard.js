// PreToolUse hook: blocks agent writes to the frozen dist/ folder.
// It parses shell commands, so quoted text, comments and heredocs never match.
// This prevents accidents. CI's dist-guard.yml remains the real enforcement.
const fs = require('fs')
const os = require('os')
const path = require('path')

const MESSAGE =
  'dist/ is frozen: @main users run it, and only release PRs may change it. ' +
  'Use `bash scripts/agent/verify.sh`, which builds to a temp folder.'

const WORKTREES = '.claude/worktrees'
const TEMP_VARIABLE = /^\$\{?(?:TMPDIR|TMP|TEMP)\}?(?=\/|$)/
const LEADING_VARIABLES = /^(?:\$(?:\(\)|\{[^}]*\}|\w+)\/*)+(.*)$/
const DIST_SCRIPTS = new Set(['all', 'bundle', 'package', 'package:watch'])
const PACKAGE_MANAGERS = new Set(['pnpm', 'npm', 'yarn'])
// Package manager commands that share a name with a file command below.
const PACKAGE_COMMANDS = new Set(['rm', 'ln', 'unlink', 'find'])
const VALUE_FLAGS = new Set(['-C', '--dir', '--prefix', '--filter', '-F'])
const DIRECTORY_FLAGS = new Set(['-C', '--dir', '--prefix'])
const WRAPPERS = new Set(['command', 'env', 'exec', 'nice', 'nohup', 'sudo'])
const SHELLS = new Set(['bash', 'sh', 'zsh'])
const FILE_WRITERS = new Set([
  'rm',
  'rmdir',
  'unlink',
  'mv',
  'touch',
  'tee',
  'truncate'
])
const COPY_COMMANDS = new Set(['cp', 'ln', 'rsync'])
const IN_PLACE_EDITORS = new Set(['sed', 'perl'])
const SAFE_GIT_SOURCES = new Set(['HEAD', 'main', 'origin/main'])
const CONTROL_WORDS = new Set([
  '{',
  '}',
  '!',
  'if',
  'then',
  'else',
  'elif',
  'do',
  'while',
  'until',
  'time'
])

function closingParen(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')' && --depth === 0) return i
  }
  return text.length - 1
}

// `((` opens arithmetic only when it closes with `))`. Otherwise it is two
// nested subshells, whose commands must still be checked.
function isArithmetic(text, open) {
  const end = closingParen(text, open)
  return text[end - 1] === ')' && !text.slice(open, end).includes(';')
}

function skipHeredocs(text, start, delimiters) {
  let position = start
  for (const delimiter of delimiters) {
    while (position < text.length) {
      const end = text.indexOf('\n', position)
      const stop = end === -1 ? text.length : end
      const line = text.slice(position, stop)
      position = stop + 1
      if (line.trim() === delimiter) break
    }
  }
  return position - 1
}

// Splits a script into simple commands, redirects and command substitutions.
function parseShell(text) {
  const steps = []
  let nested = []
  let argv = []
  let redirects = []
  let heredocs = []
  let word = null
  let quote = null
  let pending = null

  const endWord = () => {
    if (word === null) return
    if (pending === 'write') redirects.push(word)
    else if (pending === 'heredoc') heredocs.push(word)
    else if (pending !== 'skip') argv.push(word)
    pending = null
    word = null
  }
  const endCommand = () => {
    endWord()
    if (argv.length > 0 || redirects.length > 0 || nested.length > 0) {
      steps.push({ argv, redirects, nested })
    }
    argv = []
    redirects = []
    nested = []
    pending = null
  }
  const dropFileDescriptor = () => {
    if (word !== null && /^\d+$/.test(word)) word = null
    endWord()
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (quote === "'") {
      if (char === "'") quote = null
      else word += char
    } else if (char === '\\' && next !== undefined) {
      if (next !== '\n') word = (word ?? '') + next
      i++
    } else if (char === '$' && next === '(') {
      const end = closingParen(text, i + 1)
      nested.push(text.slice(i + 2, end))
      word = `${word ?? ''}$()`
      i = end
    } else if (char === '`') {
      const found = text.indexOf('`', i + 1)
      const end = found === -1 ? text.length : found
      nested.push(text.slice(i + 1, end))
      word = `${word ?? ''}$()`
      i = end
    } else if (quote === '"') {
      if (char === '"') quote = null
      else word += char
    } else if (char === "'" || char === '"') {
      quote = char
      word = word ?? ''
    } else if (char === '#' && word === null) {
      const end = text.indexOf('\n', i)
      i = (end === -1 ? text.length : end) - 1
    } else if (char === '\n') {
      endCommand()
      if (heredocs.length > 0) {
        i = skipHeredocs(text, i + 1, heredocs)
        heredocs = []
      }
    } else if (char === ' ' || char === '\t') {
      endWord()
    } else if (char === ';' || char === '|') {
      endCommand()
    } else if (char === '&' && next === '>') {
      endWord()
      i += text[i + 2] === '>' ? 2 : 1
      pending = 'write'
    } else if (char === '&') {
      endCommand()
    } else if (
      char === '(' &&
      next === '(' &&
      word === null &&
      argv.every(item => CONTROL_WORDS.has(item)) &&
      isArithmetic(text, i)
    ) {
      i = closingParen(text, i)
    } else if (char === '(' || char === ')') {
      endCommand()
      steps.push({ group: char })
    } else if (char === '>') {
      dropFileDescriptor()
      if (next === '>' || next === '|') i++
      if (text[i + 1] === '&') {
        i++
        pending = 'skip'
      } else {
        pending = 'write'
      }
    } else if (char === '<') {
      dropFileDescriptor()
      if (next === '<' && text[i + 2] === '<') {
        i += 2
        pending = 'skip'
      } else if (next === '<') {
        i += text[i + 2] === '-' ? 2 : 1
        pending = 'heredoc'
      } else {
        pending = 'skip'
      }
    } else {
      word = (word ?? '') + char
    }
  }
  endCommand()
  return steps
}

// Worktrees can sit several folders deep because branch names contain `/`.
// Their top folder is the one holding a `.git` entry.
function pathInsideWorktree(relative, root) {
  if (!relative.startsWith(`${WORKTREES}/`)) return relative
  const parts = relative.slice(WORKTREES.length + 1).split('/')
  for (let depth = 1; depth < parts.length; depth++) {
    const top = path.join(root, WORKTREES, ...parts.slice(0, depth))
    if (fs.existsSync(path.join(top, '.git'))) {
      return parts.slice(depth).join('/')
    }
  }
  return parts.slice(1).join('/')
}

function isDistPath(file, root) {
  const relative = path.relative(root, path.resolve(root, file))
  if (relative.startsWith('..') || path.isAbsolute(relative)) return false
  const inner = pathInsideWorktree(relative, root)
  return inner === 'dist' || inner.startsWith('dist/')
}

const expandTemp = file => file.replace(TEMP_VARIABLE, () => os.tmpdir())

// `$ROOT/src` → `src`. Returns null when the path has no leading variable.
function pathAfterVariables(file) {
  const match = file.match(LEADING_VARIABLES)
  return match ? match[1] || '.' : null
}

// An unknown directory (cwd null) is read as the repo root: it may well be it.
// A leading variable may be the repo root or the current directory.
function targetsDist(file, { root, cwd }) {
  if (!file || file.startsWith('~')) return false
  const expanded = expandTemp(file)
  const inner = pathAfterVariables(expanded)
  if (inner !== null) {
    return [root, cwd ?? root].some(base =>
      isDistPath(path.resolve(base, inner), root)
    )
  }
  if (expanded.startsWith('$')) return false
  return isDistPath(path.resolve(cwd ?? root, expanded), root)
}

function operands(args) {
  return args.filter(arg => arg && !arg.startsWith('-'))
}

function stripPrefixes(argv) {
  const rest = [...argv]
  while (rest.length > 0) {
    if (CONTROL_WORDS.has(rest[0]) || /^[A-Za-z_]\w*=/.test(rest[0])) {
      rest.shift()
    } else if (WRAPPERS.has(path.basename(rest[0]))) {
      rest.shift()
      while (rest[0]?.startsWith('-')) rest.shift()
    } else {
      break
    }
  }
  return rest
}

function isInsideRepo(directory, root) {
  const relative = path.relative(root, directory)
  return !(
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
}

function packageWritesDist(args, context) {
  const rest = [...args]
  let directory = context.cwd
  const skipFlags = () => {
    while (rest[0]?.startsWith('-')) {
      const flag = rest.shift()
      const inline = flag.match(/^--(?:dir|prefix)=(.*)$/)
      if (inline) {
        directory = nextCwd(inline[1], directory, context.root)
      } else if (VALUE_FLAGS.has(flag)) {
        const value = rest.shift()
        if (DIRECTORY_FLAGS.has(flag)) {
          directory = nextCwd(value, directory, context.root)
        }
      }
    }
  }
  skipFlags()
  let first = rest.shift()
  if (first === 'exec' || first === 'dlx' || first === 'x') {
    skipFlags()
    return commandWritesDist(rest, { ...context, cwd: directory })
  }
  const isRun = first === 'run' || first === 'run-script'
  if (isRun) {
    skipFlags()
    first = rest.shift()
  }
  // An unknown directory stays blocked: it may well be this repo.
  if (DIST_SCRIPTS.has(first)) {
    return directory === null || isInsideRepo(directory, context.root)
  }
  if (isRun || first === undefined || PACKAGE_COMMANDS.has(first)) return false
  // `pnpm ncc build` runs the local binary, exactly like `pnpm exec ncc build`.
  return commandWritesDist([first, ...rest], { ...context, cwd: directory })
}

function npxWritesDist(args, context) {
  const rest = [...args]
  while (rest[0]?.startsWith('-')) {
    const flag = rest.shift()
    if (flag === '-c' || flag === '--call') {
      return scriptWritesDist(rest[0] ?? '', context)
    }
    if (flag === '-p' || flag === '--package') rest.shift()
  }
  return commandWritesDist(rest, context)
}

function nccWritesDist(args, context) {
  if (args[0] !== 'build') return false
  const inline = args.find(arg => /^(?:--out|-o)=/.test(arg))
  const flag = args.findIndex(arg => arg === '-o' || arg === '--out')
  let out = 'dist'
  if (inline) out = inline.slice(inline.indexOf('=') + 1)
  else if (flag !== -1) out = args[flag + 1]
  return targetsDist(out, context)
}

function gitWritesDist(args, context) {
  const rest = [...args]
  let { cwd } = context
  while (rest[0]?.startsWith('-')) {
    const flag = rest.shift()
    if (flag === '-C') cwd = nextCwd(rest.shift(), cwd, context.root)
    else if (flag === '-c') rest.shift()
  }
  const command = rest.shift()
  const inDist = file => targetsDist(file, { ...context, cwd })

  if (command === 'rm' || command === 'mv') return operands(rest).some(inDist)
  if (command === 'checkout') {
    const separator = rest.indexOf('--')
    if (separator === -1) return false
    const source = operands(rest.slice(0, separator))[0]
    return (
      source !== undefined &&
      !SAFE_GIT_SOURCES.has(source) &&
      rest.slice(separator + 1).some(inDist)
    )
  }
  if (command === 'restore') {
    const inline = rest.find(arg => arg.startsWith('--source='))
    const flag = rest.findIndex(arg => arg === '--source' || arg === '-s')
    let source
    if (inline) source = inline.slice('--source='.length)
    else if (flag !== -1) source = rest[flag + 1]
    return (
      source !== undefined &&
      !SAFE_GIT_SOURCES.has(source) &&
      operands(rest).some(inDist)
    )
  }
  return false
}

function commandWritesDist(rawArgv, context) {
  const argv = stripPrefixes(rawArgv)
  if (argv.length === 0) return false
  // `@vercel/ncc@0.38.1` → `ncc`
  const name = path.basename(argv[0]).replace(/@.*$/, '')
  const args = argv.slice(1)
  const inDist = file => targetsDist(file, context)

  if (SHELLS.has(name)) {
    const flag = args.findIndex(arg => /^-[a-z]*c$/.test(arg))
    return flag !== -1 && scriptWritesDist(args[flag + 1] ?? '', context)
  }
  if (PACKAGE_MANAGERS.has(name)) return packageWritesDist(args, context)
  if (name === 'npx') return npxWritesDist(args, context)
  if (name === 'ncc') return nccWritesDist(args, context)
  if (name === 'git') return gitWritesDist(args, context)
  if (FILE_WRITERS.has(name)) return operands(args).some(inDist)
  if (COPY_COMMANDS.has(name)) {
    const files = operands(args)
    return files.length > 1 && inDist(files[files.length - 1])
  }
  if (IN_PLACE_EDITORS.has(name)) {
    return (
      args.some(arg => /^(?:-[a-zA-Z]*i|--in-place)/.test(arg)) &&
      operands(args).some(inDist)
    )
  }
  if (name === 'find') {
    const exec = args.indexOf('-exec')
    const deletes =
      args.includes('-delete') ||
      (exec !== -1 && FILE_WRITERS.has(path.basename(args[exec + 1] ?? '')))
    return deletes && operands(args).some(inDist)
  }
  return false
}

function nextCwd(target, cwd, root) {
  if (!target || /^[-~]/.test(target)) return null
  const expanded = expandTemp(target)
  const inner = pathAfterVariables(expanded)
  if (inner !== null) return path.resolve(root, inner)
  if (expanded.includes('$')) return null
  if (path.isAbsolute(expanded)) return expanded
  return cwd === null ? null : path.resolve(cwd, expanded)
}

function scriptWritesDist(script, context) {
  let { cwd } = context
  const groups = []
  for (const step of parseShell(script)) {
    if (step.group === '(') {
      groups.push(cwd)
    } else if (step.group === ')') {
      if (groups.length > 0) cwd = groups.pop()
    } else {
      const scoped = { root: context.root, cwd }
      if (step.nested.some(inner => scriptWritesDist(inner, scoped))) {
        return true
      }
      if (step.redirects.some(file => targetsDist(file, scoped))) return true
      const argv = stripPrefixes(step.argv)
      if (argv[0] === 'cd' || argv[0] === 'pushd') {
        cwd = nextCwd(argv[1], cwd, context.root)
      } else if (argv[0] === 'popd') cwd = null
      else if (commandWritesDist(argv, scoped)) return true
    }
  }
  return false
}

function isBlockedCommand(command, { root = process.cwd(), cwd = root } = {}) {
  return scriptWritesDist(command, { root, cwd })
}

function shouldBlock(event) {
  const cwd = event.cwd || process.cwd()
  const root = process.env.CLAUDE_PROJECT_DIR || cwd
  const input = event.tool_input || {}
  if (event.tool_name === 'Bash') {
    return isBlockedCommand(input.command || '', { root, cwd })
  }
  const file = input.file_path || input.notebook_path
  return Boolean(file) && isDistPath(path.resolve(cwd, file), root)
}

if (require.main === module) {
  let event
  try {
    event = JSON.parse(fs.readFileSync(0, 'utf8'))
  } catch {
    process.exit(0)
  }
  if (shouldBlock(event)) {
    console.error(MESSAGE)
    process.exit(2)
  }
}

module.exports = { isBlockedCommand, isDistPath }
