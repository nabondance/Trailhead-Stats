function generateCss(styleTheme) {
  let colorBackground
  let colorText
  let colorTextSkill
  let colorBlock

  switch (styleTheme) {
    case 'light':
      colorBackground = 'white'
      colorText = '#1F2328'
      colorTextSkill = 'white'
      colorBlock = '#F5F8FA'
      break
    case 'dark':
      colorBackground = '#22272D'
      colorText = 'white'
      colorTextSkill = 'white'
      colorBlock = '#1C2128'
      break
  }

  const style = `
  <style>
  :root {
    --color-background: ${colorBackground};
    --color-text: ${colorText};
    --color-text-skill: ${colorTextSkill};
    --color-block: ${colorBlock};
  }
  body {
      font-family: Arial, sans-serif;
      background-color: var(--color-background);
      color: var(--color-text);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
  }
  .card {
      background-color: var(--color-background);
      border-radius: 10px;
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
      color: var(--color-text);
  }
  .card-content p {
      margin: 5px 0;
      color: var(--color-text);
  }
  .badge {
      background-color: var(--color-block);
      padding: 5px;
      border-radius: 5px;
      margin: 5px 0;
  }
  .skill-container {
    border-radius: 2px;
  }
  .skill-bar {
    display: flex;
    justify-content: space-between;
    align-items: left;
    line-height: 30px;
    border-radius: 2px;
    height: 30px;
    max-width: 600px;
    overflow: hidden;
    color: var(--color-text-skill);
    font-weight: bold;
  }
  .skill-name {
    text-align: left;
    padding-left: 5px;
  }
  .skill-points {
    text-align: right;
    padding-right: 5px;
    visibility: visible;
  }
  .certification {
      background-color: var(--color-block);
      padding: 5px;
      border-radius: 5px;
      margin: 5px 0;
      display: flex;
      align-items: center; /* This will vertically align the logo with the text */
      margin-bottom: 10px; /* Add some space between certification entries */
  }
  .cert-logo {
      max-width: 100px;
      max-height: 100px;
      margin-right: 10px;
      object-fit: contain; /* This ensures the image is scaled correctly while maintaining its aspect ratio */
      vertical-align: middle; /* This aligns the image nicely with the text */
  }
  .superbadge-container {
      max-width: 550px;
      width: 550px;
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
  .stamp-container {
      max-width: 600px;
      width: 600px;
      display: flex;
      flex-wrap: wrap;
      overflow: visible;
  }
  .stamp {
      position: relative;
      flex-shrink: 0;
      margin-right: 0px;
      margin-bottom: 2px;
  }
  .stamp-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
  }
  </style>
  `

  return style
}

function getSkillColor(points, thresholds, styleTheme) {
  let colorSkillLow
  let colorSkillMedium
  let colorSkillHigh
  switch (styleTheme) {
    case 'light':
      colorSkillLow = '#1E2761'
      colorSkillMedium = '#408EC6'
      colorSkillHigh = '#7A2048'
      break
    case 'dark':
      colorSkillLow = '#4078c0'
      colorSkillMedium = '#c9510c'
      colorSkillHigh = '#6e5494'
      break
  }

  if (points <= thresholds.threshold1) return `${colorSkillLow}` // Low level color
  if (points <= thresholds.threshold2) return `${colorSkillMedium}` // Medium level color
  return `${colorSkillHigh}` // High level color
}

module.exports = {
  generateCss,
  getSkillColor
}
