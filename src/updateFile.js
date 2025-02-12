const core = require('@actions/core')
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
    core.debug('File updated successfully.')
  } catch (error) {
    console.error('Error updating the file:', error)
    core.setFailed(error.message)
  }
}

function pushUpdatedFile(displayFile, cardPath) {
  const filePathWs = path.join(process.env.GITHUB_WORKSPACE, displayFile)
  const branchRef = process.env.GITHUB_REF
  const branchName = branchRef.replace('refs/heads/', '')
  const githubToken = process.env.GITHUB_TOKEN

  try {
    execSync(`git config --global user.name "Trailhead-Stats"`)
    execSync(
      `git config --global user.email "Trailhead-Stats@noreply.github.com"`
    )
    execSync(
      `git remote set-url origin https://x-access-token:${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}`
    )
    execSync(`git add ${filePathWs}`)

    if (cardPath !== undefined) {
      const cardPathWs = path.join(process.env.GITHUB_WORKSPACE, cardPath)
      execSync(`git add ${cardPathWs}/*`)
    }

    // Check if there are any changes
    const status = execSync('git status --porcelain').toString()
    if (status === '') {
      core.debug('No changes detected. Skipping commit and push.')
      return
    }

    execSync(`git commit -m "Update Trailhead Stats in ${displayFile}"`)
    execSync(`git push origin ${branchName}`)

    core.debug('Changes pushed to branch: ', branchName)
  } catch (error) {
    console.error('Error pushing changes: ', error)
    core.setFailed(error.message)
  }
}

module.exports = { updateStatsOnFile, pushUpdatedFile }
