const core = require('@actions/core')
const path = require('path')
const { generateCard } = require('./cardGenerator')

async function displayStats(
  inputs,
  thRank,
  thBadges,
  thSuperBadges,
  thCertifs,
  thSkills,
  thEarnedStamps
) {
  core.info(`Will update the file: ${inputs.displayFile}`)
  core.info(`Starting to display with type: ${inputs.displayType}`)

  const dataToFormat = prepareData(
    thRank,
    thBadges,
    thSuperBadges,
    thCertifs,
    thSkills,
    thEarnedStamps
  )

  let dataContent
  if (inputs.displayType === 'text') {
    dataContent = displayStatsText(inputs, dataToFormat)
  } else if (inputs.displayType === 'output') {
    dataContent = displayStatsOutput(dataToFormat)
  } else if (inputs.displayType === 'card') {
    dataContent = await displayStatsCard(inputs, dataToFormat)
  } else {
    core.setFailed(`${inputs.displayType} is not an accepted type`)
  }

  return dataContent
}

function prepareData(
  thRank,
  thBadges,
  thSuperBadges,
  thCertifs,
  thSkills,
  thEarnedStamps
) {
  // Prepare dataToFormat
  const trailheadStats = thRank?.data?.profile.trailheadStats
  const trailheadBadges = thBadges?.data?.profile
  const trailheadSuperBadges = thSuperBadges?.data?.profile
  const trailheadCertif = thCertifs?.data?.profile.credential.certifications
  const trailheadSkills = thSkills?.data?.profile.earnedSkills
  const trailheadEarnedStamps = thEarnedStamps?.data?.earnedStamps

  if (trailheadStats === undefined) {
    core.setFailed(trailheadStats)
  }

  // Work on data
  // Badges
  const badgeDetails = trailheadBadges.earnedAwards.edges.map(edge => ({
    title: edge.node.award.title,
    iconUrl: edge.node.award.icon,
    webUrl: edge.node.award.content?.webUrl
  }))

  // SuperBadges
  const superbadgeDetails = trailheadSuperBadges.earnedAwards.edges.map(
    edge => ({
      title: edge.node.award.title,
      iconUrl: edge.node.award.icon,
      webUrl: edge.node.award.content?.webUrl
    })
  )

  // Certifs
  const certificationsDetails = trailheadCertif.map(cert => ({
    title: cert.title,
    dateCompleted: cert.dateCompleted,
    status: cert.status.title,
    logoUrl: cert.logoUrl
  }))
  const sortedCertifications = certificationsDetails
    .filter(cert => new Date(cert.dateCompleted) !== 'Invalid Date')
    .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))
  const lastCertification =
    sortedCertifications.length > 0 ? sortedCertifications[0] : null

  // Skills
  const skillPointsDetails = trailheadSkills.map(skill => ({
    name: skill.skill.name,
    points: skill.earnedPointsSum
  }))

  // Data ready to be used
  const dataToFormat = {
    rank: trailheadStats?.rank.title,
    rankIcon: trailheadStats?.rank.imageUrl,
    nbBadges: trailheadStats?.earnedBadgesCount,
    badgeDetails,
    lastBadge: badgeDetails[0]?.title,
    points: trailheadStats?.earnedPointsSum,
    trails: trailheadStats?.completedTrailCount,
    nbSuperBadges: trailheadSuperBadges?.trailheadStats.superbadgeCount,
    superbadgeDetails,
    lastSuperbadge: superbadgeDetails[0]?.title,
    nbCertifs: trailheadCertif?.length,
    certificationsDetails,
    lastCertif: lastCertification?.title,
    skillPointsDetails,
    nbEarnedStamps: trailheadEarnedStamps?.count
  }

  return dataToFormat
}

function displayStatsText(inputs, dataToFormat) {
  switch (inputs.fileFormat) {
    case 'md':
      return displayStatsTextMd(dataToFormat)
    case 'html':
      return displayStatsTextHtml(dataToFormat)
  }
}

function displayStatsTextMd(dataToFormat) {
  let dataContent = ''

  // Add info to the dataContent
  dataContent += `Rank: ${dataToFormat.rank}  \n`
  dataContent += `Badges: ${dataToFormat.nbBadges}  \n`
  dataContent += `Points: ${dataToFormat.points}  \n`
  dataContent += `Number of trails completed: ${dataToFormat.trails}  \n`
  dataContent += `Number of Superbadge: ${dataToFormat.nbSuperBadges}  \n`
  dataContent += `Last Superbadge earned: ${dataToFormat.lastSuperbadge}  \n`
  dataContent += `Number of Certification: ${dataToFormat.nbCertifs}  \n`
  dataContent += `Last Certification earned: ${dataToFormat.lastCertif}  \n`
  dataContent += `Number of Stamps Earned: ${dataToFormat.nbEarnedStamps}  \n`

  core.info(`Stats to be displayed:\n${dataContent}`)

  return dataContent
}

function displayStatsTextHtml(dataToFormat) {
  let dataContent = `<ul>`

  // Add info to the dataContent
  dataContent += `<li>Rank: ${dataToFormat.rank}</li>\n`
  dataContent += `<li>Badges: ${dataToFormat.nbBadges}</li>\n`
  dataContent += `<li>Points: ${dataToFormat.points}</li>\n`
  dataContent += `<li>Number of trails completed: ${dataToFormat.trails}</li>\n`
  dataContent += `<li>Number of Superbadge: ${dataToFormat.nbSuperBadges}</li>\n`
  dataContent += `<li>Last Superbadge earned: ${dataToFormat.lastSuperbadge}</li>\n`
  dataContent += `<li>Number of Certification: ${dataToFormat.nbCertifs}</li>\n`
  dataContent += `<li>Last Certification earned: ${dataToFormat.lastCertif}</li>\n`
  dataContent += `<li>Number of Stamps Earned: ${dataToFormat.nbEarnedStamps}</li>\n`
  dataContent += `</ul>`

  core.info(`Stats to be displayed:\n${dataContent}`)
  return dataContent
}

function displayStatsOutput(dataToFormat) {
  core.info(`Stats to be displayed:\n${JSON.stringify(dataToFormat)}`)
  return dataToFormat
}

async function displayStatsCard(inputs, dataToFormat) {
  try {
    // Await the generation of the card and get the full path
    const fullPath = await generateCard(dataToFormat, inputs.cardPath)
    console.log(`Card image saved at ${fullPath}`)

    // Construct the image display depending on the file format
    let dataContent = ''
    switch (inputs.fileFormat) {
      case 'md':
        dataContent = `![Trailhead-Stats](${fullPath})`
        break
      case 'html':
        dataContent = `<a href="https://www.salesforce.com/trailblazer/${inputs.trailheadUsername}"><img src="${fullPath}"></a>`
        break
    }
    return dataContent
  } catch (err) {
    console.error(`Error generating the card: ${err}`)
    core.setFailed(`Error generating the card: ${err}`)
  }
}

module.exports = displayStats
