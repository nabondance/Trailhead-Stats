/**
 * Runs the real git commands against a throwaway repository and a local bare
 * remote, so what is committed and pushed is checked, not just mocked calls.
 */
const childProcess = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const core = require('@actions/core')
const {
  updateStatsOnFile,
  pushUpdatedFile,
  workspacePath
} = require('../src/updateFile')

jest.mock('@actions/core')

const TAGGED = 'Intro\n<!--TH_Stats:start-->\nold\n<!--TH_Stats:end-->\nOutro\n'
const ENV_KEYS = [
  'GITHUB_WORKSPACE',
  'GITHUB_REF',
  'GITHUB_SERVER_URL',
  'GIT_CONFIG_GLOBAL',
  'GIT_CONFIG_NOSYSTEM',
  'GIT_CONFIG_COUNT',
  'GIT_CONFIG_KEY_0',
  'GIT_CONFIG_VALUE_0'
]
const savedEnv = Object.fromEntries(ENV_KEYS.map(k => [k, process.env[k]]))

let tmp, ws, remote, globalConfig

const run = (cwd, ...args) =>
  childProcess.execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
const remoteLog = () => run(remote, 'log', '--format=%an|%s', 'main')
const remoteFiles = () =>
  run(remote, 'show', '--name-only', '--format=', 'main').split('\n')
const write = (file, content) => {
  fs.mkdirSync(path.dirname(path.join(ws, file)), { recursive: true })
  fs.writeFileSync(path.join(ws, file), content)
}

beforeEach(() => {
  jest.clearAllMocks()
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'th-update-')))
  ws = path.join(tmp, 'ws')
  remote = path.join(tmp, 'remote.git')
  // Keep the developer's git config (signing, identity...) out of the test.
  globalConfig = path.join(tmp, 'gitconfig')
  fs.writeFileSync(globalConfig, '')
  process.env.GIT_CONFIG_GLOBAL = globalConfig
  process.env.GIT_CONFIG_NOSYSTEM = '1'
  delete process.env.GIT_CONFIG_COUNT

  run(tmp, 'init', '-q', '--bare', '-b', 'main', remote)
  run(tmp, 'init', '-q', '-b', 'main', ws)
  write('README.md', TAGGED)
  run(ws, 'add', '.')
  run(ws, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init')
  run(ws, 'remote', 'add', 'origin', remote)
  run(ws, 'push', '-q', 'origin', 'main')

  process.env.GITHUB_WORKSPACE = ws
  process.env.GITHUB_REF = 'refs/heads/main'
})

afterEach(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  fs.rmSync(tmp, { recursive: true, force: true })
})

describe('updateStatsOnFile', () => {
  it('replaces the content between the tags', () => {
    updateStatsOnFile('README.md', 'new stats')

    expect(fs.readFileSync(path.join(ws, 'README.md'), 'utf8')).toBe(
      'Intro\n<!--TH_Stats:start-->\nnew stats\n<!--TH_Stats:end-->\nOutro\n'
    )
  })

  it('throws and leaves the file alone when the tags are missing', () => {
    write('README.md', 'No tags here')

    expect(() => updateStatsOnFile('README.md', 'new stats')).toThrow(
      'Error updating README.md: Start or end tag not found in README.md'
    )
    expect(fs.readFileSync(path.join(ws, 'README.md'), 'utf8')).toBe(
      'No tags here'
    )
  })

  it('refuses a display-file outside the repository', () => {
    fs.writeFileSync(path.join(tmp, 'outside.md'), TAGGED)

    expect(() => updateStatsOnFile('../outside.md', 'x')).toThrow(
      'display-file must stay inside the repository, got: ../outside.md'
    )
    expect(fs.readFileSync(path.join(tmp, 'outside.md'), 'utf8')).toBe(TAGGED)
  })

  it('refuses a dangling symlink out of the repository', () => {
    fs.symlinkSync(path.join(tmp, 'nowhere.md'), path.join(ws, 'dangling.md'))

    expect(() => workspacePath('dangling.md', 'card-path')).toThrow(
      'card-path must stay inside the repository, got: dangling.md'
    )
  })

  it('refuses a display-file reached through a symlink out of the repository', () => {
    fs.mkdirSync(path.join(tmp, 'elsewhere'))
    fs.writeFileSync(path.join(tmp, 'elsewhere', 'README.md'), TAGGED)
    fs.symlinkSync(path.join(tmp, 'elsewhere'), path.join(ws, 'link'))

    expect(() => updateStatsOnFile('link/README.md', 'x')).toThrow(
      'display-file must stay inside the repository'
    )
  })
})

