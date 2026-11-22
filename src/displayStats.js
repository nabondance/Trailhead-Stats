const core = require('@actions/core')
const os = require('os')
const path = require('path')
const { generateCard, cardFilePath, CARD_THEMES } = require('./cardGenerator')
const {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync
} = require('fs')
const {
  workspacePath,
  workspaceRoot,
  isInWorkspace,
  isLexicallyInWorkspace,
  linkFromDisplayFile
} = require('./updateFile')

// Cards that get committed must stay in the repository. Without a commit
// (output-only or no-commit), a folder outside it works, e.g. runner.temp for
// an artifact upload. A path inside it can never escape through a symlink.
function commitsCards(inputs) {
  return inputs.outputOnly === 'false' && inputs.noCommit === 'false'
}

function cardTarget(inputs, file) {
  return commitsCards(inputs) || isLexicallyInWorkspace(file)
    ? workspacePath(file, 'card-path')
    : path.resolve(workspaceRoot(), file)
}

// A link written into the display file is relative to that file, so it works
// from a subfolder. A card outside the repository, only possible without a
// commit, keeps the path it was given.
function cardLink(inputs, file, target) {
  if (inputs.outputOnly !== 'false' || !isInWorkspace(target)) return file
  return linkFromDisplayFile(inputs.displayFile, target)
}

