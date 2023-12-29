const core = require('@actions/core')
const github = require('@actions/github')
const displayStats = require('./displayStats')
const { validateAllInputs } = require('./validateInputs')
const { updateStatsOnFile, pushUpdatedFile } = require('./updateFile')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
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
    const trailheadUsername = core.getInput('trailhead-username', {
      required: true
    })
    const displayFile = core.getInput('display-file', {
      required: false
    })
    const displayType = core.getInput('display-type', {
      required: false
    })
    const outputOnly = core.getInput('output-only', {
      required: false
    })
    validateAllInputs(trailheadUsername, displayFile, displayType, outputOnly)
    core.info(`Getting stats for ${trailheadUsername}`)

    // Get stats
    const thRank = await fetchTrailblazerRankInfo(trailheadUsername)
    const thBadges = await fetchTrailblazerBadgesInfo(trailheadUsername)
    const thSuperBadges =
      await fetchTrailblazerSuperBadgesInfo(trailheadUsername)
    const thCertifs = await fetchTrailblazerCertifsInfo(trailheadUsername)
    const thSkills = await fetchTrailblazerSkillsInfo(trailheadUsername)
    const thEarnedStamps =
      await fetchTrailblazerEarnedStampsInfo(trailheadUsername)
    core.info(`All stats received.`)

    // Update Readme
    const dataContent = displayStats(
      displayFile,
      displayType,
      thRank,
      thBadges,
      thSuperBadges,
      thCertifs,
      thSkills,
      thEarnedStamps
    )

    // Update file if wanted
    if (outputOnly === 'false') {
      // Update stats on file
      updateStatsOnFile(displayFile, dataContent)

      // Update file on branch
      pushUpdatedFile(displayFile)
    }

    //core.setOutput('stats', JSON.stringify(dataContent))
    const encodedOutput = Buffer.from(JSON.stringify(dataContent)).toString(
      'base64'
    )
    core.setOutput('stats', encodedOutput)

    // Output the payload for debugging
    // core.info(
    //   `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    // )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
