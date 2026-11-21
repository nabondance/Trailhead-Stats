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
function workspacePath(relativePath, inputName) {
  const root = workspaceRoot()
  const resolved = path.resolve(root, relativePath)
  let existing = resolved
  while (!fs.existsSync(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing)
  }
  if (
    !isInside(root, resolved) ||
    !isInside(fs.realpathSync(root), fs.realpathSync(existing))
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
      env: env || process.env,
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

// The token replaces any Authorization header that actions/checkout persisted:
// an empty value resets git's header list, then ours is added. Passed through
// the environment, so it never shows up in a command line or an error.
function pushEnv(token) {
  if (!token) return { env: process.env, secrets: [] }
  const basic = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(token)
  core.setSecret(basic)
  const server = (
    process.env.GITHUB_SERVER_URL || 'https://github.com'
  ).replace(/\/+$/, '')
  const key = `http.${server}/.extraheader`
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
    secrets: [token, basic]
  }
}

function targetBranch() {
  const ref = process.env.GITHUB_REF || ''
  if (!ref.startsWith('refs/heads/')) {
    throw new Error(
      `cannot commit from ${ref || 'an unknown ref'}. Run the workflow on a branch (schedule, push or workflow_dispatch), or set no-commit: true`
    )
  }
  return ref.slice('refs/heads/'.length)
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
    const staged = git('diff', ['diff', '--cached', '--name-only']).trim()
    if (staged === '') {
      core.debug('No changes detected. Skipping commit and push.')
      return
    }

    git('commit', [
      ...COMMIT_USER,
      ...COMMIT_EMAIL,
      'commit',
      '-m',
      `Update Trailhead Stats in ${displayFile}`
    ])
    git('push', ['push', 'origin', `HEAD:refs/heads/${branch}`], pushEnv(token))

    core.debug(`Changes pushed to branch: ${branch}`)
  } catch (error) {
    throw new Error(`Error pushing changes: ${error.message}`)
  }
}

module.exports = { updateStatsOnFile, pushUpdatedFile, workspacePath }
