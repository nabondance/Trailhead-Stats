jest.mock('axios')
jest.mock('@actions/core')
const axios = require('axios')
const core = require('@actions/core')
const {
  retryConfig,
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
} = require('./../src/getStats')

const PROFILE = 'https://profile.api.trailhead.com/graphql'
const MOBILE = 'https://mobile.api.trailhead.com/graphql'
const OPTIONS = {
  headers: { 'Content-Type': 'application/json' },
  timeout: retryConfig.timeoutMs
}

// axios resolves with `{ data: <GraphQL body> }`.
const ok = data => ({ data: { data } })
const gqlErrors = (...errors) => ({ data: { errors, data: null } })
const httpError = status =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status }
  })

const stats = {
  earnedPointsSum: 1000,
  earnedBadgesCount: 10,
  superbadgeCount: 1,
  rank: { title: 'Ranger', imageUrl: 'rank.png' }
}
const rankData = {
  profile: { __typename: 'PublicProfile', trailheadStats: stats }
}
const page = (edges, hasNextPage = false, endCursor = null) => ({
  edges,
  pageInfo: { hasNextPage, endCursor }
})
const awardsData = connection => ({
  profile: {
    __typename: 'PublicProfile',
    trailheadStats: stats,
    earnedAwards: connection
  }
})
const certifsData = {
  profile: {
    __typename: 'PublicProfile',
    id: 'p1',
    credential: {
      messages: [],
      messagesOnly: false,
      brands: [],
      certifications: [{ title: 'Admin' }]
    }
  }
}
const skillsData = {
  profile: {
    __typename: 'PublicProfile',
    id: 'p1',
    earnedSkills: [{ earnedPointsSum: 5 }]
  }
}
const stampsData = connection => ({ earnedStamps: connection })

beforeEach(() => {
  jest.resetAllMocks()
  retryConfig.delaysMs = [0, 0]
})

describe('successful fetches keep the v2 return shapes', () => {
  it('rank', async () => {
    axios.post.mockResolvedValue(ok(rankData))

    await expect(fetchTrailblazerRankInfo('user')).resolves.toEqual({
      data: rankData
    })
    expect(axios.post).toHaveBeenCalledWith(
      PROFILE,
      {
        query: expect.any(String),
        variables: { hasSlug: true, slug: 'user' }
      },
      OPTIONS
    )
  })

  it.each([
    ['badges', fetchTrailblazerBadgesInfo, undefined],
    ['superbadges', fetchTrailblazerSuperBadgesInfo, 'SUPERBADGE'],
    ['event badges', fetchTrailblazerEventBadgesInfo, 'EVENT']
  ])('%s, across pages', async (_label, fetch, filter) => {
    axios.post
      .mockResolvedValueOnce(ok(awardsData(page([{ id: 1 }], true, 'c1'))))
      .mockResolvedValueOnce(ok(awardsData(page([{ id: 2 }]))))

    await expect(fetch('user')).resolves.toEqual({
      data: {
        profile: {
          __typename: 'PublicProfile',
          trailheadStats: stats,
          earnedAwards: {
            edges: [{ id: 1 }, { id: 2 }],
            pageInfo: { hasNextPage: false, endCursor: null }
          }
        }
      }
    })
    const variables = after => ({
      count: 100,
      after,
      ...(filter ? { filter } : {}),
      hasSlug: true,
      slug: 'user'
    })
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      PROFILE,
      { query: expect.any(String), variables: variables(null) },
      OPTIONS
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      PROFILE,
      { query: expect.any(String), variables: variables('c1') },
      OPTIONS
    )
  })

  it('certifications', async () => {
    axios.post.mockResolvedValue(ok(certifsData))

    await expect(fetchTrailblazerCertifsInfo('user')).resolves.toEqual({
      data: certifsData
    })
    expect(axios.post).toHaveBeenCalledWith(
      PROFILE,
      {
        query: expect.any(String),
        variables: { hasSlug: true, slug: 'user', count: 100 }
      },
      OPTIONS
    )
  })

  it('certifications, none earned', async () => {
    const none = structuredClone(certifsData)
    none.profile.credential.certifications = []
    axios.post.mockResolvedValue(ok(none))

    await expect(fetchTrailblazerCertifsInfo('user')).resolves.toEqual({
      data: none
    })
  })

  it('skills', async () => {
    axios.post.mockResolvedValue(ok(skillsData))

    await expect(fetchTrailblazerSkillsInfo('user')).resolves.toEqual({
      data: skillsData
    })
  })

  it('stamps, across pages', async () => {
    axios.post
      .mockResolvedValueOnce(ok(stampsData(page([{ id: 1 }], true, 's1'))))
      .mockResolvedValueOnce(ok(stampsData(page([{ id: 2 }]))))

    await expect(fetchTrailblazerEarnedStampsInfo('user')).resolves.toEqual({
      data: {
        earnedStamps: {
          edges: [{ id: 1 }, { id: 2 }],
          pageInfo: { hasNextPage: false, endCursor: null }
        }
      }
    })
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      MOBILE,
      {
        query: expect.any(String),
        variables: {
          first: 100,
          count: 100,
          after: 's1',
          hasSlug: true,
          slug: 'user'
        }
      },
      OPTIONS
    )
  })
})

