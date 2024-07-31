const { updateStatsOnFile, pushUpdatedFile } = require('./../src/updateFile')
const core = require('@actions/core')
const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

// Mocks
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs')
  return {
    ...originalModule,
    existsSync: jest.fn().mockReturnValue(true),
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
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockReturnValue({
    git: {
      createBlob: jest.fn().mockResolvedValue({ data: { sha: 'blobSha' } }),
      getRef: jest
        .fn()
        .mockResolvedValue({ data: { object: { sha: 'refSha' } } }),
      getCommit: jest
        .fn()
        .mockResolvedValue({ data: { tree: { sha: 'treeSha' } } }),
      createTree: jest.fn().mockResolvedValue({ data: { sha: 'newTreeSha' } }),
      createCommit: jest
        .fn()
        .mockResolvedValue({ data: { sha: 'newCommitSha' } }),
      updateRef: jest.fn().mockResolvedValue({})
    }
  })
}))

describe('Update File Tests', () => {
  const mockDisplayFile = 'readme.md'
  const mockCardPath = 'images'
  const mockDataContent = 'New stats data'
  let mockFilePath
  let octokit

  beforeEach(() => {
    jest.resetAllMocks()
    execSync.mockClear()
    process.env.GITHUB_WORKSPACE = '/home/runner/work/nabondance/nabondance'
    process.env.GITHUB_REF = 'refs/heads/main'
    process.env.GITHUB_TOKEN = 'fake-token'
    process.env.GITHUB_REPOSITORY = 'user/repo'
    process.env.GITHUB_REPOSITORY_OWNER = 'user'
    mockFilePath = path.join(process.env.GITHUB_WORKSPACE, mockDisplayFile)

    // Ensure the mocked `getOctokit` returns a valid object with the `git` property
    const github = require('@actions/github')
    github.getOctokit.mockReturnValue({
      git: {
        createBlob: jest.fn().mockResolvedValue({ data: { sha: 'blobSha' } }),
        getRef: jest
          .fn()
          .mockResolvedValue({ data: { object: { sha: 'refSha' } } }),
        getCommit: jest
          .fn()
          .mockResolvedValue({ data: { tree: { sha: 'treeSha' } } }),
        createTree: jest
          .fn()
          .mockResolvedValue({ data: { sha: 'newTreeSha' } }),
        createCommit: jest
          .fn()
          .mockResolvedValue({ data: { sha: 'newCommitSha' } }),
        updateRef: jest.fn().mockResolvedValue({})
      }
    })

    octokit = github.getOctokit(process.env.GITHUB_TOKEN)
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
    it('should push updated file successfully', async () => {
      fs.existsSync.mockReturnValue(true)

      await pushUpdatedFile(mockDisplayFile, mockCardPath)

      expect(octokit.git.createBlob).toHaveBeenCalledTimes(2)
      expect(octokit.git.getRef).toHaveBeenCalledTimes(1)
      expect(octokit.git.getCommit).toHaveBeenCalledTimes(1)
      expect(octokit.git.createTree).toHaveBeenCalledTimes(1)
      expect(octokit.git.createCommit).toHaveBeenCalledTimes(1)
      expect(octokit.git.updateRef).toHaveBeenCalledTimes(1)
    })

    it('should handle error when pushing changes', async () => {
      octokit.git.createBlob.mockRejectedValue(new Error('Create blob failed'))

      await pushUpdatedFile(mockDisplayFile, mockCardPath)

      expect(core.setFailed).toHaveBeenCalledWith('Create blob failed')
    })
  })
})
