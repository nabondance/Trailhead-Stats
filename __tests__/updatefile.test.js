const { updateStatsOnFile, pushUpdatedFile } = require('./../src/updateFile')
const core = require('@actions/core')
const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs')

  return {
    ...originalModule,
    promises: {
      readFile: jest.fn().mockResolvedValue('mock file content'),
      writeFile: jest.fn().mockResolvedValue()
    },
    readFileSync: jest.fn().mockReturnValue('mock file content'),
    writeFileSync: jest.fn().mockReturnValue()
  }
})

jest.mock('child_process', () => ({
  execSync: jest.fn()
}))
jest.mock('@actions/core')
jest.mock('axios')

describe('Update File Tests', () => {
  const mockDisplayFile = 'readme.md'
  const mockDataContent = 'New stats data'
  const mockFilePath = path.join(__dirname, '../', mockDisplayFile)

  beforeEach(() => {
    jest.resetAllMocks()
    execSync.mockClear()
    process.env.GITHUB_REF = 'refs/heads/main'
    process.env.GITHUB_TOKEN = 'fake-token'
    process.env.GITHUB_REPOSITORY = 'user/repo'
  })

  describe('updateStatsOnFile', () => {
    it('should update file content successfully', () => {
      const mockFileContent = `Old content\n<!--TH_Stats:start-->old stats<!--TH_Stats:end-->\nMore old content`
      fs.readFileSync.mockReturnValue(mockFileContent)
      fs.writeFileSync.mockReturnValue(undefined)

      updateStatsOnFile(mockDisplayFile, mockDataContent)

      expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockFilePath,
        expect.stringContaining(mockDataContent),
        'utf8'
      )
    })

    it('should throw an error if tags are not found', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      fs.readFileSync.mockReturnValue('No tags here')
      updateStatsOnFile(mockDisplayFile, mockDataContent)

      expect(core.setFailed).toHaveBeenCalledWith(expect.any(String))
    })
  })

  describe('pushUpdatedFile', () => {
    it('should push updated file successfully when there are changes', () => {
      // Simulate git status showing changes
      execSync.mockImplementation(cmd => {
        if (cmd === 'git status --porcelain') {
          return 'M somefile'
        }
        return ''
      })

      pushUpdatedFile(mockDisplayFile)

      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git add'))
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git commit')
      )
      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git push'))
    })

    it('should not push when there are no changes', () => {
      // Simulate git status showing no changes
      execSync.mockImplementation(cmd => {
        if (cmd === 'git status --porcelain') {
          return ''
        }
        return ''
      })

      pushUpdatedFile(mockDisplayFile)

      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git add'))
      expect(execSync).not.toHaveBeenCalledWith(
        expect.stringContaining('git commit')
      )
      expect(execSync).not.toHaveBeenCalledWith(
        expect.stringContaining('git push')
      )
    })

    it('should handle git command failure', () => {
      execSync.mockImplementation(() => {
        throw new Error('Git command failed')
      })

      pushUpdatedFile(mockDisplayFile)

      expect(core.setFailed).toHaveBeenCalledWith('Git command failed')
    })
  })
})
