const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const {
  isBlockedCommand,
  isDistPath
} = require('../scripts/agent/hooks/dist-guard')

const root = '/repo'
const blocked = (command, cwd = root) =>
  isBlockedCommand(command, { root, cwd })

describe('dist-guard commands', () => {
  it.each([
    'pnpm all',
    'pnpm run bundle',
    'pnpm package',
    'npm run package:watch',
    'pnpm -s run package',
    'pnpm --silent bundle',
    'pnpm run --silent all',
    'CI=1 pnpm bundle',
    'pnpm install && pnpm run package',
    'bash -c "pnpm bundle"',
    'echo $(pnpm bundle)',
    'pnpm exec ncc build src/index.js --license licenses.txt',
    'pnpm exec ncc build src/index.js -o dist',
    'npx ncc build src/index.js --out=dist',
    'echo x > dist/index.js',
    'echo x >> ./dist/index.js',
    'rm -rf dist',
    'rm -rf dist/',
    'rm dist/*',
    'cd dist && rm index.js',
    'cd dist; echo x > index.js',
    'mv /tmp/index.js dist/index.js',
    'cp /tmp/index.js dist/index.js',
    "sed -i '' s/a/b/ dist/index.js",
    'find dist -type f -delete',
    'find dist -name "*.js" -exec rm {} +',
    'git rm dist/index.js',
    'git checkout origin/other -- dist',
    'git restore --source=origin/other dist',
    "# don't keep the old build\nrm -rf dist",
    '# clean up\nrm -rf dist',
    'echo a#b; rm -rf dist',
    'cat x > >(tee dist/a)',
    'cd src && pnpm all',
    'cd "$ROOT" && pnpm bundle',
    'pnpm -C . run package',
    'git -C dist rm index.js',
    '(( 1 << 2 ))\nrm -rf dist',
    'if (( 1 << 2 )); then rm -rf dist; fi',
    '((cd dist; rm index.js); ls)',
    'cd "$ROOT" && rm -rf dist',
    'cd "$CLAUDE_PROJECT_DIR" && rm -rf dist',
    'cd "$(git rev-parse --show-toplevel)" && rm -rf dist/index.js',
    'cd "$ROOT" && echo x > dist/index.js',
    'cd "$ROOT" && pnpm exec ncc build src/index.js',
    'pnpm ncc build src/index.js',
    'pnpm -s ncc build src/index.js -o dist',
    'yarn ncc build src/index.js',
    'npx ncc build src/index.js',
    'npx --yes ncc build src/index.js',
    'npx -p @vercel/ncc ncc build src/index.js',
    'npx -c "ncc build src/index.js"',
    'rm -rf "$CLAUDE_PROJECT_DIR/dist"',
    'rm -rf "$CLAUDE_PROJECT_DIR"/dist',
    'rm -rf "${ROOT}/dist/index.js"',
    'echo x > "$ROOT/dist/index.js"',
    'rm -rf "$(git rev-parse --show-toplevel)/dist"',
    'pnpm exec ncc build src/index.js -o "$ROOT/dist"',
    'cd "$ROOT/dist" && rm index.js',
    'cd "$ROOT/src" && rm -rf ../dist',
    'cd src && rm "$PWD/../dist/index.js"',
    'npx @vercel/ncc@0.38.1 build src/index.js',
    'pnpm dlx @vercel/ncc@latest build src/index.js',
    'npm x ncc build src/index.js',
    'cd dist && echo $(rm index.js)',
    'git checkout origin/other -- .',
    'git restore --source=origin/other .',
    'cd src && git checkout origin/other -- ..',
    'find . -name dist -type d -exec rm -rf {} +',
    'find . -path "./dist/*" -delete',
    'find .. -name dist -delete'
  ])('blocks %s', command => {
    expect(blocked(command)).toBe(true)
  })

  it.each([
    'git commit -m "docs: explain why pnpm bundle is forbidden"',
    'git commit -m "ci: rm stale dist/ check"',
    "git commit -m 'never run `pnpm bundle`'",
    'grep -n "pnpm package" AGENTS.md',
    'gh pr create --title "ci: stop using pnpm all"',
    'echo "never run pnpm package"',
    'echo "x > dist/index.js"',
    'git commit -F - <<EOF\nrm -rf dist\npnpm bundle\nEOF',
    'rm -rf /tmp/build/dist',
    'rm -rf packages/dist',
    'pnpm exec ncc build src/index.js -o /tmp/out',
    'cat dist/index.js',
    'cp dist/index.js /tmp/copy.js',
    'grep -n foo dist/index.js',
    'find dist -name "*.js" -exec cat {} +',
    'pnpm run lint',
    'pnpm exec jest --ci',
    'git diff -- dist/',
    'git checkout -- dist',
    'git checkout origin/main -- dist',
    'git restore dist/',
    '(cd dist && ls); rm index.js',
    'cd /tmp && rm -rf dist',
    'echo hi # note; rm -rf dist',
    '# pnpm bundle; rm -rf dist\nls',
    'cd /tmp/other && pnpm run package',
    'pnpm -C /tmp/other run package',
    'pnpm --dir=/tmp/other bundle',
    'pnpm -C /tmp/other exec ncc build src/index.js',
    'git -C /tmp/other rm dist/index.js',
    '(( 1 << 2 ))',
    'cd "$ROOT" && rm -rf src/tmp',
    'cd "$ROOT" && pnpm exec ncc build src/index.js -o /tmp/out',
    'pnpm ncc build src/index.js -o /tmp/out',
    'pnpm -C /tmp/other ncc build src/index.js',
    'pnpm rm dist',
    'pnpm run ncc',
    'pnpm install',
    'npx ncc build src/index.js -o /tmp/out',
    'npx --yes ncc build src/index.js --out=/tmp/out',
    'npx -p @vercel/ncc ncc build src/index.js -o /tmp/out',
    'rm -rf "$TMPDIR/dist"',
    'cd "$TMPDIR" && rm -rf dist',
    'rm -rf "$ROOT/packages/dist"',
    'pnpm exec ncc build src/index.js -o "$out"',
    'cd "$ROOT/src" && rm -rf dist',
    'cd /tmp/x && echo $(rm -rf dist)',
    'npx @vercel/ncc@0.38.1 build src/index.js -o /tmp/out',
    'git checkout origin/other -- src',
    'cd src && git checkout origin/other -- .',
    'git checkout origin/main -- .',
    'git restore .',
    'find /tmp/x -name dist -delete',
    'find src -name dist -delete',
    'find . -name "*.tmp" -delete'
  ])('allows %s', command => {
    expect(blocked(command)).toBe(false)
  })

  it('uses the session directory for relative paths', () => {
    expect(blocked('rm index.js', '/repo/dist')).toBe(true)
    expect(blocked('rm dist/index.js', '/tmp')).toBe(false)
  })

  it('still sees commands after a heredoc', () => {
    expect(blocked('cat <<EOF\nhello\nEOF\npnpm bundle')).toBe(true)
  })

  describe('with a repo in the home folder', () => {
    const homeRoot = path.join(os.homedir(), 'guard-test-repo')
    const inHome = command =>
      isBlockedCommand(command, { root: homeRoot, cwd: homeRoot })

    it.each([
      'rm -rf ~/guard-test-repo/dist',
      'rm -rf "$HOME/guard-test-repo/dist"',
      'rm -rf "${HOME}/guard-test-repo/dist/index.js"',
      'cd ~/guard-test-repo && rm -rf dist',
      'cd "$HOME/guard-test-repo/dist" && rm index.js',
      'find ~ -name dist -delete'
    ])('blocks %s', command => {
      expect(inHome(command)).toBe(true)
    })

    it.each([
      'rm -rf ~/other/dist',
      'rm -rf "$HOME/other/dist"',
      'cd ~/other && rm -rf dist',
      'find ~/other -name dist -delete'
    ])('allows %s', command => {
      expect(inHome(command)).toBe(false)
    })
  })
})

