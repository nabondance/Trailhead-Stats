const core = require('@actions/core')
const { displayStats } = require('./displayStats')
const { ActionInputs } = require('./actionInputs')
const { updateStatsOnFile, pushUpdatedFile } = require('./updateFile')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
} = require('./getStats')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const inputs = new ActionInputs()
    core.debug(`Getting stats for ${inputs.trailheadUsername}`)

    // Get stats
    const thRank = await fetchTrailblazerRankInfo(inputs.trailheadUsername)
    const thBadges = await fetchTrailblazerBadgesInfo(inputs.trailheadUsername)
    const thSuperBadges = await fetchTrailblazerSuperBadgesInfo(
      inputs.trailheadUsername
    )
    const thEventBadges = await fetchTrailblazerEventBadgesInfo(
      inputs.trailheadUsername
    )
    const thCertifs = await fetchTrailblazerCertifsInfo(
      inputs.trailheadUsername
    )
    const thSkills = await fetchTrailblazerSkillsInfo(inputs.trailheadUsername)
    const thEarnedStamps = await fetchTrailblazerEarnedStampsInfo(
      inputs.trailheadUsername
    )
    core.debug(`All stats received.`)

    // Update Readme
    const dataContent = await displayStats(
      inputs,
      thRank,
      thBadges,
      thSuperBadges,
      thEventBadges,
      thCertifs,
      thSkills,
      thEarnedStamps
    )

    // Update file if wanted
    if (inputs.outputOnly === 'false') {
      // Update stats on file
      updateStatsOnFile(inputs.displayFile, dataContent)

      // Commit file if wanted
      if (inputs.noCommit === 'false') {
        // Update file on branch
        pushUpdatedFile(inputs.displayFile, inputs.cardPath)
      }
    }

    const encodedOutput = Buffer.from(JSON.stringify(dataContent)).toString(
      'base64'
    )
    core.setOutput('stats', encodedOutput)
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
