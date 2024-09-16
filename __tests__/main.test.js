const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
jest.mock('@actions/core')
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Do not care about console.error()
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('run the main code', async () => {
    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'trailhead-username':
          return 'thUsername'
        case 'display-file':
          return 'README.md'
        case 'display-type':
          return 'text'
        case 'output-only':
          return 'false'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
  })

  it('run the main code with output only', async () => {
    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'trailhead-username':
          return 'thUsername'
        case 'display-file':
          return 'README.md'
        case 'display-type':
          return 'output'
        case 'output-only':
          return 'true'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
  })

  it('run the main code with card only', async () => {
    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'trailhead-username':
          return 'thUsername'
        case 'display-file':
          return 'README.md'
        case 'display-type':
          return 'card'
        case 'output-only':
          return 'true'
        case 'card-path':
          return 'images/'
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
  })

  it('sets a failed status', async () => {
    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'trailhead-username':
          throw new Error('Something went wrong...')
        default:
          return ''
      }
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith('Something went wrong...')
  })
})
