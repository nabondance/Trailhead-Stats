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

  // Stamps
  const earnedStampsDetails = trailheadEarnedStamps?.edges.map(edge => ({
    name: edge.node.name,
    eventDate: edge.node.eventDate,
    kind: edge.node.kind,
    iconUrl: edge.node.iconUrl
  }))
  const sortedEarnedStamps = earnedStampsDetails
    .filter(stamp => new Date(stamp.eventDate) !== 'Invalid Date')
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
  const lastEarnedStamps =
    sortedEarnedStamps.length > 0 ? sortedEarnedStamps[0] : null

  // Data ready to be used
  const dataToFormat = {
    rank: trailheadStats?.rank.title,
    rankIcon: trailheadStats?.rank.imageUrl,
    points: trailheadStats?.earnedPointsSum,
    trails: trailheadStats?.completedTrailCount,
    badgeDetails,
    nbBadges: trailheadStats?.earnedBadgesCount,
    lastBadge: badgeDetails[0]?.title,
    superbadgeDetails,
    nbSuperBadges: trailheadSuperBadges?.trailheadStats.superbadgeCount,
    lastSuperbadge: superbadgeDetails[0]?.title,
    certificationsDetails,
    nbCertifs: trailheadCertif?.length,
    lastCertif: lastCertification?.title,
    skillPointsDetails,
    nbEarnedStamps: trailheadEarnedStamps?.count,
    lastEarnedStamps: lastEarnedStamps?.name,
    earnedStampsDetails
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
  dataContent += appDC('Rank', dataToFormat.rank)
  dataContent += appDC('Badges', dataToFormat.nbBadges)
  dataContent += appDC('Points', dataToFormat.points)
  dataContent += appDC('Number of trails completed', dataToFormat.trails)
  dataContent += appDC('Number of Superbadge', dataToFormat.nbSuperBadges)
  dataContent += appDC('Last Superbadge earned', dataToFormat.lastSuperbadge)
  dataContent += appDC('Number of Certification', dataToFormat.nbCertifs)
  dataContent += appDC('Last Certification earned', dataToFormat.lastCertif)
  dataContent += appDC('Main skill', dataToFormat.skillPointsDetails[0]?.name)
  dataContent += appDC('Number of Stamps Earned', dataToFormat.nbEarnedStamps)
  dataContent += appDC('Last Stamp earned', dataToFormat.lastEarnedStamps)

  core.info(`Stats to be displayed:\n${dataContent}`)

  return dataContent
}

function displayStatsTextHtml(dataToFormat) {
  let dataContent = `<ul>`

  // Add info to the dataContent
  dataContent += appDChtml('Rank', dataToFormat.rank)
  dataContent += appDChtml('Badges', dataToFormat.nbBadges)
  dataContent += appDChtml('Points', dataToFormat.points)
  dataContent += appDChtml('Number of trails completed', dataToFormat.trails)
  dataContent += appDChtml('Number of Superbadge', dataToFormat.nbSuperBadges)
  dataContent += appDChtml(
    'Last Superbadge earned',
    dataToFormat.lastSuperbadge
  )
  dataContent += appDChtml('Number of Certification', dataToFormat.nbCertifs)
  dataContent += appDChtml('Last Certification earned', dataToFormat.lastCertif)
  dataContent += appDChtml(
    'Main skill',
    dataToFormat.skillPointsDetails[0]?.name
  )
  dataContent += appDChtml(
    'Number of Stamps Earned',
    dataToFormat.nbEarnedStamps
  )
  dataContent += appDChtml('Last Stamp earned', dataToFormat.lastEarnedStamps)
  dataContent += '</ul>'

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

function appDC(propertyLabel, propertyValue) {
  if (propertyValue !== undefined && propertyValue !== null) {
    return ` ${propertyLabel}: ${propertyValue}\n`
  }
  return ''
}

function appDChtml(propertyLabel, propertyValue) {
  if (propertyValue !== undefined && propertyValue !== null) {
    return `<li>${propertyLabel}: ${propertyValue}</li>\n`
  }
  return ''
}

module.exports = displayStats