describe('workspacePath', () => {
  it.each(['./', '.', 'TS-cards', './TS-cards/new/dir', 'a/../b'])(
    'accepts %s',
    p => {
      expect(workspacePath(p, 'card-path')).toBe(path.resolve(ws, p))
    }
  )

  it.each(['..', '../x', '/etc', 'a/../../x'])('rejects %s', p => {
    expect(() => workspacePath(p, 'card-path')).toThrow(
      `card-path must stay inside the repository, got: ${p}`
    )
  })
})

describe('pushUpdatedFile', () => {
  it('commits only the display file and the card images', () => {
    write('README.md', 'updated')
    write('TS-cards/TScard-light.png', 'light')
    write('TS-cards/TScard-dark.png', 'dark')
    write('TS-cards/other.png', 'not a card')
    write('junk.txt', 'untracked junk')

    pushUpdatedFile('README.md', [
      'TS-cards/TScard-light.png',
      'TS-cards/TScard-dark.png'
    ])

    expect(remoteLog().split('\n')[0]).toBe(
      'Trailhead-Stats|Update Trailhead Stats in README.md'
    )
    expect(remoteFiles().sort()).toEqual([
      'README.md',
      'TS-cards/TScard-dark.png',
      'TS-cards/TScard-light.png'
    ])
    // The identity is per command: no global git config is written.
    expect(fs.readFileSync(globalConfig, 'utf8')).toBe('')
    expect(run(ws, 'remote', 'get-url', 'origin')).toBe(remote)
  })

  it('commits the cards when card-path is the repository root', () => {
    write('TScard-light.png', 'light')
    write('TScard-dark.png', 'dark')
    write('junk.txt', 'untracked junk')

    pushUpdatedFile('README.md', ['./TScard-light.png', './TScard-dark.png'])

    expect(remoteFiles().sort()).toEqual([
      'TScard-dark.png',
      'TScard-light.png'
    ])
  })

  it('skips card files that do not exist', () => {
    write('README.md', 'updated')

    pushUpdatedFile('README.md', ['images/TScard-light.png'])

    expect(remoteFiles()).toEqual(['README.md'])
  })

  it('does not commit when nothing changed', () => {
    pushUpdatedFile('README.md', [])

    expect(remoteLog()).toBe('t|init')
  })

  it('pushes to the branch the workflow runs on', () => {
    run(ws, 'checkout', '-q', '-b', 'stats/profile')
    // GITHUB_REF still says main: the checked-out branch wins.
    write('README.md', 'updated')

    pushUpdatedFile('README.md', [])

    expect(run(remote, 'log', '--format=%s', '-1', 'stats/profile')).toBe(
      'Update Trailhead Stats in README.md'
    )
    expect(remoteLog()).toBe('t|init')
  })

  it('refuses to commit from a detached HEAD (pull request, tag)', () => {
    run(ws, 'checkout', '-q', '--detach')
    write('README.md', 'updated')

    expect(() => pushUpdatedFile('README.md', [])).toThrow(
      'Error pushing changes: cannot commit from a detached HEAD'
    )
    expect(run(ws, 'log', '--format=%s', '-1')).toBe('init')
    expect(remoteLog()).toBe('t|init')
  })

  it('leaves files staged by earlier steps out of the commit', () => {
    write('other.txt', 'staged elsewhere')
    run(ws, 'add', 'other.txt')
    write('README.md', 'updated')

    pushUpdatedFile('README.md', [])

    expect(remoteFiles()).toEqual(['README.md'])
    expect(run(ws, 'diff', '--cached', '--name-only')).toBe('other.txt')
  })

  it('does not commit when only unrelated files are staged', () => {
    write('other.txt', 'staged elsewhere')
    run(ws, 'add', 'other.txt')

    pushUpdatedFile('README.md', [])

    expect(remoteLog()).toBe('t|init')
  })

  it('treats glob characters in paths literally', () => {
    write('cards/TScard-light.png', 'light')
    write('cards/TScard-dark.png', 'dark')
    write('[cards]/x.md', TAGGED)
    run(ws, 'add', '.')
    run(ws, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'add')
    write('cards/TScard-light.png', 'light 2')
    write('[cards]/x.md', 'updated')

    pushUpdatedFile('[cards]/x.md', ['*/TScard-light.png'])

    expect(remoteFiles()).toEqual(['[cards]/x.md'])
  })

  it('never runs input values through a shell', () => {
    const name = 'stats $(touch pwned) `touch pwned2`; touch pwned3.md'
    write(name, TAGGED)
    run(ws, 'add', '--', name)
    run(ws, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'add')
    write(name, 'updated')

    pushUpdatedFile(name, [])

    for (const file of ['pwned', 'pwned2', 'pwned3.md']) {
      expect(fs.existsSync(path.join(ws, file))).toBe(false)
    }
    expect(remoteFiles()).toEqual([name])
  })

  it('refuses card files outside the repository', () => {
    expect(() => pushUpdatedFile('README.md', ['../TScard-light.png'])).toThrow(
      'card-path must stay inside the repository, got: ../TScard-light.png'
    )
  })

  describe('with a token', () => {
    const token = 'ghs_secret123'
    const basic = Buffer.from(`x-access-token:${token}`).toString('base64')
    let execFileSync

    beforeEach(() => {
      execFileSync = jest.spyOn(childProcess, 'execFileSync')
    })
    afterEach(() => execFileSync.mockRestore())

    const pushCall = () =>
      execFileSync.mock.calls.find(
        ([cmd, args]) => cmd === 'git' && args.includes('push')
      )

    it('sends it as the only Authorization header, through the environment', () => {
      process.env.GITHUB_SERVER_URL = 'https://ghe.example.com/'
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      const [, args, options] = pushCall()
      expect(args).toEqual(['push', 'origin', 'HEAD:refs/heads/main'])
      expect(
        JSON.stringify(execFileSync.mock.calls.map(c => c[1]))
      ).not.toContain(basic)
      expect(options.env).toMatchObject({
        GIT_CONFIG_COUNT: '2',
        GIT_CONFIG_KEY_0: 'http.https://ghe.example.com/.extraheader',
        GIT_CONFIG_VALUE_0: '',
        GIT_CONFIG_KEY_1: 'http.https://ghe.example.com/.extraheader',
        GIT_CONFIG_VALUE_1: `AUTHORIZATION: basic ${basic}`
      })
      expect(core.setSecret).toHaveBeenCalledWith(token)
      expect(core.setSecret).toHaveBeenCalledWith(basic)
    })

    it('keeps config entries already passed through the environment', () => {
      process.env.GIT_CONFIG_COUNT = '1'
      process.env.GIT_CONFIG_KEY_0 = 'core.autocrlf'
      process.env.GIT_CONFIG_VALUE_0 = 'false'
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      expect(pushCall()[2].env).toMatchObject({
        GIT_CONFIG_COUNT: '3',
        GIT_CONFIG_KEY_0: 'core.autocrlf',
        GIT_CONFIG_KEY_1: 'http.https://github.com/.extraheader',
        GIT_CONFIG_KEY_2: 'http.https://github.com/.extraheader'
      })
    })

    it('uses the persisted credentials when the token is empty', () => {
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      const { env } = pushCall()[2]
      expect(env.GIT_CONFIG_COUNT).toBeUndefined()
      expect(JSON.stringify(env)).not.toContain('extraheader')
      expect(core.setSecret).not.toHaveBeenCalled()
    })

    it('reports a failed push without the token or the command', () => {
      fs.rmSync(remote, { recursive: true, force: true })
      write('README.md', 'updated')

      let message = ''
      try {
        pushUpdatedFile('README.md', [], token)
      } catch (error) {
        message = error.message
      }

      expect(message).toMatch(/^Error pushing changes: git push failed: /)
      expect(message).not.toContain(token)
      expect(message).not.toContain(basic)
      expect(message).not.toContain('extraheader')
    })
  })
})
