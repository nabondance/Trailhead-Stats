const core = require('@actions/core')
const puppeteer = require('puppeteer')
const path = require('path')
const crypto = require('crypto')
const { generateCss, getSkillColor } = require('./cardCss')

async function generateCard(dataToFormat, inputs, styleTheme) {
  const cardFullPath = path.join(inputs.cardPath, `TScard-${styleTheme}.png`)
  const htmlContent = generateHtmlContent(dataToFormat, inputs, styleTheme)

  // Debugs
  core.debug('Data to format:', dataToFormat)
  core.debug('Inputs:', inputs)
  core.debug('Style theme:', styleTheme)
  core.debug('Card full path:', cardFullPath)

  // Create the card as a PNG image
  await createCardAsPng(htmlContent, cardFullPath)

  // Return the full path of the generated PNG file
  return cardFullPath
}

async function createCardAsPng(htmlContent, outputPath) {
  // Debug
  core.debug('HTML content:', htmlContent)
  core.debug('Output path:', outputPath)

  // Launch a headless browser
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  // Set your HTML content
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0' // Wait for all resources to be loaded
  })

  // Set viewport size if needed
  await page.setViewport({ width: 1000, height: 10000 })

  // Take a screenshot of the card element
  const cardSelector = '.card'
  const card = await page.$(cardSelector)
  await card.screenshot({ path: outputPath, type: 'png' })

  // Close the browser
  await browser.close()
}

function generateHtmlContent(data, inputs, styleTheme) {
  // Define the HTML structure with inline CSS for styling
  const style = generateCss(styleTheme)
  const numberTopSkills = inputs.showSkillNumber

  // Generate the skills bar chart HTML
  let skillsBarChartHtml = ``
  if (inputs.showSkill == 'visible' && data.skillPointsDetails) {
    const maxSkillPoints = Math.max(
      ...data.skillPointsDetails.map(skill => skill.points)
    )

    // Ensure skills are sorted by points in descending order
    const sortedSkills = data.skillPointsDetails.sort(
      (a, b) => b.points - a.points
    )

    // Slice to get top N skills
    const topSkills = sortedSkills.slice(0, numberTopSkills)

    // Dynamically calculate thresholds
    const thresholds = calculateThresholds(data.skillPointsDetails)

    // Generate the HTML for the skills bar chart
    skillsBarChartHtml = `<h2>Top ${numberTopSkills?.toLocaleString('fr')} Skills:</h2>`
    skillsBarChartHtml += '<div class="skills-bar-chart">'
    skillsBarChartHtml += topSkills
      .map(skill => {
        const barWidth = (skill.points / maxSkillPoints) * 100 // Normalize to 100%
        const skillColor = getSkillColor(skill.points, thresholds, styleTheme) // Use dynamic color based on thresholds
        const skillPoints = getSkillPoints(
          skill.points,
          barWidth
        )?.toLocaleString('fr') // Display or not the skill points
        return `
            <div class="skill-container">
            <div class="skill-bar" style="width: ${barWidth}%; background-color: ${skillColor};">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-points">${skillPoints}</span>
            </div>
        </div>`
      })
      .join('')
    skillsBarChartHtml += '</div>'
  }

  // Generate the HTML for latest achievements
  let latestAchievementsHtml = ''
  if (
    inputs.showBadgeLatest == 'visible' ||
    inputs.showCertificationLatest == 'visible' ||
    inputs.showSuperBadgeLatest == 'visible' ||
    inputs.showEventBadgeLatest == 'visible' ||
    inputs.showStampLatest == 'visible'
  ) {
    latestAchievementsHtml = `<h2>Latest Achievements:</h2>`
  }

  // Generate the certifications HTML
  let certificationsHtml = selectHtmlDisplay(
    inputs.showCertification,
    data.certificationsDetails,
    'Certifications'
  )

  // Generate the badge HTML
  let badgesHtml = selectHtmlDisplay(
    inputs.showBadge,
    data.badgeDetails,
    'Badges'
  )

  // Generate the superbadge HTML
  let superBadgesHtml = selectHtmlDisplay(
    inputs.showSuperBadge,
    data.superBadgeDetails,
    'Superbadges'
  )

  // Generate the event badge HTML
  let eventBadgesHtml = selectHtmlDisplay(
    inputs.showEventBadge,
    data.eventBadgeDetails,
    'Event Badges'
  )

  // Generate the earned stamps HTML
  let earnedStampsHtml = selectHtmlDisplay(
    inputs.showStamp,
    data.earnedStampsDetails,
    'Stamps'
  )

  const htmlContent = `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Trailhead Stats Card</title>
                ${style}
            </head>
            <body>
                <div class="card">
                    <div class="card-header">
                        <img src="${
                          data.rankIcon
                        }" alt="Rank Logo" class="rank-logo">
                        <div>
                            <h2>${data.rank}</h2>
                            <p><b>${data.nbBadges?.toLocaleString('fr')}</b> Badges,
                            <b>${data.points?.toLocaleString('fr')}</b> Points</p>
                        </div>
                    </div>
                    <div class="card-content">
                        ${latestAchievementsHtml}
                        ${makeLatestHtml('Last Certification', data.lastCertif, inputs.showCertificationLatest)}
                        ${makeLatestHtml('Last Badge', data.lastBadge, inputs.showBadgeLatest)}
                        ${makeLatestHtml('Last Superbadge', data.lastSuperBadge, inputs.showSuperBadgeLatest)}
                        ${makeLatestHtml('Last Event Badge', data.lastEventBadge, inputs.showEventBadgeLatest)}
                        ${makeLatestHtml('Last Stamp', data.lastEarnedStamps, inputs.showStampLatest)}

                        ${skillsBarChartHtml}
                        ${certificationsHtml}
                        ${badgesHtml}
                        ${superBadgesHtml}
                        ${eventBadgesHtml}
                        ${earnedStampsHtml}
                    </div>
                </div>
            </body>
        </html>
    `
  core.debug(htmlContent)
  const hash = hashHtml(htmlContent)
  core.debug('SHA-256 Hash:', hash)
  return htmlContent
}

