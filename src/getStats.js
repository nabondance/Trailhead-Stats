const axios = require('axios')
const core = require('@actions/core')
const {
  GET_TRAILBLAZER_RANK,
  GET_TRAILBLAZER_BADGES,
  GET_TRAILBLAZER_CERTIFS,
  GET_TRAILBLAZER_SKILLS,
  GET_TRAILBLAZER_EARNED_STAMPS
} = require('./queries')

const PROFILE_ENDPOINT = 'https://profile.api.trailhead.com/graphql'
const MOBILE_ENDPOINT = 'https://mobile.api.trailhead.com/graphql'
const PAGE_SIZE = 100

// Every fetch fails closed: an error or an incomplete response is retried, then
// thrown, so a broken card is never rendered or committed. Mutable so tests can
// run without waiting.
const retryConfig = {
  delaysMs: [2000, 5000],
  timeoutMs: 30000
}

class TrailheadApiError extends Error {
  constructor(message, { retryable = true } = {}) {
    super(message)
    this.name = 'TrailheadApiError'
    this.retryable = retryable
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function postGraphql(endpoint, query, variables) {
  let response
  try {
    response = await axios.post(
      endpoint,
      { query, variables },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: retryConfig.timeoutMs
      }
    )
  } catch (error) {
    const status = error.response?.status
    // Other 4xx answers will not change on a retry.
    const retryable =
      status === undefined || status >= 500 || status === 408 || status === 429
    throw new TrailheadApiError(`request failed: ${error.message}`, {
      retryable
    })
  }

  // GraphQL errors come back with HTTP 200, so axios does not throw on them.
  const errors = response.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const notFound = errors.some(e => e.extensions?.code === 'NOT_FOUND')
    const messages = errors.map(e => e.message).join('; ')
    throw new TrailheadApiError(
      notFound
        ? `profile not found (${messages})`
        : `GraphQL error: ${messages}`,
      { retryable: !notFound }
    )
  }
  if (!response.data?.data) {
    throw new TrailheadApiError('response has no data')
  }
  return response.data.data
}

// One request, retried with backoff. `validate` throws when the payload is
// incomplete (for example `trailheadStats: null`) and returns what to keep.
async function request(label, username, endpoint, query, variables, validate) {
  const attempts = retryConfig.delaysMs.length + 1
  for (let attempt = 1; ; attempt++) {
    try {
      return validate(await postGraphql(endpoint, query, variables))
    } catch (error) {
      if (error.retryable === false || attempt >= attempts) {
        const tries = attempt > 1 ? ` after ${attempt} attempts` : ''
        throw new Error(
          `Could not fetch Trailhead ${label} for "${username}"${tries}: ${error.message}`
        )
      }
      const delay = retryConfig.delaysMs[attempt - 1]
      core.warning(
        `Trailhead ${label} for "${username}": ${error.message}. Retrying in ${delay} ms (${attempt + 1}/${attempts}).`
      )
      await sleep(delay)
    }
  }
}

function incomplete(what) {
  return new TrailheadApiError(`incomplete response, ${what} is missing`)
}

function publicProfile(data) {
  const profile = data.profile
  if (!profile) throw incomplete('profile')
  if (profile.__typename === 'PrivateProfile') {
    throw new TrailheadApiError(
      'the profile is private, make it public on Trailhead',
      { retryable: false }
    )
  }
  return profile
}

function hasPage(connection) {
  return Array.isArray(connection?.edges) && connection.pageInfo
}

// Follows `pageInfo` until the last page. Any failed page fails the whole
// fetch, so counts are never silently low.
async function fetchAllPages(fetchPage) {
  let edges = []
  let pageInfo = null
  let first = null
  const seen = new Set()
  do {
    const after = pageInfo ? pageInfo.endCursor : null
    const page = await fetchPage(after)
    first = first || page
    edges = edges.concat(page.connection.edges)
    pageInfo = page.connection.pageInfo
    if (pageInfo.hasNextPage) {
      if (!pageInfo.endCursor || seen.has(pageInfo.endCursor)) {
        throw new Error('Trailhead pagination did not advance')
      }
      seen.add(pageInfo.endCursor)
    }
  } while (pageInfo.hasNextPage)
  return { first, edges, pageInfo }
}

