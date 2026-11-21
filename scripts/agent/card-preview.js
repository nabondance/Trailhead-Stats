// Renders text and card variants from fixtures, with no network access.
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { ROOT } = require('./lib/action-yml')
require('./lib/inputs')
const {
  fixtureInputs,
  fullProfile,
  emptyProfile
} = require('../../__tests__/fixtures/trailhead')
const { displayStats } = require('../../src/displayStats')
const { generateHtmlContent } = require('../../src/cardGenerator')

const DARK_STYLES = ['dimmed', 'dark', 'high-contrast']

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome'
  ]
  try {
    candidates.push(puppeteer.executablePath())
  } catch {
    // No bundled browser installed.
  }
  return candidates.find(file => file && fs.existsSync(file))
}

function parseOutDir(args) {
  const index = args.indexOf('--out')
  if (index === -1) return path.join(ROOT, '.agent-output', 'card-preview')
  if (!args[index + 1]) throw new Error('--out needs a folder')
  return path.resolve(args[index + 1])
}

async function screenshot(browser, html, file) {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.setViewport({ width: 1000, height: 10000 })
  const card = await page.$('.card')
  await card.screenshot({ path: file, type: 'png' })
  await page.close()
}

async function main() {
  const outDir = parseOutDir(process.argv.slice(2))
  fs.mkdirSync(outDir, { recursive: true })

  const profiles = { full: fullProfile, empty: emptyProfile }
  for (const [name, build] of Object.entries(profiles)) {
    for (const fileFormat of ['md', 'html']) {
      const text = await displayStats(
        { ...fixtureInputs, displayType: 'text', fileFormat },
        ...build()
      )
      fs.writeFileSync(path.join(outDir, `${name}-text.${fileFormat}`), text)
    }
  }

  const executablePath = findBrowser()
  if (!executablePath) {
    throw new Error('No Chrome found. Set CHROME_PATH to a Chrome binary.')
  }
  const browser = await puppeteer.launch({
    executablePath,
    args: process.platform === 'linux' ? ['--no-sandbox'] : []
  })
  try {
    for (const [name, build] of Object.entries(profiles)) {
      const data = await displayStats(
        { ...fixtureInputs, displayType: 'output' },
        ...build()
      )
      await screenshot(
        browser,
        generateHtmlContent(data, fixtureInputs, 'light'),
        path.join(outDir, `${name}-card-light.png`)
      )
      for (const darkStyle of DARK_STYLES) {
        await screenshot(
          browser,
          generateHtmlContent(data, { ...fixtureInputs, darkStyle }, 'dark'),
          path.join(outDir, `${name}-card-${darkStyle}.png`)
        )
      }
    }
  } finally {
    await browser.close()
  }
  console.log(`Card preview: ${outDir}`)
}

main().catch(error => {
  console.error(`Card preview: FAIL - ${error.message}`)
  process.exit(1)
})
