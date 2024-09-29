jest.mock('axios')
const axios = require('axios')
const {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
} = require('./../src/getStats')

describe('fetches successfully data from the API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches successfully data from the API: TrailblazerRank', async () => {
    const mockData = {
      data: {
        profile: {
          /* mock profile data */
        }
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
        profile: {
          earnedAwards: {
            edges: [],
            pageInfo: null
          }
        }
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData)
  })

  it('fetches successfully data from the API: TrailblazerSuperBadges', async () => {
    const mockData = {
      data: {
        profile: {
          earnedAwards: {
            edges: [],
            pageInfo: null
          }
        }
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
    expect(response).toEqual(mockData)
  })

  it('fetches successfully data from the API: TrailblazerEventBadges', async () => {
    const mockData = {
      data: {
        profile: {
          earnedAwards: {
            edges: [],
            pageInfo: null
          }
        }
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerEventBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          filter: 'EVENT',
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockData)
  })

  it('fetches successfully data from the API: TrailblazerCertifs', async () => {
    const mockData = {
      data: {
        data: {
          profile: {
            __typename: 'Profile',
            id: '123',
            credential: {
              messages: ['message1', 'message2'],
              messagesOnly: ['messageOnly1', 'messageOnly2'],
              brands: ['brand1', 'brand2'],
              certifications: ['certification1', 'certification2']
            }
          }
        }
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
          slug: 'testUsername',
          count: 100
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
        data: {
          profile: {
            earnedSkills: []
          }
        }
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

  it('fetches successfully data from the API: EarnedStamps', async () => {
    const mockData = {
      data: {
        data: {
          earnedStamps: {
            edges: [],
            pageInfo: null
          }
        }
      }
    }
    axios.post.mockResolvedValue(mockData)

    const response = await fetchTrailblazerEarnedStampsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://mobile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          first: 100,
          count: 100,
          after: null,
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
})

describe('fetches successfully data from the API in multiple pages', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches successfully data in multiple pages from the API: TrailblazerBadges', async () => {
    const mockDataPage1 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge1'],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        }
      }
    }

    const mockDataPage2 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge2'],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'cursor2'
              }
            }
          }
        }
      }
    }

    axios.post
      .mockResolvedValueOnce(mockDataPage1)
      .mockResolvedValueOnce(mockDataPage2)

    const response = await fetchTrailblazerBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(response).toEqual({
      data: {
        profile: {
          earnedAwards: {
            edges: ['edge1', 'edge2'],
            pageInfo: mockDataPage2.data.data.profile.earnedAwards.pageInfo
          }
        }
      }
    })
  })

  it('fetches successfully data in multiple pages from the API: TrailblazerSuperBadges', async () => {
    const mockDataPage1 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge1'],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        }
      }
    }

    const mockDataPage2 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge2'],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'cursor2'
              }
            }
          }
        }
      }
    }

    axios.post
      .mockResolvedValueOnce(mockDataPage1)
      .mockResolvedValueOnce(mockDataPage2)

    const response = await fetchTrailblazerSuperBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(response).toEqual({
      data: {
        profile: {
          earnedAwards: {
            edges: ['edge1', 'edge2'],
            pageInfo: mockDataPage2.data.data.profile.earnedAwards.pageInfo
          }
        }
      }
    })
  })

  it('fetches successfully data in multiple pages from the API: TrailblazerEventBadges', async () => {
    const mockDataPage1 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge1'],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        }
      }
    }

    const mockDataPage2 = {
      data: {
        data: {
          profile: {
            earnedAwards: {
              edges: ['edge2'],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'cursor2'
              }
            }
          }
        }
      }
    }

    axios.post
      .mockResolvedValueOnce(mockDataPage1)
      .mockResolvedValueOnce(mockDataPage2)

    const response = await fetchTrailblazerEventBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(response).toEqual({
      data: {
        profile: {
          earnedAwards: {
            edges: ['edge1', 'edge2'],
            pageInfo: mockDataPage2.data.data.profile.earnedAwards.pageInfo
          }
        }
      }
    })
  })

  it('fetches successfully data in multiple pages from the API: EarnedStamps', async () => {
    const mockDataPage1 = {
      data: {
        data: {
          earnedStamps: {
            edges: ['edge1'],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor1'
            }
          }
        }
      }
    }

    const mockDataPage2 = {
      data: {
        data: {
          earnedStamps: {
            edges: ['edge2'],
            pageInfo: {
              hasNextPage: false,
              endCursor: 'cursor2'
            }
          }
        }
      }
    }

    axios.post
      .mockResolvedValueOnce(mockDataPage1)
      .mockResolvedValueOnce(mockDataPage2)

    const response = await fetchTrailblazerEarnedStampsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(response).toEqual({
      data: {
        earnedStamps: {
          edges: ['edge1', 'edge2'],
          pageInfo: mockDataPage2.data.data.earnedStamps.pageInfo
        }
      }
    })
  })
})

describe('handles API error', () => {
  afterEach(() => {
    jest.clearAllMocks()
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
    const mockErrorResponse = {
      data: { profile: { earnedAwards: { edges: [], pageInfo: null } } }
    }

    const response = await fetchTrailblazerBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerSuperBadges', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()
    const mockErrorResponse = {
      data: { profile: { earnedAwards: { edges: [], pageInfo: null } } }
    }

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
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerEventBadges', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()
    const mockErrorResponse = {
      data: { profile: { earnedAwards: { edges: [], pageInfo: null } } }
    }

    const response = await fetchTrailblazerEventBadgesInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          count: 100,
          after: null,
          filter: 'EVENT',
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerCertifs', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()
    const mockErrorResponse = {
      data: {
        profile: {
          credential: {
            certifications: []
          }
        }
      }
    }

    const response = await fetchTrailblazerCertifsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://profile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          hasSlug: true,
          slug: 'testUsername',
          count: 100
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerSkills', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()
    const mockErrorResponse = {
      data: { profile: { earnedSkills: [] } }
    }

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
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })

  it('handles API error : TrailblazerEarnedStamps', async () => {
    const errorMessage = 'Network Error'
    axios.post.mockRejectedValue(new Error(errorMessage))
    console.error = jest.fn()
    const mockErrorResponse = {
      data: { earnedStamps: { edges: [], pageInfo: null } }
    }

    const response = await fetchTrailblazerEarnedStampsInfo('testUsername')

    expect(axios.post).toHaveBeenCalledWith(
      'https://mobile.api.trailhead.com/graphql',
      {
        query: expect.any(String),
        variables: {
          after: null,
          count: 100,
          first: 100,
          hasSlug: true,
          slug: 'testUsername'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    expect(response).toEqual(mockErrorResponse)
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching data: ',
      expect.any(Error)
    )
  })
})
