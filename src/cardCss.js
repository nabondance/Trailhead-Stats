function generateCss(styleTheme, darkStyle) {
  let colorBackground
  let colorText
  let colorTextSkill
  let colorBlock
  let colorLine

  switch (styleTheme) {
    case 'light':
      colorBackground = 'white'
      colorText = '#1F2328'
      colorTextSkill = 'white'
      colorBlock = '#F5F8FA'
      colorLine = '#1C2128'
      break
    case 'dark':
      switch (darkStyle) {
        case 'dimmed':
          colorBackground = '#202830'
          colorText = 'white'
          colorTextSkill = 'white'
          colorBlock = '#1C2128'
          colorLine = '#F5F8FA'
          break
        case 'dark':
          colorBackground = '#0E1117'
          colorText = 'white'
          colorTextSkill = 'white'
          colorBlock = '#161A21'
          colorLine = '#F5F8FA'
          break
        case 'high-contrast':
          colorBackground = '#02040A'
          colorText = 'white'
          colorTextSkill = 'white'
          colorBlock = '#2F3742'
          colorLine = '#F5F8FA'
          break
      }
      break
  }

  const style = `
  <style>
  :root {
    --color-background: ${colorBackground};
    --color-text: ${colorText};
    --color-text-skill: ${colorTextSkill};
    --color-block: ${colorBlock};
    --color-line: ${colorLine};
  }
  body {
    font-family: Arial, sans-serif;
    font-size: 20px;
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
    width: 800px;
  }
  .card-header {
    display: flex;
    font-size: 30px;
    align-items: center;
    border-bottom: 1px solid var(--color-line);
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .card-header h1 {
    font-size: 40px;
  }
  .rank-logo {
    max-width: 200px;
    max-height: 200px;
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
    border-radius: 10px;
    margin: 5px 0;
  }
  .skill-container {
    border-radius: 10px;
  }
  .skill-bar {
    display: flex;
    justify-content: space-between;
    align-items: left;
    line-height: 40px;
    border-radius: 6px;
    height: 40px;
    max-width: 800px;
    min-width: 200px;
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
  .icon-container {
    max-width: 750px;
    width: 750px;
    display: flex;
    flex-wrap: wrap;
    overflow: visible;
  }
  .icon {
    position: relative;
    flex-shrink: 0;
    margin-right: -40px;
  }
  .icon-logo {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  .detail {
    background-color: var(--color-block);
    padding: 5px;
    border-radius: 10px;
    margin: 5px 0;
    display: flex;
    align-items: center; /* This will vertically align the logo with the text */
    margin-bottom: 10px;
  }
  .detail-logo {
    max-width: 100px;
    max-height: 100px;
    margin-right: 10px;
    object-fit: contain; /* This ensures the image is scaled correctly while maintaining its aspect ratio */
    vertical-align: middle; /* This aligns the image nicely with the text */
  }
  .table-container {
    max-width: 800px;
    width: 800px;
    display: flex;
    flex-wrap: wrap;
    overflow: visible;
  }
  .table {
    position: relative;
    flex-shrink: 0;
    margin-right: 0px;
    margin-bottom: 5px;
  }
  .table-logo {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  </style>
  `

  return style
}

function getSkillColor(points, thresholds, styleTheme, skillTheme) {
  let colorSkillLow
  let colorSkillMedium
  let colorSkillHigh
  switch (skillTheme) {
    case 'olympic':
      colorSkillHigh = '#d6af36'
      colorSkillMedium = '#a7a7ad'
      colorSkillLow = '#a77044'
      break
    case 'halloween':
      colorSkillHigh = '#fa7a18'
      colorSkillMedium = '#bd561d'
      colorSkillLow = '#631c03'
      break
    case 'winter':
      colorSkillHigh = '#54AEFF'
      colorSkillMedium = '#0969DA'
      colorSkillLow = '#0A3069'
      break
    case 'spring':
      colorSkillHigh = '#f4649e'
      colorSkillMedium = '#49e5aa'
      colorSkillLow = '#229fa9'
      break
    case 'summer':
      colorSkillHigh = '#39d353'
      colorSkillMedium = '#006d32'
      colorSkillLow = '#0e4429'
      break
    default:
      switch (styleTheme) {
        case 'light':
          colorSkillHigh = '#7A2048'
          colorSkillMedium = '#408EC6'
          colorSkillLow = '#1E2761'
          break
        case 'dark':
          colorSkillHigh = '#6e5494'
          colorSkillMedium = '#c9510c'
          colorSkillLow = '#4078c0'
          break
      }
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