async function fetchTrailblazerRankInfo(trailheadUsername) {
  const data = await request(
    'rank',
    trailheadUsername,
    PROFILE_ENDPOINT,
    GET_TRAILBLAZER_RANK,
    { hasSlug: true, slug: trailheadUsername },
    payload => {
      const stats = publicProfile(payload).trailheadStats
      if (!stats) throw incomplete('trailheadStats')
      if (!stats.rank?.title) throw incomplete('trailheadStats.rank')
      return payload
    }
  )
  return { data }
}

async function fetchAwards(trailheadUsername, label, filter) {
  const { first, edges, pageInfo } = await fetchAllPages(after =>
    request(
      label,
      trailheadUsername,
      PROFILE_ENDPOINT,
      GET_TRAILBLAZER_BADGES,
      {
        count: PAGE_SIZE,
        after,
        ...(filter ? { filter } : {}),
        hasSlug: true,
        slug: trailheadUsername
      },
      payload => {
        const profile = publicProfile(payload)
        if (!profile.trailheadStats) throw incomplete('trailheadStats')
        if (!hasPage(profile.earnedAwards)) throw incomplete('earnedAwards')
        return { profile, connection: profile.earnedAwards }
      }
    )
  )
  return {
    data: {
      profile: {
        __typename: first.profile.__typename,
        trailheadStats: first.profile.trailheadStats,
        earnedAwards: { edges, pageInfo }
      }
    }
  }
}

async function fetchTrailblazerBadgesInfo(trailheadUsername) {
  return fetchAwards(trailheadUsername, 'badges')
}

async function fetchTrailblazerSuperBadgesInfo(trailheadUsername) {
  return fetchAwards(trailheadUsername, 'superbadges', 'SUPERBADGE')
}

async function fetchTrailblazerEventBadgesInfo(trailheadUsername) {
  return fetchAwards(trailheadUsername, 'event badges', 'EVENT')
}

async function fetchTrailblazerCertifsInfo(trailheadUsername) {
  const profile = await request(
    'certifications',
    trailheadUsername,
    PROFILE_ENDPOINT,
    GET_TRAILBLAZER_CERTIFS,
    { hasSlug: true, slug: trailheadUsername, count: PAGE_SIZE },
    payload => {
      const p = publicProfile(payload)
      if (!Array.isArray(p.credential?.certifications)) {
        throw incomplete('credential.certifications')
      }
      return p
    }
  )
  return {
    data: {
      profile: {
        __typename: profile.__typename,
        id: profile.id,
        credential: {
          messages: profile.credential.messages,
          messagesOnly: profile.credential.messagesOnly,
          brands: profile.credential.brands,
          certifications: profile.credential.certifications
        }
      }
    }
  }
}

async function fetchTrailblazerSkillsInfo(trailheadUsername) {
  const profile = await request(
    'skills',
    trailheadUsername,
    PROFILE_ENDPOINT,
    GET_TRAILBLAZER_SKILLS,
    { hasSlug: true, slug: trailheadUsername },
    payload => {
      const p = publicProfile(payload)
      if (!Array.isArray(p.earnedSkills)) throw incomplete('earnedSkills')
      return p
    }
  )
  return {
    data: {
      profile: {
        __typename: profile.__typename,
        id: profile.id,
        earnedSkills: profile.earnedSkills
      }
    }
  }
}

async function fetchTrailblazerEarnedStampsInfo(trailheadUsername) {
  const { edges, pageInfo } = await fetchAllPages(after =>
    request(
      'stamps',
      trailheadUsername,
      MOBILE_ENDPOINT,
      GET_TRAILBLAZER_EARNED_STAMPS,
      {
        first: PAGE_SIZE,
        count: PAGE_SIZE,
        after,
        hasSlug: true,
        slug: trailheadUsername
      },
      payload => {
        if (!hasPage(payload.earnedStamps)) throw incomplete('earnedStamps')
        return { connection: payload.earnedStamps }
      }
    )
  )
  return { data: { earnedStamps: { edges, pageInfo } } }
}

module.exports = {
  retryConfig,
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
}
