const axios = require('axios')
const {
  GET_TRAILBLAZER_RANK,
  GET_TRAILBLAZER_BADGES,
  GET_TRAILBLAZER_CERTIFS,
  GET_TRAILBLAZER_SKILLS,
  GET_TRAILBLAZER_EARNED_STAMPS
} = require('./queries')

async function fetchTrailblazerRankInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'

  const graphqlQuery = {
    query: GET_TRAILBLAZER_RANK,
    variables: {
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  try {
    const response = await axios.post(endpoint, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching data: ', error)
    return null
  }
}

async function fetchTrailblazerBadgesInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  let allEdges = []
  let pageInfo = null
  let profileData = null

  while (true) {
    const graphqlQuery = {
      query: GET_TRAILBLAZER_BADGES,
      variables: {
        count: 100,
        after: pageInfo ? pageInfo.endCursor : null,
        hasSlug: true,
        slug: trailheadUsername
      }
    }

    try {
      const response = await axios.post(endpoint, graphqlQuery, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!profileData) {
        profileData = {
          __typename: response.data.data.profile.__typename,
          trailheadStats: response.data.data.profile.trailheadStats
        }
      }

      allEdges = allEdges.concat(response.data.data.profile.earnedAwards.edges)
      pageInfo = response.data.data.profile.earnedAwards.pageInfo

      if (!pageInfo.hasNextPage) {
        break
      }
    } catch (error) {
      console.error('Error fetching data: ', error)
      return {
        data: {
          profile: {
            ...profileData,
            earnedAwards: { edges: allEdges, pageInfo }
          }
        }
      }
    }
  }

  return {
    data: {
      profile: { ...profileData, earnedAwards: { edges: allEdges, pageInfo } }
    }
  }
}

async function fetchTrailblazerSuperBadgesInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  let allEdges = []
  let pageInfo = null
  let profileData = null

  while (true) {
    const graphqlQuery = {
      query: GET_TRAILBLAZER_BADGES,
      variables: {
        count: 100,
        after: pageInfo ? pageInfo.endCursor : null,
        filter: 'SUPERBADGE',
        hasSlug: true,
        slug: trailheadUsername
      }
    }

    try {
      const response = await axios.post(endpoint, graphqlQuery, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!profileData) {
        profileData = {
          __typename: response.data.data.profile.__typename,
          trailheadStats: response.data.data.profile.trailheadStats
        }
      }

      allEdges = allEdges.concat(response.data.data.profile.earnedAwards.edges)
      pageInfo = response.data.data.profile.earnedAwards.pageInfo

      if (!pageInfo.hasNextPage) {
        break
      }
    } catch (error) {
      console.error('Error fetching data: ', error)
      return {
        data: {
          profile: {
            ...profileData,
            earnedAwards: { edges: allEdges, pageInfo }
          }
        }
      }
    }
  }

  return {
    data: {
      profile: { ...profileData, earnedAwards: { edges: allEdges, pageInfo } }
    }
  }
}

async function fetchTrailblazerEventBadgesInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  let allEdges = []
  let pageInfo = null
  let profileData = null

  while (true) {
    const graphqlQuery = {
      query: GET_TRAILBLAZER_BADGES,
      variables: {
        count: 100,
        after: pageInfo ? pageInfo.endCursor : null,
        filter: 'EVENT',
        hasSlug: true,
        slug: trailheadUsername
      }
    }

    try {
      const response = await axios.post(endpoint, graphqlQuery, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!profileData) {
        profileData = {
          __typename: response.data.data.profile.__typename,
          trailheadStats: response.data.data.profile.trailheadStats
        }
      }

      allEdges = allEdges.concat(response.data.data.profile.earnedAwards.edges)
      pageInfo = response.data.data.profile.earnedAwards.pageInfo

      if (!pageInfo.hasNextPage) {
        break
      }
    } catch (error) {
      console.error('Error fetching data: ', error)
      return {
        data: {
          profile: {
            ...profileData,
            earnedAwards: { edges: allEdges, pageInfo }
          }
        }
      }
    }
  }

  return {
    data: {
      profile: { ...profileData, earnedAwards: { edges: allEdges, pageInfo } }
    }
  }
}

async function fetchTrailblazerCertifsInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  let allCertifications = []
  let profileData = null

  const graphqlQuery = {
    query: GET_TRAILBLAZER_CERTIFS,
    variables: {
      hasSlug: true,
      slug: trailheadUsername,
      count: 100
    }
  }

  try {
    const response = await axios.post(endpoint, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    profileData = {
      __typename: response.data.data.profile.__typename,
      id: response.data.data.profile.id,
      credential: {
        messages: response.data.data.profile.credential.messages,
        messagesOnly: response.data.data.profile.credential.messagesOnly,
        brands: response.data.data.profile.credential.brands
      }
    }

    allCertifications = allCertifications.concat(
      response.data.data.profile.credential.certifications
    )
  } catch (error) {
    console.error('Error fetching data: ', error)
    profileData = profileData || {}
    profileData.credential = profileData.credential || {}
    return {
      data: {
        profile: {
          ...profileData,
          credential: {
            ...profileData.credential,
            certifications: allCertifications
          }
        }
      }
    }
  }

  return {
    data: {
      profile: {
        ...profileData,
        credential: {
          ...profileData.credential,
          certifications: allCertifications
        }
      }
    }
  }
}

async function fetchTrailblazerSkillsInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  let allSkills = []
  let profileData = null

  const graphqlQuery = {
    query: GET_TRAILBLAZER_SKILLS,
    variables: {
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  try {
    const response = await axios.post(endpoint, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    profileData = {
      __typename: response.data.data.profile.__typename,
      id: response.data.data.profile.id
    }

    allSkills = allSkills.concat(response.data.data.profile.earnedSkills)
  } catch (error) {
    console.error('Error fetching data: ', error)
    return {
      data: {
        profile: {
          ...profileData,
          earnedSkills: allSkills
        }
      }
    }
  }

  return {
    data: {
      profile: {
        ...profileData,
        earnedSkills: allSkills
      }
    }
  }
}

async function fetchTrailblazerEarnedStampsInfo(trailheadUsername) {
  const endpoint = 'https://mobile.api.trailhead.com/graphql'
  let allEdges = []
  let pageInfo = null

  while (true) {
    const graphqlQuery = {
      query: GET_TRAILBLAZER_EARNED_STAMPS,
      variables: {
        first: 100,
        count: 100,
        after: pageInfo ? pageInfo.endCursor : null,
        hasSlug: true,
        slug: trailheadUsername
      }
    }

    try {
      const response = await axios.post(endpoint, graphqlQuery, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      allEdges = allEdges.concat(response.data.data.earnedStamps.edges)
      pageInfo = response.data.data.earnedStamps.pageInfo

      if (!pageInfo.hasNextPage) {
        break
      }
    } catch (error) {
      console.error('Error fetching data: ', error)
      return {
        data: {
          earnedStamps: { edges: allEdges, pageInfo }
        }
      }
    }
  }

  return {
    data: {
      earnedStamps: { edges: allEdges, pageInfo }
    }
  }
}

module.exports = {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
}
