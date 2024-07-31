const core = require('@actions/core')
const github = require('@actions/github')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function updateStatsOnFile(displayFile, dataContent) {
  const filePath = path.join(process.env.GITHUB_WORKSPACE, displayFile)
  try {
    // Read the existing content of the file
    let fileContent = fs.readFileSync(filePath, 'utf8')

    // Define the start and end tags
    const startTag = '<!--TH_Stats:start-->'
    const endTag = '<!--TH_Stats:end-->'

    // Find the index of the start and end tags
    const startTagIndex = fileContent.indexOf(startTag)
    const endTagIndex = fileContent.indexOf(endTag, startTagIndex)

    if (startTagIndex === -1 || endTagIndex === -1) {
      throw new Error(`Start or end tag not found in ${displayFile}`)
    }

    // Construct the new content to be placed between the tags
    const newContent = `${startTag}\n${dataContent}\n${endTag}`

    // Replace the content between the tags
    fileContent =
      fileContent.substring(0, startTagIndex) +
      newContent +
      fileContent.substring(endTagIndex + endTag.length)

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf8')
    core.info('File updated successfully.')
  } catch (error) {
    console.error('Error updating the file:', error)
    core.setFailed(error.message)
  }
}

async function pushUpdatedFile(displayFile, cardPath) {
  const displayFileWs = path.join(process.env.GITHUB_WORKSPACE, displayFile)
  const cardPathWs = path.join(process.env.GITHUB_WORKSPACE, cardPath)
  const branchRef = process.env.GITHUB_REF
  const branchName = branchRef.replace('refs/heads/', '')
  const githubToken = process.env.GITHUB_TOKEN
  const octokit = github.getOctokit(githubToken)

  try {
    // Initialize tree array
    const tree = []

    // Create a blob for the displayFile
    const { data: blobDisplayFile } = await octokit.git.createBlob({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      content: fs.readFileSync(displayFileWs, 'utf-8'),
      encoding: 'utf-8'
    })

    // Add the displayFile blob to the tree
    tree.push({
      path: displayFile,
      mode: '100644',
      type: 'blob',
      sha: blobDisplayFile.sha
    })

    // If cardPath exists, create a blob for it and add it to the tree
    if (cardPath !== undefined && fs.existsSync(cardPathWs)) {
      const { data: blobCardFile } = await octokit.git.createBlob({
        owner: process.env.GITHUB_REPOSITORY_OWNER,
        repo: process.env.GITHUB_REPOSITORY,
        content: fs.readFileSync(cardPathWs, 'utf-8'),
        encoding: 'utf-8'
      })

      tree.push({
        path: cardPathWs,
        mode: '100644',
        type: 'blob',
        sha: blobCardFile.sha
      })
    }

    // Get the reference of the branch
    const { data: ref } = await octokit.git.getRef({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      ref: `heads/${branchName}`
    })

    // Get the commit that the branch points to
    const { data: commit } = await octokit.git.getCommit({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      commit_sha: ref.object.sha
    })

    // Create a new tree with the files
    const { data: newTree } = await octokit.git.createTree({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      base_tree: commit.tree.sha,
      tree: tree
    })

    // Create a new commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      message: `Update Trailhead Stats in ${displayFile}`,
      tree: newTree.sha,
      parents: [commit.sha]
    })

    // Update the branch reference to point to the new commit
    await octokit.git.updateRef({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      ref: `heads/${branchName}`,
      sha: newCommit.sha
    })

    core.info('Changes pushed to branch: ', branchName)
  } catch (error) {
    console.error('Error pushing changes: ', error)
    core.setFailed(error.message)
  }
}

module.exports = { updateStatsOnFile, pushUpdatedFile }
