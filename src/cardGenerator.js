const puppeteer = require('puppeteer')
const path = require('path')
const crypto = require('crypto')
const { generateCss, getSkillColor } = require('./cardCss')

async function generateCard(dataToFormat, inputs, styleTheme) {
  const cardFullPath = path.join(inputs.cardPath, `TScard-${styleTheme}.png`)
  const htmlContent = generateHtmlContent(dataToFormat, inputs, styleTheme)

  // Create the card as a PNG image
  await createCardAsPng(htmlContent, cardFullPath)

  // Return the full path of the generated PNG file
  return cardFullPath
}

async function createCardAsPng(htmlContent, outputPath) {
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
  await card.screenshot({ path: outputPath })

  // Close the browser
  await browser.close()
}

function generateHtmlContent(data, inputs, styleTheme) {
  // Define the HTML structure with inline CSS for styling
  const style = generateCss(styleTheme)
  const numberTopSkills = inputs.nbSkills

  // Generate the skills bar chart HTML
  let skillsBarChartHtml
  if (data.skillPointsDetails) {
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
    skillsBarChartHtml = `<h2>Top ${numberTopSkills} Skills:</h2>`
    skillsBarChartHtml += '<div class="skills-bar-chart">'
    skillsBarChartHtml += topSkills
      .map(skill => {
        const barWidth = (skill.points / maxSkillPoints) * 100 // Normalize to 100%
        const skillColor = getSkillColor(skill.points, thresholds, styleTheme) // Use dynamic color based on thresholds
        const skillPoints = getSkillPoints(skill.points, barWidth) // Display or not the skill points
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

  // Generate the certifications HTML
  let certificationsHtml = ''
  if (data.certificationsDetails?.length > 0) {
    certificationsHtml = `<h2>${data.nbCertifs} Certifications:</h2>`
    certificationsHtml += data.certificationsDetails
      .map(
        cert => `
      <div class="certification">
        <img src="${cert.logoUrl}" alt="${cert.title}" class="cert-logo">
        ${cert.title} - ${cert.status}
      </div>`
      )
      .join('')
  }

  // Generate the superbadge HTML
  let superbadgesHtml = ''
  const superbadgeDetailsLength = data.superbadgeDetails?.length
  if (superbadgeDetailsLength > 0) {
    superbadgesHtml = `<h2>${superbadgeDetailsLength} Superbadges:</h2>`
    superbadgesHtml += `<div class="superbadge-container">`
    superbadgesHtml += data.superbadgeDetails
      .map(
        superbadge => `
          <div class="superbadge">
            <img src="${superbadge.iconUrl}" alt="${superbadge.title}" class="superbadge-logo">
          </div>`
      )
      .join('')
    superbadgesHtml += '</div>'
  }

  // Generate the earned stamps HTML
  let earnedStampsHtml = ''
  const earnedStampsDetailsLength = data.earnedStampsDetails?.length
  if (earnedStampsDetailsLength > 0) {
    earnedStampsHtml = `<h2>${earnedStampsDetailsLength} Stamps:</h2>`
    earnedStampsHtml += `<div class="stamp-container">`
    earnedStampsHtml += data.earnedStampsDetails
      .map(
        stamp => `
        <div class="stamp">
          <img src="${stamp.iconUrl}" alt="${stamp.name}" class="stamp-logo">
        </div>`
      )
      .join('')
    earnedStampsHtml += '</div>'
  }

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
                            <p>${data.nbBadges} Badges, ${
                              data.points
                            } Points</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <h2>Latest Achievements:</h2>
                        ${appendDCcard('Last Badge', data.lastBadge)}
                        ${appendDCcard('Last Superbadge', data.lastSuperbadge)}
                        ${appendDCcard('Last Certification', data.lastCertif)}
                        ${appendDCcard('Last Stamp', data.lastEarnedStamps)}

                        ${skillsBarChartHtml}
                        ${certificationsHtml}
                        ${superbadgesHtml}
                        ${earnedStampsHtml}
                    </div>
                </div>
            </body>
        </html>
    `
  console.log(htmlContent)
  const hash = hashHtml(htmlContent)
  console.log('SHA-256 Hash:', hash)
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

function hashHtml(htmlContent) {
  return crypto.createHash('sha256').update(htmlContent).digest('hex')
}

function appendDCcard(propertyLabel, propertyValue) {
  if (propertyValue !== null && propertyValue !== undefined) {
    return `<p>${propertyLabel}: ${propertyValue}</p>`
  }
  return ''
}

module.exports = {
  generateCard,
  generateHtmlContent,
  hashHtml
}