function calculateThresholds(skillPointsDetails) {
  const points = skillPointsDetails.map(skill => skill.points)
  const maxPoints = Math.max(...points)
  const minPoints = Math.min(...points)
  const range = maxPoints - minPoints
  const threshold1 = minPoints + range / 3
  const threshold2 = minPoints + (2 * range) / 3
  return { threshold1, threshold2 }
}

function getSkillPoints(points, barWidth) {
  if (barWidth <= 20) {
    return ''
  } else {
    return points
  }
}

function makeIconDisplay(details, name) {
  let iconDisplayHtml = ''
  const detailsLength = details?.length
  if (detailsLength > 0) {
    iconDisplayHtml = `<h2>${detailsLength?.toLocaleString('fr')} ${name}:</h2>`
    iconDisplayHtml += `<div class="icon-container">`
    iconDisplayHtml += details
      .filter(detail => detail.iconUrl !== undefined)
      .map(
        detail => `
          <div class="icon">
            <img src="${detail.iconUrl}" alt="${detail.title}" class="icon-logo">
          </div>`
      )
      .join('')
    iconDisplayHtml += '</div>'
  }

  return iconDisplayHtml
}

function makeTableDisplay(details, name) {
  let iconDisplayHtml = ''
  const detailsLength = details?.length
  if (detailsLength > 0) {
    iconDisplayHtml = `<h2>${detailsLength?.toLocaleString('fr')} ${name}:</h2>`
    iconDisplayHtml += `<div class="table-container">`
    iconDisplayHtml += details
      .filter(detail => detail.iconUrl !== undefined)
      .map(
        detail => `
          <div class="table">
            <img src="${detail.iconUrl}" alt="${detail.title}" class="table-logo">
          </div>`
      )
      .join('')
    iconDisplayHtml += '</div>'
  }

  return iconDisplayHtml
}

function makeDetailDisplay(details, name) {
  let detailHtml = ''
  const detailsLength = details?.length
  if (detailsLength > 0) {
    detailHtml = `<h2>${detailsLength?.toLocaleString('fr')} ${name}:</h2>`
    detailHtml += details
      .filter(detail => detail.iconUrl !== undefined)
      .map(
        detail => `
      <div class="detail">
        <img src="${detail.iconUrl}" alt="${detail.title}" class="detail-logo">
        ${detail?.title}${detail?.status ? ' - ' + detail?.status : ''}
      </div>`
      )
      .join('')
  }

  return detailHtml
}

function makeNumberDisplay(details, name) {
  let numberHtml = ''
  const detailsLength = details?.length
  if (detailsLength > 0) {
    numberHtml = `<h2>${detailsLength?.toLocaleString('fr')} ${name}</h2>`
  }

  return numberHtml
}

function selectHtmlDisplay(displayType, details, name) {
  switch (displayType) {
    case 'icon':
      return makeIconDisplay(details, name)
    case 'table':
      return makeTableDisplay(details, name)
    case 'detail':
      return makeDetailDisplay(details, name)
    case 'number':
      return makeNumberDisplay(details, name)
    default:
      return ''
  }
}

function makeLatestHtml(propertyLabel, propertyValue, propertyShow) {
  if (
    propertyShow == 'visible' &&
    propertyValue !== null &&
    propertyValue !== undefined
  ) {
    return `<p>${propertyLabel}: ${propertyValue}</p>`
  }
  return ''
}

function hashHtml(htmlContent) {
  return crypto.createHash('sha256').update(htmlContent).digest('hex')
}

module.exports = {
  generateCard,
  generateHtmlContent,
  selectHtmlDisplay,
  makeLatestHtml,
  hashHtml
}