describe('fails closed', () => {
  it('retries null trailheadStats, then succeeds', async () => {
    axios.post
      .mockResolvedValueOnce(
        ok({ profile: { __typename: 'PublicProfile', trailheadStats: null } })
      )
      .mockResolvedValueOnce(ok(rankData))

    await expect(fetchTrailblazerRankInfo('user')).resolves.toEqual({
      data: rankData
    })
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('trailheadStats is missing')
    )
  })

  it('throws when trailheadStats stays null', async () => {
    axios.post.mockResolvedValue(
      ok({ profile: { __typename: 'PublicProfile', trailheadStats: null } })
    )

    await expect(fetchTrailblazerRankInfo('user')).rejects.toThrow(
      'Could not fetch Trailhead rank for "user" after 3 attempts: incomplete response, trailheadStats is missing'
    )
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it('throws on GraphQL errors returned with HTTP 200', async () => {
    axios.post.mockResolvedValue(gqlErrors({ message: 'Internal failure' }))

    await expect(fetchTrailblazerSkillsInfo('user')).rejects.toThrow(
      'GraphQL error: Internal failure'
    )
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it('throws when the body has no data', async () => {
    axios.post.mockResolvedValue({ data: {} })

    await expect(fetchTrailblazerRankInfo('user')).rejects.toThrow(
      'response has no data'
    )
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it('does not retry an unknown username', async () => {
    axios.post.mockResolvedValue(
      gqlErrors({
        message: 'profile could not be found',
        extensions: { code: 'NOT_FOUND' }
      })
    )

    await expect(fetchTrailblazerRankInfo('nobody')).rejects.toThrow(
      'Could not fetch Trailhead rank for "nobody": profile not found (profile could not be found)'
    )
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it('does not retry a private profile', async () => {
    axios.post.mockResolvedValue(
      ok({ profile: { __typename: 'PrivateProfile' } })
    )

    await expect(fetchTrailblazerBadgesInfo('user')).rejects.toThrow(
      'the profile is private'
    )
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it('retries network errors and timeouts', async () => {
    axios.post
      .mockRejectedValueOnce(new Error('timeout of 30000ms exceeded'))
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce(ok(skillsData))

    await expect(fetchTrailblazerSkillsInfo('user')).resolves.toEqual({
      data: skillsData
    })
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it('does not retry a 400', async () => {
    axios.post.mockRejectedValue(httpError(400))

    await expect(fetchTrailblazerCertifsInfo('user')).rejects.toThrow(
      'request failed: Request failed with status code 400'
    )
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it('throws when a later page fails instead of returning partial data', async () => {
    axios.post
      .mockResolvedValueOnce(ok(awardsData(page([{ id: 1 }], true, 'c1'))))
      .mockRejectedValue(new Error('socket hang up'))

    await expect(fetchTrailblazerBadgesInfo('user')).rejects.toThrow(
      'Could not fetch Trailhead badges for "user" after 3 attempts: request failed: socket hang up'
    )
  })

  it('throws when pagination does not advance', async () => {
    axios.post.mockResolvedValue(ok(stampsData(page([{ id: 1 }], true, null))))

    await expect(fetchTrailblazerEarnedStampsInfo('user')).rejects.toThrow(
      'Trailhead pagination did not advance'
    )
  })

  it('throws when pagination cycles', async () => {
    axios.post
      .mockResolvedValueOnce(ok(stampsData(page([{ id: 1 }], true, 'a'))))
      .mockResolvedValueOnce(ok(stampsData(page([{ id: 2 }], true, 'b'))))
      .mockResolvedValueOnce(ok(stampsData(page([{ id: 3 }], true, 'a'))))

    await expect(fetchTrailblazerEarnedStampsInfo('user')).rejects.toThrow(
      'Trailhead pagination did not advance'
    )
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it.each([
    [
      'certifications',
      fetchTrailblazerCertifsInfo,
      { profile: { credential: null } }
    ],
    ['skills', fetchTrailblazerSkillsInfo, { profile: { earnedSkills: null } }],
    ['stamps', fetchTrailblazerEarnedStampsInfo, { earnedStamps: null }],
    ['badges', fetchTrailblazerBadgesInfo, awardsData(null)],
    ['rank', fetchTrailblazerRankInfo, { profile: null }]
  ])('throws on an incomplete %s response', async (_label, fetch, data) => {
    axios.post.mockResolvedValue(ok(data))

    await expect(fetch('user')).rejects.toThrow('incomplete response')
  })

  it('waits between attempts', async () => {
    retryConfig.delaysMs = [20, 20]
    axios.post
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(ok(skillsData))

    const start = Date.now()
    await fetchTrailblazerSkillsInfo('user')
    expect(Date.now() - start).toBeGreaterThanOrEqual(15)
  })
})
