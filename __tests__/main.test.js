/**
 * run() must fail closed: if any step fails, nothing is written or committed.
 */
const core = require('@actions/core')
const getStats = require('../src/getStats')
const updateFile = require('../src/updateFile')
const cardGenerator = require('../src/cardGenerator')
const { readActionInputs } = require('../scripts/agent/lib/action-yml')
const { fullProfile } = require('./fixtures/trailhead')
const main = require('../src/main')

jest.mock('@actions/core')
jest.mock('../src/getStats')
jest.mock('../src/updateFile', () => ({
  ...jest.requireActual('../src/updateFile'),
  updateStatsOnFile: jest.fn(),
  pushUpdatedFile: jest.fn()
}))
jest.mock('../src/cardGenerator', () => ({
  ...jest.requireActual('../src/cardGenerator'),
  generateCard: jest.fn()
}))

const FETCHERS = [
  'fetchTrailblazerRankInfo',
  'fetchTrailblazerBadgesInfo',
  'fetchTrailblazerSuperBadgesInfo',
  'fetchTrailblazerEventBadgesInfo',
  'fetchTrailblazerCertifsInfo',
  'fetchTrailblazerSkillsInfo',
  'fetchTrailblazerEarnedStampsInfo'
]

const defaults = Object.fromEntries(
  [...readActionInputs()].map(([name, spec]) => [name, spec.default])
)

function setInputs(overrides = {}) {
  const values = {
    ...defaults,
    'trailhead-username': 'thUsername',
    'no-commit': 'false',
    token: 'gh-token',
    ...overrides
  }
  core.getInput.mockImplementation(name => values[name] ?? '')
}

function expectNothingWritten() {
  expect(updateFile.updateStatsOnFile).not.toHaveBeenCalled()
  expect(updateFile.pushUpdatedFile).not.toHaveBeenCalled()
  expect(core.setOutput).not.toHaveBeenCalled()
}

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const profile = fullProfile()
    FETCHERS.forEach((name, i) => getStats[name].mockResolvedValue(profile[i]))
    cardGenerator.generateCard.mockImplementation(
      async (_data, inputs, theme) => `${inputs.cardPath}/TScard-${theme}.png`
    )
  })

  it('updates, commits and outputs the stats', async () => {
    setInputs()

    await main.run()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(updateFile.updateStatsOnFile).toHaveBeenCalledWith(
      'README.md',
      expect.stringContaining('Rank')
    )
    // Text mode commits the display file only, with the token input.
    expect(updateFile.pushUpdatedFile).toHaveBeenCalledWith(
      'README.md',
      [],
      'gh-token'
    )
    expect(core.setOutput).toHaveBeenCalledWith('stats', expect.any(String))
  })

  it('renders a card without writing when output-only is set', async () => {
    setInputs({ 'display-type': 'card', 'output-only': 'true' })

    await main.run()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(cardGenerator.generateCard).toHaveBeenCalledTimes(2)
    expect(updateFile.updateStatsOnFile).not.toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalledWith('stats', expect.any(String))
  })

  it('commits only the two card images for a card', async () => {
    setInputs({ 'display-type': 'card', 'card-path': 'images' })

    await main.run()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(updateFile.pushUpdatedFile).toHaveBeenCalledWith(
      'README.md',
      ['images/TScard-light.png', 'images/TScard-dark.png'],
      'gh-token'
    )
  })

  it('writes nothing when card-path leaves the repository', async () => {
    setInputs({ 'display-type': 'card', 'card-path': '../outside' })

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Error generating the card: card-path must stay inside the repository, got: ../outside'
    )
    expect(cardGenerator.generateCard).not.toHaveBeenCalled()
    expectNothingWritten()
  })

  it('does not commit when no-commit is set', async () => {
    setInputs({ 'no-commit': 'true' })

    await main.run()

    expect(updateFile.updateStatsOnFile).toHaveBeenCalled()
    expect(updateFile.pushUpdatedFile).not.toHaveBeenCalled()
  })

  it.each(FETCHERS)('writes nothing when %s fails', async name => {
    setInputs()
    getStats[name].mockRejectedValue(
      new Error('Could not fetch Trailhead data: boom')
    )

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Could not fetch Trailhead data: boom'
    )
    expectNothingWritten()
  })

  it('writes nothing when the rank stats are null', async () => {
    setInputs()
    getStats.fetchTrailblazerRankInfo.mockResolvedValue({
      data: { profile: { trailheadStats: null } }
    })

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('missing: trailheadStats')
    )
    expectNothingWritten()
  })

  it('writes nothing when the card times out', async () => {
    setInputs({ 'display-type': 'card' })
    cardGenerator.generateCard.mockRejectedValue(
      new Error('Navigation timeout of 30000 ms exceeded')
    )

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Error generating the card: Navigation timeout of 30000 ms exceeded'
    )
    expectNothingWritten()
  })

  it('does not push when the file update fails', async () => {
    setInputs()
    updateFile.updateStatsOnFile.mockImplementation(() => {
      throw new Error('Error updating README.md: tags not found')
    })

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Error updating README.md: tags not found'
    )
    expect(updateFile.pushUpdatedFile).not.toHaveBeenCalled()
    expect(core.setOutput).not.toHaveBeenCalled()
  })

  it('stops before fetching when an input is invalid', async () => {
    setInputs({ 'display-type': 'svg' })

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Invalid display-type 'svg'")
    )
    expect(getStats.fetchTrailblazerRankInfo).not.toHaveBeenCalled()
    expectNothingWritten()
  })
})
