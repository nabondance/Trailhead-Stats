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
    '((cd dist; rm index.js); ls)'
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
    '(( 1 << 2 ))'
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
})