describe('dist-guard hook command', () => {
  const repoRoot = path.resolve(__dirname, '..')
  const settings = JSON.parse(
    fs.readFileSync(path.join(repoRoot, '.claude/settings.json'), 'utf8')
  )
  const { command } = settings.hooks.PreToolUse[0].hooks[0]
  const missing = path.join(os.tmpdir(), 'dist-guard-missing-project')

  const runHook = (cwd, projectDir, file) =>
    spawnSync('bash', ['-c', command], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
      input: JSON.stringify({
        tool_name: 'Write',
        cwd: repoRoot,
        tool_input: { file_path: path.join(repoRoot, file) }
      })
    }).status

  it('uses the current checkout when the project folder lacks the hook', () => {
    expect(runHook(repoRoot, missing, 'dist/index.js')).toBe(2)
    expect(runHook(repoRoot, missing, 'src/main.js')).toBe(0)
  })

  it('falls back to the project folder outside a checkout', () => {
    expect(runHook(os.tmpdir(), repoRoot, 'dist/index.js')).toBe(2)
  })

  it('does not crash when no hook can be found', () => {
    expect(runHook(os.tmpdir(), missing, 'dist/index.js')).toBe(0)
  })
})

describe('dist-guard paths', () => {
  it.each([
    ['/repo/dist/index.js', true],
    ['dist/licenses.txt', true],
    ['/repo/.claude/worktrees/feature/dist/index.js', true],
    ['/repo/src/main.js', false],
    ['/repo/packages/dist/index.js', false],
    ['/tmp/dist/index.js', false]
  ])('%s → %s', (file, expected) => {
    expect(isDistPath(file, root)).toBe(expected)
  })

  describe('with a worktree on a type/name branch', () => {
    let repo

    beforeAll(() => {
      repo = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-guard-'))
      const worktree = path.join(repo, '.claude/worktrees/feat/foo')
      fs.mkdirSync(worktree, { recursive: true })
      fs.writeFileSync(path.join(worktree, '.git'), 'gitdir: elsewhere\n')
    })

    afterAll(() => {
      fs.rmSync(repo, { recursive: true, force: true })
    })

    it.each([
      ['.claude/worktrees/feat/foo/dist', true],
      ['.claude/worktrees/feat/foo/dist/index.js', true],
      ['.claude/worktrees/feat/foo/src/main.js', false],
      ['.claude/worktrees/feat/foo/packages/dist/index.js', false],
      ['.claude/worktrees/feat/foo/node_modules/x/dist/index.js', false]
    ])('%s → %s', (file, expected) => {
      expect(isDistPath(path.join(repo, file), repo)).toBe(expected)
    })

    it('blocks a relative delete from the worktree', () => {
      const cwd = path.join(repo, '.claude/worktrees/feat/foo')
      expect(isBlockedCommand('rm -rf dist', { root: repo, cwd })).toBe(true)
    })

    it('blocks restoring the whole worktree from another branch', () => {
      const cwd = path.join(repo, '.claude/worktrees/feat/foo')
      const command = 'git checkout origin/other -- .'
      expect(isBlockedCommand(command, { root: repo, cwd })).toBe(true)
    })
  })
})
