const puppeteer = require('puppeteer')
const path = require('path')
const crypto = require('crypto')

async function generateCard(dataToFormat, cardPath) {
  const cardFullPath = path.join(cardPath, 'TScard.png')
  const htmlContent = generateHtmlContent(dataToFormat)

  // Create the card as a PNG image
  await createCardAsPng(htmlContent, cardFullPath)

  // Return the full path of the generated PNG file
  return cardFullPath
}

async function createCardAsPng(htmlContent, outputPath) {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    // executablePath: '/usr/bin/chromium-browser',
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

function generateHtmlContent(data) {
  // Define the HTML structure with inline CSS for styling
  const style = getStyle('white')
  const numberTopSkills = 5

  // Generate the skills bar chart HTML
  let skillsBarChartHtml
  if (data.skillPointsDetails) {
    // Sort skills by points and normalize
    const maxSkillPoints = Math.max(
      ...data.skillPointsDetails.map(skill => skill.points)
    )
    // Sort skills by points
    const sortedSkills = data.skillPointsDetails.sort(
      (a, b) => b.points - a.points
    )

    // Slice the array to only include the top n skills
    const topSkills = sortedSkills.slice(0, numberTopSkills)

    skillsBarChartHtml = `<h2>Top ${numberTopSkills} Skills:</h2>`
    skillsBarChartHtml += '<div class="skills-bar-chart">'
    skillsBarChartHtml += topSkills
      .map(skill => {
        const barWidth = (skill.points / maxSkillPoints) * 100 // Normalize to 100%
        return `
        <div class="skill-bar-container">
          <div class="skill-name">${skill.name}</div>
          <div class="skill-bar" style="width: ${barWidth}%;">
            <div class="skill-points">${skill.points}</div>
          </div>
        </div>`
      })
      .join('')
    skillsBarChartHtml += '\n</div>'
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
            <img src="${superbadge.icon}" alt="${superbadge.title}" class="superbadge-logo">
          </div>`
      )
      .join('')
    superbadgesHtml += '</div>'
  }

  // Generate the earned stamps HTML
  let earnedStampsHtml = ''
  if (data.earnedStampsDetails?.length > 0) {
    earnedStampsHtml = '<h2>Stamps:</h2>'
    earnedStampsHtml += data.earnedStampsDetails
      .map(
        stamp => `
        <div class="certification">
          <img src="${stamp.iconUrl}" alt="${stamp.name}" class="cert-logo">
          ${stamp.name}
        </div>`
      )
      .join('')
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

function getStyle(styleMode) {
  const style = `
    <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
    }
    .card {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        padding: 20px;
        width: 600px;
    }
    .card-header {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
        margin-bottom: 10px;
    }
    .rank-logo {
        max-width: 100px;
        max-height: 100px;
        margin-right: 10px;
    }
    .card-content {
        line-height: 1.6;
    }
    .card-content h2 {
        margin: 5px 0;
        color: #333;
    }
    .card-content p {
        margin: 5px 0;
        color: #666;
    }
    .badge, .certification, .skill {
        background-color: #eee;
        padding: 5px;
        border-radius: 5px;
        margin: 5px 0;
    }
    .skills-bar-chart {
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    .skill-bar-container {
        position: relative; /* Add position relative here */
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        background-color: #ddd; /* Optional: to make the bar background visible */
    }
    .skill-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 20%;
        padding-right: 5px;
        text-align: right;
    }
    .skill-bar {
        height: 10px;
        background-color: #4caf50;
        border-radius: 5px;
    }
    .skill-points {
        position: absolute;
        right: 5px;
        color: green;
        font-weight: bold;
    }
    .certification {
        display: flex;
        align-items: center; /* This will vertically align the logo with the text */
        margin-bottom: 10px; /* Add some space between certification entries */
    }
    .cert-logo {
        max-width: 100px;
        max-height: 100px;
        margin-right: 10px;
        object-fit: contain; /* this ensures the image is scaled correctly while maintaining its aspect ratio */
        vertical-align: middle; /* This aligns the image nicely with the text */
    }
    .superbadge-container {
      max-width: 550px;
      width: 5500px;
      display: flex;
      flex-wrap: wrap;
      overflow: visible;
    }
    .superbadge {
      position: relative;
      flex-shrink: 0;
      margin-right: -30px;
    }
    .superbadge-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }
    </style>
    `
  return style
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
  getStyle,
  hashHtml
}
