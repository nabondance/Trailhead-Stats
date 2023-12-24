jest.mock('axios')
const axios = require('axios')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo
} = require('./../src/getStats')

describe('fetchTrailblazerRankInfo', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches successfully data from the API: TrailblazerRank', async () => {
    const mockData = {
      data: {
        /* mock response data */
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerRankInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData.data)
  })

  it('fetches successfully data from the API: TrailblazerBadges', async () => {
    const mockData = {
      data: {
        /* mock response data */
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 10,
          after: null,
          filter: null,
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData.data)
  })

  it('fetches successfully data from the API: TrailblazerSuperBadges', async () => {
    const mockData = {
      data: {
        /* mock response data */
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerSuperBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          filter: 'SUPERBADGE',
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData.data)
  })

  it('fetches successfully data from the API: TrailblazerCertifs', async () => {
    const mockData = {
      data: {
        /* mock response data */
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerCertifsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData.data)
  })

  it('fetches successfully data from the API: TrailblazerSkills', async () => {
    const mockData = {
      data: {
        /* mock response data */
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerSkillsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData.data)
  })

  it('handles API error : TrailblazerRank', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()

    const response = await fetchTrailblazerRankInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerBadges', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()

    const response = await fetchTrailblazerBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 10,
          after: null,
          filter: null,
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerSuperBadges', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()

    const response = await fetchTrailblazerSuperBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          filter: 'SUPERBADGE',
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerCertifs', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()

    const response = await fetchTrailblazerCertifsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerSkills', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()

    const response = await fetchTrailblazerSkillsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })
})
