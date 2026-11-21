// PreToolUse hook: blocks agent writes to the frozen dist/ folder.
const fs = require('fs')
const path = require('path')

const MESSAGE =
  'dist/ is frozen: @main users run it, and only release PRs may change it. ' +
  'Use `bash scripts/agent/verify.sh`, which builds to a temp folder.'

const BLOCKED_COMMANDS = [
  // Package scripts that rebuild dist/.
  /\b(?:pnpm|npm|yarn)\s+(?:run\s+)?(?:all|bundle|package(?::watch)?)(?=\s|$|;|&|\|)/,
  // Redirects into dist/.
  />>?\s*["']?(?:\.\/)?dist\//,
  // File commands that change dist/.
  /\b(?:rm|mv|touch|tee)\b[^|;&]*(?:^|[\s"'/])dist(?:\/|\s|$)/,
  /\bcp\b[^|;&]*\s["']?(?:\.\/)?dist(?:\/\S*)?["']?\s*(?:$|[|;&])/,
  /\bsed\s+-i\b[^|;&]*\bdist\//
]

function buildsIntoDist(command) {
  return command
    .split(/&&|\|\||;|\|/)
    .some(
      part =>
        /\bncc\s+build\b/.test(part) &&
        (!/(?:\s-o|\s--out)(?:=|\s)/.test(part) ||
          /(?:-o|--out)(?:=|\s+)["']?(?:\.\/)?dist(?:\/|["']?\s|["']?$)/.test(
            part
          ))
    )
}

function isBlockedCommand(command) {
  return (
    BLOCKED_COMMANDS.some(pattern => pattern.test(command)) ||
    buildsIntoDist(command)
  )
}

function isDistPath(file, root) {
  const relative = path.relative(root, path.resolve(root, file))
  if (relative.startsWith('..') || path.isAbsolute(relative)) return false
  const inner = relative.replace(/^\.claude\/worktrees\/[^/]+\//, '')
  return inner === 'dist' || inner.startsWith('dist/')
}

function shouldBlock(event) {
  const root = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd()
  const input = event.tool_input || {}
  if (event.tool_name === 'Bash') return isBlockedCommand(input.command || '')
  const file = input.file_path || input.notebook_path
  return Boolean(file) && isDistPath(file, root)
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
