const core = require('@actions/core')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function updateStatsOnFile(displayFile, dataContent) {
  const filePath = path.join(__dirname, '../', displayFile)
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
    const newContent = `${startTag}\n${dataContent}${endTag}`

    // Replace the content between the tags
    fileContent =
      fileContent.substring(0, startTagIndex) +
      newContent +
      fileContent.substring(endTagIndex + endTag.length)

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf8')
    console.log('File updated successfully.')
    console.log(`fileContent : ${fileContent}`)
  } catch (error) {
    console.error('Error updating the file:', error)
    core.setFailed(error.message)
  }
}

function pushUpdatedFile(displayFile) {
  const filePath = path.join(__dirname, '../', displayFile)
  const branchRef = process.env.GITHUB_REF
  const branchName = branchRef.replace('refs/heads/', '')
  const githubToken = process.env.GITHUB_TOKEN

  console.log('Current branch name:', branchName)

  try {
    execSync(`git config --global user.name "Trailhead-Stats"`)
    execSync(
      `git config --global user.email "Trailhead-Stats@noreply.github.com"`
    )
    execSync(
      `git remote set-url origin https://x-access-token:${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}`
    )
    execSync(`git add ${filePath}`)
    execSync(`git commit -m "Update Trailhead Stats in ${displayFile}"`)
    execSync(`git push origin ${branchName}`)

    console.log('Changes pushed to branch: ', branchName)
  } catch (error) {
    console.error('Error pushing changes: ', error)
    core.setFailed(error.message)
  }
}

module.exports = { updateStatsOnFile, pushUpdatedFile }
