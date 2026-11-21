/**
 * v2 output baseline. The snapshot was generated from the v2.0.0 source, so any
 * diff here is a change users will see. Update it only when that is intended:
 * bash scripts/agent/golden.sh --update
 */
const { displayStats } = require('../src/displayStats')
const { generateHtmlContent } = require('../src/cardGenerator')
const {
  fixtureInputs,
  fullProfile,
  emptyProfile
} = require('./fixtures/trailhead')

jest.mock('@actions/core')
jest.mock('puppeteer', () => ({}))

const render = (profile, overrides) =>
  displayStats({ ...fixtureInputs, ...overrides }, ...profile())

describe.each([
  ['full', fullProfile],
  ['empty', emptyProfile]
])('golden output: %s profile', (_name, profile) => {
  it('renders markdown text', async () => {
    expect(
      await render(profile, { displayType: 'text', fileFormat: 'md' })
    ).toMatchSnapshot()
  })

  it('renders html text', async () => {
    expect(
      await render(profile, { displayType: 'text', fileFormat: 'html' })
    ).toMatchSnapshot()
  })

  it('returns the output object', async () => {
    expect(await render(profile, { displayType: 'output' })).toMatchSnapshot()
  })

  it.each(['light', 'dark'])('renders the %s card html', async theme => {
    const data = await render(profile, { displayType: 'output' })
    expect(generateHtmlContent(data, fixtureInputs, theme)).toMatchSnapshot()
  })
})
