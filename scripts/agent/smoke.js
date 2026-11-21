// Live read-only run: fetches and renders, never calls updateFile.
const axios = require('axios')
const { loadInputs } = require('./lib/inputs')
const { findRenderIssues } = require('./lib/render-issues')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
} = require('../../src/getStats')
const { displayStats } = require('../../src/displayStats')
const { generateHtmlContent } = require('../../src/cardGenerator')

function fail(problems) {
  console.error(`Smoke: FAIL (${problems.length})`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

// The fetchers catch their own errors and return partial data, so a failed
// query is only visible in the response or in what they log.
function watchFetchFailures() {
  const failures = []
  axios.interceptors.response.use(response => {
    if (response.data?.errors?.length) {
      failures.push(`GraphQL errors: ${JSON.stringify(response.data.errors)}`)
    }
    return response
  })
  const logError = console.error
  console.error = (...args) => {
    if (String(args[0]).startsWith('Error fetching data')) {
      failures.push(`fetch failed: ${args[1]?.message ?? args[1]}`)
    } else {
      logError(...args)
    }
  }
  return failures
}

async function main() {
  const username = process.argv[2] || 'nabondance'
  const base = { 'trailhead-username': username, 'output-only': 'true' }
  const inputs = loadInputs({ ...base, 'no-commit': 'true' })
  const failures = watchFetchFailures()

  const rank = await fetchTrailblazerRankInfo(username)
  const profile = rank?.data?.profile
  const problems = [...failures]
  if (profile?.__typename === 'PrivateProfile') {
    problems.push(`${username} has a private profile`)
  }
  if (!profile?.trailheadStats) problems.push('rank: trailheadStats is null')
  if (problems.length > 0) fail(problems)

  const stats = [
    rank,
    await fetchTrailblazerBadgesInfo(username),
    await fetchTrailblazerSuperBadgesInfo(username),
    await fetchTrailblazerEventBadgesInfo(username),
    await fetchTrailblazerCertifsInfo(username),
    await fetchTrailblazerSkillsInfo(username),
    await fetchTrailblazerEarnedStampsInfo(username)
  ]
  if (failures.length > 0) fail(failures)

  const render = (displayType, fileFormat) =>
    displayStats({ ...inputs, displayType, fileFormat }, ...stats)

  const data = await render('output', 'md')
  for (const field of ['rank', 'points', 'nbBadges']) {
    if (data[field] === undefined || data[field] === null) {
      problems.push(`data: ${field} is missing`)
    }
  }

  const outputs = {
    'text/md': await render('text', 'md'),
    'text/html': await render('text', 'html'),
    'card/light': generateHtmlContent(data, inputs, 'light'),
    'card/dark': generateHtmlContent(data, inputs, 'dark')
  }
  for (const [label, content] of Object.entries(outputs)) {
    problems.push(...findRenderIssues(label, content))
  }
  if (problems.length > 0) fail(problems)

  console.log(
    `Smoke: PASS (${username}: ${data.rank}, ${data.nbBadges} badges, ${data.points} points)`
  )
}

main().catch(error => fail([error.stack || error.message]))
