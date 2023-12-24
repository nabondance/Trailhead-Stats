const core = require('@actions/core')
const github = require('@actions/github')
const main = require('../src/main')

// Mock the GitHub Actions core library
const infoMock = jest.spyOn(core, 'info').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

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
