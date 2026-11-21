const core = require('@actions/core')
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const START_TAG = '<!--TH_Stats:start-->'
const END_TAG = '<!--TH_Stats:end-->'
const COMMIT_USER = ['-c', 'user.name=Trailhead-Stats']
const COMMIT_EMAIL = ['-c', 'user.email=Trailhead-Stats@noreply.github.com']

function workspaceRoot() {
  return path.resolve(process.env.GITHUB_WORKSPACE || process.cwd())
}

function isInside(root, target) {
  const relative = path.relative(root, target)
  return (
    relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  )
}

// Resolves a user-given path inside the workspace and rejects anything that
// escapes it, through `..` or through a symlink.
function exists(target) {
  try {
    fs.lstatSync(target)
    return true
  } catch {
    return false
  }
}

function realpathOrNull(target) {
  try {
    return fs.realpathSync(target)
  } catch {
    return null // a dangling symlink
  }
}

// Resolves a user-given path inside the workspace and rejects anything that
// escapes it, through `..` or through a symlink (dangling ones included).
function workspacePath(relativePath, inputName) {
  const root = workspaceRoot()
  const resolved = path.resolve(root, relativePath)
  let existing = resolved
  while (!exists(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing)
  }
  const real = realpathOrNull(existing)
  if (
    !isInside(root, resolved) ||
    real === null ||
    !isInside(fs.realpathSync(root), real)
  ) {
    throw new Error(
      `${inputName} must stay inside the repository, got: ${relativePath}`
    )
  }
  return resolved
}

// Runs git without a shell, so input values are never interpreted. The error
// names the command but never echoes its arguments or environment, and any
// secret is scrubbed from git's own output.
function git(label, args, { env, secrets = [] } = {}) {
  try {
    return childProcess.execFileSync('git', args, {
      cwd: workspaceRoot(),
      // Paths are file names, never patterns: `*` or `[` match themselves.
      env: { ...(env || process.env), GIT_LITERAL_PATHSPECS: '1' },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch (error) {
    let detail =
      String(error.stderr || '').trim() || `exit code ${error.status}`
    for (const secret of secrets) detail = detail.split(secret).join('***')
    throw new Error(`git ${label} failed: ${detail}`)
  }
}

function extraHeaderKey() {
  const server = (
    process.env.GITHUB_SERVER_URL || 'https://github.com'
  ).replace(/\/+$/, '')
  return `http.${server}/.extraheader`
}

function hasPersistedAuth() {
  try {
    return git('config', ['config', '--get-all', extraHeaderKey()]) !== ''
  } catch {
    return false // `git config --get-all` exits 1 when the key is unset
  }
}

// GIT_CONFIG_COUNT/KEY/VALUE need git 2.31. Older versions ignore them
// silently and would push with other credentials.
function assertEnvConfigSupported() {
  const version = git('version', ['--version']).match(/(\d+)\.(\d+)/)
  const [major, minor] = version ? version.slice(1).map(Number) : [0, 0]
  if (major < 2 || (major === 2 && minor < 31)) {
    throw new Error(
      `the token input needs git 2.31 or newer, found ${version ? version[0] : 'unknown'}`
    )
  }
}

// Which token to push with, in order: the `token` input; else nothing, when
// actions/checkout persisted credentials (including a PAT given to checkout);
// else a GITHUB_TOKEN set in the step env, as v2 used it.
function pushToken(token) {
  if (token) return token
  if (hasPersistedAuth()) return ''
  return process.env.GITHUB_TOKEN || ''
}

// A token replaces any persisted Authorization header: an empty value resets
// git's header list, then ours is added. Passed through the environment, so it
// never shows up in a command line or an error. Hooks are disabled for that
// push, since they would inherit the token.
function pushEnv(token) {
  if (!token) return { env: process.env, secrets: [], hooks: [] }
  assertEnvConfigSupported()
  const basic = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(token)
  core.setSecret(basic)
  const key = extraHeaderKey()
  const n = Number(process.env.GIT_CONFIG_COUNT) || 0
  return {
    env: {
      ...process.env,
      GIT_CONFIG_COUNT: String(n + 2),
      [`GIT_CONFIG_KEY_${n}`]: key,
      [`GIT_CONFIG_VALUE_${n}`]: '',
      [`GIT_CONFIG_KEY_${n + 1}`]: key,
      [`GIT_CONFIG_VALUE_${n + 1}`]: `AUTHORIZATION: basic ${basic}`
    },
    secrets: [token, basic],
    hooks: ['-c', 'core.hooksPath=/dev/null']
  }
}

// The branch that is checked out, which is where the commit belongs. A
// detached HEAD (pull request merge ref, tag) has no branch to push to.
function targetBranch() {
  try {
    return git('symbolic-ref', [
      'symbolic-ref',
      '--quiet',
      '--short',
      'HEAD'
    ]).trim()
  } catch {
    throw new Error(
      'cannot commit from a detached HEAD (pull request or tag checkout). Run the workflow on a branch (schedule, push or workflow_dispatch), or set no-commit: true'
    )
  }
}

function updateStatsOnFile(displayFile, dataContent) {
  try {
    const filePath = workspacePath(displayFile, 'display-file')
    let fileContent = fs.readFileSync(filePath, 'utf8')

    const startTagIndex = fileContent.indexOf(START_TAG)
    const endTagIndex = fileContent.indexOf(END_TAG, startTagIndex)
    if (startTagIndex === -1 || endTagIndex === -1) {
      throw new Error(`Start or end tag not found in ${displayFile}`)
    }

    fileContent =
      fileContent.substring(0, startTagIndex) +
      `${START_TAG}\n${dataContent}\n${END_TAG}` +
      fileContent.substring(endTagIndex + END_TAG.length)

    fs.writeFileSync(filePath, fileContent, 'utf8')
    core.debug('File updated successfully.')
  } catch (error) {
    throw new Error(`Error updating ${displayFile}: ${error.message}`)
  }
}

// Commits only the display file and the given card files, then pushes them to
// the branch the workflow runs on.
function pushUpdatedFile(displayFile, cardFiles = [], token = '') {
  try {
    const branch = targetBranch()
    const paths = [
      workspacePath(displayFile, 'display-file'),
      ...cardFiles
        .map(file => workspacePath(file, 'card-path'))
        .filter(file => fs.existsSync(file))
    ]

    git('add', ['add', '--', ...paths])
    const staged = git('diff', [
      'diff',
      '--cached',
      '--name-only',
      '--',
      ...paths
    ]).trim()
    if (staged === '') {
      core.debug('No changes detected. Skipping commit and push.')
      return
    }

    git('commit', [
      ...COMMIT_USER,
      ...COMMIT_EMAIL,
      'commit',
      '--only',
      '-m',
      `Update Trailhead Stats in ${displayFile}`,
      '--',
      ...paths
    ])
    const auth = pushEnv(pushToken(token))
    git(
      'push',
      [...auth.hooks, 'push', 'origin', `HEAD:refs/heads/${branch}`],
      auth
    )

    core.debug(`Changes pushed to branch: ${branch}`)
  } catch (error) {
    throw new Error(`Error pushing changes: ${error.message}`)
  }
}

module.exports = {
  updateStatsOnFile,
  pushUpdatedFile,
  workspacePath,
  workspaceRoot
}
