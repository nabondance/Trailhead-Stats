const core = require('@actions/core')
const github = require('@actions/github')
const displayStats = require('./displayStats')
const { updateStatsOnFile, pushUpdatedFile } = require('./updateFile')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo
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
    core.info(`Getting stats for ${trailheadUsername}`)

    // Get stats
    const thRank = await fetchTrailblazerRankInfo(trailheadUsername)
    // core.info(`thRank (full object): ${JSON.stringify(thRank)}`)

    const thBadges = await fetchTrailblazerBadgesInfo(trailheadUsername)
    // core.info(`thBadges (full object): ${JSON.stringify(thBadges)}`)

    const thSuperBadges =
      await fetchTrailblazerSuperBadgesInfo(trailheadUsername)
    // core.info(`thSuperBadges (full object): ${JSON.stringify(thSuperBadges)}`)

    const thCertifs = await fetchTrailblazerCertifsInfo(trailheadUsername)
    // core.info(`thCertifs (full object): ${JSON.stringify(thCertifs)}`)

    const thSkills = await fetchTrailblazerSkillsInfo(trailheadUsername)
    // core.info(`thSkills (full object): ${JSON.stringify(thSkills)}`)

    core.info(`All stats received.`)

    // Update Readme
    const dataContent = displayStats(
      displayFile,
      displayType,
      thRank,
      thBadges,
      thSuperBadges,
      thCertifs,
      thSkills
    )

    // Update stats on file
    updateStatsOnFile(displayFile, dataContent)

    // Update file on branch
    pushUpdatedFile(displayFile)

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