// Copies both cards next to their targets, then renames them into place. A
// failed copy changes nothing, and a rename replaces a symlink instead of
// writing through it.
function replaceCards(staged, targets) {
  for (const theme of CARD_THEMES) {
    if (lstatSync(targets[theme], { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`${path.basename(targets[theme])} is a directory`)
    }
  }
  const swap = mkdtempSync(
    path.join(path.dirname(targets[CARD_THEMES[0]]), '.th-cards-')
  )
  try {
    for (const theme of CARD_THEMES) {
      copyFileSync(staged[theme], path.join(swap, theme))
    }
    for (const theme of CARD_THEMES) {
      renameSync(path.join(swap, theme), targets[theme])
    }
  } finally {
    rmSync(swap, { recursive: true, force: true })
  }
}

async function displayStats(
  inputs,
  thRank,
  thBadges,
  thSuperBadges,
  thEventBadges,
  thCertifs,
  thSkills,
  thEarnedStamps
) {
  core.debug(`Will update the file: ${inputs.displayFile}`)
  core.debug(`Starting to display with type: ${inputs.displayType}`)

  const dataToFormat = prepareData(
    thRank,
    thBadges,
    thSuperBadges,
    thEventBadges,
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
    throw new Error(`${inputs.displayType} is not an accepted type`)
  }

  if (dataContent === undefined || dataContent === null || dataContent === '') {
    throw new Error(
      `Nothing was rendered for display-type ${inputs.displayType}`
    )
  }
  return dataContent
}

function prepareData(
  thRank,
  thBadges,
  thSuperBadges,
  thEventBadges,
  thCertifs,
  thSkills,
  thEarnedStamps
) {
  // Prepare dataToFormat
  const trailheadStats = thRank?.data?.profile?.trailheadStats
  const trailheadBadges = thBadges?.data?.profile
  const trailheadSuperBadges = thSuperBadges?.data?.profile
  const trailheadEventBadges = thEventBadges?.data?.profile
  const trailheadCertif = thCertifs?.data?.profile?.credential?.certifications
  const trailheadSkills = thSkills?.data?.profile?.earnedSkills
  const trailheadEarnedStamps = thEarnedStamps?.data?.earnedStamps

  // Refuse to render from incomplete data: it would show `undefined`.
  const missing = Object.entries({
    trailheadStats,
    badges: trailheadBadges?.earnedAwards?.edges,
    superbadges: trailheadSuperBadges?.earnedAwards?.edges,
    'event badges': trailheadEventBadges?.earnedAwards?.edges,
    certifications: trailheadCertif,
    skills: trailheadSkills,
    stamps: trailheadEarnedStamps?.edges
  })
    .filter(([, value]) => value === undefined || value === null)
    .map(([name]) => name)
  if (missing.length > 0) {
    throw new Error(
      `Trailhead data is incomplete (missing: ${missing.join(', ')}), nothing was rendered`
    )
  }

  // Work on data
  // Badges
  const badgeDetails = trailheadBadges.earnedAwards.edges.map(edge => ({
    title: edge.node.award?.title,
    iconUrl: edge.node.award?.icon,
    webUrl: edge.node.award?.content?.webUrl
  }))

  // SuperBadges
  const superBadgeDetails = trailheadSuperBadges.earnedAwards.edges.map(
    edge => ({
      title: edge.node.award?.title,
      iconUrl: edge.node.award?.icon,
      webUrl: edge.node.award?.content?.webUrl
    })
  )

  // EventBadges
  const eventBadgeDetails = trailheadEventBadges.earnedAwards.edges.map(
    edge => ({
      title: edge.node.award?.title,
      iconUrl: edge.node.award?.icon,
      webUrl: edge.node.award?.content?.webUrl
    })
  )

  // Certifs
  const certificationsDetails = trailheadCertif.map(cert => ({
    title: cert.title,
    dateCompleted: cert.dateCompleted,
    status: cert.status.title,
    iconUrl: cert.logoUrl
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
    title: edge.node.name,
    eventDate: edge.node.eventDate,
    kind:
      edge.node.kind === 'EVENT_IN_PERSON'
        ? edge.node?.eventLocation
        : edge.node.kind === 'EVENT_VIRTUAL'
          ? 'Virtual'
          : edge.node.kind,
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
    superBadgeDetails,
    nbSuperBadges: trailheadSuperBadges?.trailheadStats.superbadgeCount,
    lastSuperBadge: superBadgeDetails[0]?.title,
    eventBadgeDetails,
    nbEventBadges: trailheadEventBadges?.earnedAwards?.edges?.length,
    lastEventBadge: eventBadgeDetails[0]?.title,
    certificationsDetails,
    nbCertifs: trailheadCertif?.length,
    lastCertif: lastCertification?.title,
    skillPointsDetails,
    nbEarnedStamps: trailheadEarnedStamps?.count,
    lastEarnedStamp: lastEarnedStamps?.title,
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
  dataContent += appDC('Number of Certification', dataToFormat.nbCertifs)
  dataContent += appDC('Last Certification earned', dataToFormat.lastCertif)
  dataContent += appDC('Number of Superbadges', dataToFormat.nbSuperBadges)
  dataContent += appDC('Last Superbadge earned', dataToFormat.lastSuperBadge)
  dataContent += appDC('Number of Event Badges', dataToFormat.nbEventBadges)
  dataContent += appDC('Last Event Badge earned', dataToFormat.lastEventBadge)
  dataContent += appDC('Main skill', dataToFormat.skillPointsDetails[0]?.name)
  dataContent += appDC('Number of Stamps Earned', dataToFormat.nbEarnedStamps)
  dataContent += appDC('Last Stamp earned', dataToFormat.lastEarnedStamp)

  core.debug(`Stats to be displayed:\n${dataContent}`)

  return dataContent
}

function displayStatsTextHtml(dataToFormat) {
  let dataContent = `<ul>`

  // Add info to the dataContent
  dataContent += appDChtml('Rank', dataToFormat.rank)
  dataContent += appDChtml('Badges', dataToFormat.nbBadges)
  dataContent += appDChtml('Points', dataToFormat.points)
  dataContent += appDChtml('Number of trails completed', dataToFormat.trails)
  dataContent += appDChtml('Number of Certification', dataToFormat.nbCertifs)
  dataContent += appDChtml('Last Certification earned', dataToFormat.lastCertif)
  dataContent += appDChtml('Number of Superbadges', dataToFormat.nbSuperBadges)
  dataContent += appDChtml(
    'Last Superbadge earned',
    dataToFormat.lastSuperBadge
  )
  dataContent += appDChtml('Number of Event Badges', dataToFormat.nbEventBadges)
  dataContent += appDChtml(
    'Last Event Badge earned',
    dataToFormat.lastEventBadge
  )
  dataContent += appDChtml(
    'Main skill',
    dataToFormat.skillPointsDetails[0]?.name
  )
  dataContent += appDChtml(
    'Number of Stamps Earned',
    dataToFormat.nbEarnedStamps
  )
  dataContent += appDChtml('Last Stamp earned', dataToFormat.lastEarnedStamp)
  dataContent += '</ul>'

  core.debug(`Stats to be displayed:\n${dataContent}`)
  return dataContent
}

function displayStatsOutput(dataToFormat) {
  core.debug(`Stats to be displayed:\n${JSON.stringify(dataToFormat)}`)
  return dataToFormat
}

async function displayStatsCard(inputs, dataToFormat) {
  const staging = mkdtempSync(path.join(os.tmpdir(), 'th-cards-'))
  try {
    // Create the card path if it doesn't exist.
    mkdirSync(cardTarget(inputs, inputs.cardPath), { recursive: true })

    // Render both cards aside first, so a failed render leaves the existing
    // cards untouched.
    const staged = {}
    for (const theme of CARD_THEMES) {
      staged[theme] = await generateCard(
        dataToFormat,
        { ...inputs, cardPath: staging },
        theme
      )
    }

    // Check every target before replacing any.
    const cardLinks = {}
    const targets = {}
    for (const theme of CARD_THEMES) {
      const file = cardFilePath(inputs.cardPath, theme)
      targets[theme] = cardTarget(inputs, file)
      cardLinks[theme] = cardLink(inputs, file, targets[theme])
    }
    replaceCards(staged, targets)
    core.debug(`Card images saved in ${inputs.cardPath}`)
    const fullPathLight = cardLinks.light
    const fullPathDark = cardLinks.dark

    // Construct the image display depending on the file format
    let dataContent = ''
    switch (inputs.fileFormat) {
      case 'md':
        dataContent = `
![Trailhead-Stats-Light](${fullPathLight}#gh-light-mode-only)
![Trailhead-Stats-Dark](${fullPathDark}#gh-dark-mode-only)`
        break
      case 'html':
        dataContent = `
<a href="https://www.salesforce.com/trailblazer/${inputs.trailheadUsername}">
<picture>
    <source media="(prefers-color-scheme: light)" srcset="${fullPathLight}">
    <source media="(prefers-color-scheme: dark)" srcset="${fullPathDark}">
    <img alt="Shows the Trailhead Stats card in either light or dark theme." src="${fullPathLight}">
</picture>
</a>`
        break
    }
    return dataContent
  } catch (err) {
    // A failed or timed-out render must stop the run before any file is
    // written or committed.
    throw new Error(`Error generating the card: ${err.message || err}`)
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}

function appDC(propertyLabel, propertyValue) {
  if (propertyValue !== undefined && propertyValue !== null) {
    return ` ${propertyLabel}: ${propertyValue}  \n`
  }
  return ''
}

function appDChtml(propertyLabel, propertyValue) {
  if (propertyValue !== undefined && propertyValue !== null) {
    return `<li>${propertyLabel}: ${propertyValue}</li>\n`
  }
  return ''
}

module.exports = { displayStats, displayStatsCard }
