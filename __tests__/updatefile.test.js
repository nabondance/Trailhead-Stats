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
  workspacePath,
  linkFromDisplayFile
} = require('../src/updateFile')

jest.mock('@actions/core')

// Captured before any spy, to call through to the real git.
const realExecFileSync = childProcess.execFileSync

const TAGGED = 'Intro\n<!--TH_Stats:start-->\nold\n<!--TH_Stats:end-->\nOutro\n'
const ENV_KEYS = [
  'GITHUB_WORKSPACE',
  'GITHUB_REF',
  'GITHUB_SERVER_URL',
  'GIT_CONFIG_GLOBAL',
  'GIT_CONFIG_NOSYSTEM',
  'GIT_CONFIG_COUNT',
  'GIT_CONFIG_KEY_0',
  'GIT_CONFIG_VALUE_0',
  'GITHUB_TOKEN',
  'INPUT_TOKEN',
  'GIT_SSL_NO_VERIFY'
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
  delete process.env.GITHUB_TOKEN
  delete process.env.INPUT_TOKEN
  delete process.env.GIT_SSL_NO_VERIFY

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

describe('linkFromDisplayFile', () => {
  it.each([
    ['README.md', 'images/TScard-light.png', 'images/TScard-light.png'],
    ['docs/README.md', 'docs/images/c.png', 'images/c.png'],
    ['docs/README.md', 'images/c.png', '../images/c.png']
  ])('from %s to %s is %s', (display, card, link) => {
    write(display, TAGGED)

    expect(linkFromDisplayFile(display, path.join(ws, card))).toBe(link)
  })

  it('is relative to the target of a symlinked display file', () => {
    write('docs/README.md', TAGGED)
    fs.rmSync(path.join(ws, 'README.md'))
    fs.symlinkSync('docs/README.md', path.join(ws, 'README.md'))

    expect(linkFromDisplayFile('README.md', path.join(ws, 'docs/c.png'))).toBe(
      'c.png'
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

  it('pushes to the real branch when a tag has the same name', () => {
    run(ws, 'tag', 'main')
    write('README.md', 'updated')

    pushUpdatedFile('README.md', [])

    expect(run(remote, 'for-each-ref', '--format=%(refname)')).toBe(
      'refs/heads/main'
    )
    expect(run(remote, 'log', '--format=%s', '-1', 'refs/heads/main')).toBe(
      'Update Trailhead Stats in README.md'
    )
  })

  it('commits the target of a symlinked display file', () => {
    write('docs/README.md', TAGGED)
    fs.rmSync(path.join(ws, 'README.md'))
    fs.symlinkSync('docs/README.md', path.join(ws, 'README.md'))
    run(ws, 'add', '.')
    run(
      ws,
      '-c',
      'user.name=t',
      '-c',
      'user.email=t@t',
      'commit',
      '-qm',
      'link'
    )

    updateStatsOnFile('README.md', 'new stats')
    pushUpdatedFile('README.md', [])

    expect(remoteFiles()).toEqual(['docs/README.md'])
    expect(run(remote, 'show', 'main:docs/README.md')).toContain('new stats')
  })

  it('reads a display-file with a leading slash from the repository', () => {
    write('docs/README.md', TAGGED)

    updateStatsOnFile('/docs/README.md', 'new stats')
    pushUpdatedFile('/docs/README.md', [])

    expect(fs.readFileSync(path.join(ws, 'docs/README.md'), 'utf8')).toContain(
      'new stats'
    )
    expect(remoteFiles()).toEqual(['docs/README.md'])
  })

  it('keeps an absolute display-file that is inside the repository', () => {
    updateStatsOnFile(path.join(ws, 'README.md'), 'new stats')

    expect(fs.readFileSync(path.join(ws, 'README.md'), 'utf8')).toContain(
      'new stats'
    )
  })

  it('refuses a leading-slash display-file that climbs out', () => {
    expect(() => updateStatsOnFile('/../outside.md', 'x')).toThrow(
      'display-file must stay inside the repository'
    )
  })

  it('succeeds on a detached HEAD when nothing changed', () => {
    run(ws, 'checkout', '-q', '--detach')

    expect(() => pushUpdatedFile('README.md', [])).not.toThrow()
    expect(remoteLog()).toBe('t|init')
  })

  it('reports an ignored card instead of silently skipping it', () => {
    write('.gitignore', 'cards/\n')
    run(ws, 'add', '.gitignore')
    run(
      ws,
      '-c',
      'user.name=t',
      '-c',
      'user.email=t@t',
      'commit',
      '-qm',
      'ignore'
    )
    run(ws, 'push', '-q', 'origin', 'main')
    write('cards/TScard-light.png', 'light')

    expect(() =>
      pushUpdatedFile('README.md', ['cards/TScard-light.png'])
    ).toThrow('git add failed')
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

  it('reports a real git error instead of a detached HEAD', () => {
    const plain = path.join(tmp, 'plain')
    fs.mkdirSync(plain)
    fs.writeFileSync(path.join(plain, 'README.md'), TAGGED)
    // Keep git from finding a repository in a parent folder.
    process.env.GIT_CEILING_DIRECTORIES = tmp
    process.env.GITHUB_WORKSPACE = plain

    let message = ''
    try {
      pushUpdatedFile('README.md', [])
    } catch (error) {
      message = error.message
    }
    delete process.env.GIT_CEILING_DIRECTORIES

    expect(message).toContain('git status failed: fatal: not a git')
    expect(message).not.toContain('detached')
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
      // Hooks are off for this push: they would inherit the token.
      expect(args).toEqual([
        '-c',
        'core.hooksPath=/dev/null',
        'push',
        'origin',
        'HEAD:refs/heads/main'
      ])
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

    it.each(['pre-commit', 'commit-msg', 'post-commit', 'pre-push'])(
      'does not run a %s hook that could read the token',
      hook => {
        fs.writeFileSync(
          path.join(ws, '.git', 'hooks', hook),
          `#!/bin/sh\nenv > "${path.join(tmp, 'leak')}"\n`,
          { mode: 0o755 }
        )
        write('README.md', 'updated')

        pushUpdatedFile('README.md', [], token)

        expect(fs.existsSync(path.join(tmp, 'leak'))).toBe(false)
        expect(remoteFiles()).toEqual(['README.md'])
      }
    )

    it('keeps tokens out of the environment of every git command', () => {
      process.env.GITHUB_TOKEN = 'env-token'
      process.env.INPUT_TOKEN = token
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      const gitCalls = execFileSync.mock.calls.filter(([cmd]) => cmd === 'git')
      expect(gitCalls.length).toBeGreaterThan(3)
      for (const [, , options] of gitCalls) {
        expect(options.env.GITHUB_TOKEN).toBeUndefined()
        expect(options.env.INPUT_TOKEN).toBeUndefined()
      }
    })

    it('refuses an LFS-tracked card before changing anything', () => {
      write('.gitattributes', '*.png filter=lfs diff=lfs merge=lfs -text\n')
      run(ws, 'add', '.gitattributes')
      run(
        ws,
        '-c',
        'user.name=t',
        '-c',
        'user.email=t@t',
        'commit',
        '-qm',
        'lfs'
      )
      write('TScard-light.png', 'light')

      expect(() =>
        pushUpdatedFile('README.md', ['TScard-light.png'], token)
      ).toThrow('tracked by Git LFS')
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('lfs')
      expect(run(ws, 'diff', '--cached', '--name-only')).toBe('')
    })

    it('refuses an unpushed commit with an LFS file', () => {
      write('.gitattributes', '*.bin filter=lfs diff=lfs merge=lfs -text\n')
      write('data.bin', 'binary')
      run(ws, 'add', '.')
      run(
        ws,
        '-c',
        'user.name=t',
        '-c',
        'user.email=t@t',
        'commit',
        '-qm',
        'lfs'
      )
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'this push includes files tracked by Git LFS'
      )
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('lfs')
      expect(remoteLog()).toBe('t|init')
    })

    it('commits the first file of an unborn branch', () => {
      run(ws, 'checkout', '-q', '--orphan', 'stats')
      run(ws, 'rm', '-rfq', '--cached', '.')
      write('README.md', TAGGED)

      pushUpdatedFile('README.md', [], token)

      expect(run(remote, 'log', '--format=%s', 'stats')).toBe(
        'Update Trailhead Stats in README.md'
      )
    })

    it('works with a file named HEAD at the repository root', () => {
      write('HEAD', 'not a revision')
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      expect(remoteFiles()).toEqual(['README.md'])
    })

    it('still pushes an unpushed commit without LFS files', () => {
      write('notes.txt', 'notes')
      run(ws, 'add', '.')
      run(
        ws,
        '-c',
        'user.name=t',
        '-c',
        'user.email=t@t',
        'commit',
        '-qm',
        'notes'
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      expect(
        run(remote, 'log', '--format=%s', '-2', 'main').split('\n')
      ).toEqual(['Update Trailhead Stats in README.md', 'notes'])
    })

    it.each([
      ['plain HTTP', 'http://github.com/o/r.git', 'origin uses plain HTTP'],
      [
        'another host',
        'https://gitlab.example/o/r.git',
        'origin is on another host'
      ]
    ])('refuses the token input with %s', (_label, url, message) => {
      run(ws, 'remote', 'set-url', 'origin', url)
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(message)
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('init')
    })

    it('leaves an env token unused for another host', () => {
      process.env.GITHUB_TOKEN = token
      run(ws, 'remote', 'set-url', 'origin', 'https://gitlab.example/o/r.git')
      execFileSync.mockImplementation((cmd, args, options) =>
        args.includes('push') ? '' : realExecFileSync(cmd, args, options)
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      expect(pushCall()[2].env.GIT_CONFIG_COUNT).toBeUndefined()
    })

    it.each([
      'git@github.com:o/r.git',
      'github.com:o/r.git',
      'ssh://git@github.com/o/r.git',
      'git+ssh://git@github.com/o/r.git'
    ])('refuses the token input with the SSH remote %s', url => {
      run(ws, 'remote', 'set-url', 'origin', url)
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'the token input only works with an HTTPS remote'
      )
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('init')
    })

    it('pushes with the SSH key when only an env token exists', () => {
      process.env.GITHUB_TOKEN = token
      run(ws, 'remote', 'set-url', 'origin', 'git@github.com:o/r.git')
      execFileSync.mockImplementation((cmd, args, options) =>
        args.includes('push') ? '' : realExecFileSync(cmd, args, options)
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      const [, args, options] = pushCall()
      expect(args).toEqual(['push', 'origin', 'HEAD:refs/heads/main'])
      expect(options.env.GIT_CONFIG_COUNT).toBeUndefined()
    })

    it('ignores sslVerify=false set for another host', () => {
      run(ws, 'remote', 'set-url', 'origin', 'https://github.com/o/r.git')
      run(ws, 'config', 'http.https://git.corp.example/.sslVerify', 'false')
      execFileSync.mockImplementation((cmd, args, options) =>
        args.includes('push') ? '' : realExecFileSync(cmd, args, options)
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      expect(pushCall()).toBeDefined()
    })

    it.each([
      ['http.sslVerify', 'false'],
      ['http.https://github.com/.sslVerify', 'no']
    ])('refuses to send it when %s is %s', (key, value) => {
      run(ws, 'remote', 'set-url', 'origin', 'https://github.com/o/r.git')
      run(ws, 'config', key, value)
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'refusing to send the token with TLS verification disabled'
      )
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('init')
    })

    it('refuses to send it with GIT_SSL_NO_VERIFY', () => {
      process.env.GIT_SSL_NO_VERIFY = '1'
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'TLS verification disabled (GIT_SSL_NO_VERIFY)'
      )
    })

    it('accepts an explicit http.sslVerify=true', () => {
      // A local remote has no TLS: the setting is simply not consulted.
      run(ws, 'config', 'http.sslVerify', 'true')
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], token)

      expect(remoteFiles()).toEqual(['README.md'])
    })

    it('reports an invalid http.sslVerify instead of ignoring it', () => {
      run(ws, 'remote', 'set-url', 'origin', 'https://github.com/o/r.git')
      run(ws, 'config', 'http.sslVerify', 'maybe')
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'git config failed'
      )
    })

    it('keeps hooks when no token is injected (e.g. Git LFS pre-push)', () => {
      const hooks = path.join(ws, '.git', 'hooks')
      fs.writeFileSync(
        path.join(hooks, 'pre-push'),
        `#!/bin/sh\ntouch "${path.join(tmp, 'ran')}"\n`,
        { mode: 0o755 }
      )
      run(
        ws,
        'config',
        'http.https://github.com/.extraheader',
        'AUTHORIZATION: basic x'
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      expect(fs.existsSync(path.join(tmp, 'ran'))).toBe(true)
    })

    it('falls back to a GITHUB_TOKEN in the env when checkout persisted nothing', () => {
      process.env.GITHUB_TOKEN = token
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      expect(pushCall()[2].env.GIT_CONFIG_VALUE_1).toBe(
        `AUTHORIZATION: basic ${basic}`
      )
    })

    it('keeps the persisted credentials over a GITHUB_TOKEN in the env', () => {
      process.env.GITHUB_TOKEN = token
      run(
        ws,
        'config',
        'http.https://github.com/.extraheader',
        'AUTHORIZATION: basic x'
      )
      write('README.md', 'updated')

      pushUpdatedFile('README.md', [], '')

      expect(pushCall()[2].env.GIT_CONFIG_COUNT).toBeUndefined()
    })

    it('refuses a token with a git too old for env config', () => {
      execFileSync.mockImplementation((cmd, args, options) =>
        args[0] === '--version'
          ? 'git version 2.30.2\n'
          : realExecFileSync(cmd, args, options)
      )
      write('README.md', 'updated')

      expect(() => pushUpdatedFile('README.md', [], token)).toThrow(
        'the token input needs git 2.31 or newer, found 2.30'
      )
      // Checked before the commit: nothing is left behind.
      expect(run(ws, 'log', '--format=%s', '-1')).toBe('init')
      expect(remoteLog()).toBe('t|init')
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
