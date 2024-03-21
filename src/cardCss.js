function generateCss(styleTheme) {
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
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  .badge {
      background-color: #eee;
      padding: 5px;
      border-radius: 5px;
      margin: 5px 0;
  }
  .skill {
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
      background-color: #eee;
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
      object-fit: contain; /* this ensures the image is scaled correctly while maintaining its aspect ratio */
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

module.exports = {
  generateCss
}
