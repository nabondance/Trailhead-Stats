const axios = require('axios')
const {
  GET_TRAILBLAZER_RANK,
  GET_TRAILBLAZER_BADGES,
  GET_TRAILBLAZER_CERTIFS,
  GET_TRAILBLAZER_SKILLS,
  GET_TRAILBLAZER_EARNED_STAMPS
} = require('./queries')

// Define the extractData function for each specific function
const extractRankData = (response, profileData, allEdges, pageInfo) => {
  if (!profileData) {
    profileData = {
      __typename: response.data.data.profile.__typename,
      trailheadStats: response.data.data.profile.trailheadStats
    }
  }

  return {
    newProfileData: profileData,
    newAllEdges: allEdges,
    newPageInfo: pageInfo
  }
}

const extractBadgesData = (response, profileData, allEdges, pageInfo) => {
  if (!profileData) {
    profileData = {
      __typename: response.data.data.profile.__typename,
      trailheadStats: response.data.data.profile.trailheadStats
    }
  }

  allEdges = allEdges.concat(response.data.data.profile.earnedAwards.edges)
  pageInfo = response.data.data.profile.earnedAwards.pageInfo

  return {
    newProfileData: profileData,
    newAllEdges: allEdges,
    newPageInfo: pageInfo
  }
}

const extractCertifsData = (response, profileData, allEdges, pageInfo) => {
  if (!profileData) {
    profileData = {
      __typename: response.data.data.profile.__typename,
      id: response.data.data.profile.id,
      credential: {
        messages: response.data.data.profile.credential.messages,
        messagesOnly: response.data.data.profile.credential.messagesOnly,
        brands: response.data.data.profile.credential.brands
      }
    }
  }

  allEdges = allEdges.concat(
    response.data.data.profile.credential.certifications
  )

  return {
    newProfileData: profileData,
    newAllEdges: allEdges,
    newPageInfo: pageInfo
  }
}

const extractSkillsData = (response, profileData, allEdges, pageInfo) => {
  if (!profileData) {
    profileData = {
      __typename: response.data.data.profile.__typename,
      id: response.data.data.profile.id
    }
  }

  allEdges = allEdges.concat(response.data.data.profile.earnedSkills)

  return {
    newProfileData: profileData,
    newAllEdges: allEdges,
    newPageInfo: pageInfo
  }
}

const extractStampsData = (response, profileData, allEdges, pageInfo) => {
  allEdges = allEdges.concat(response.data.data.earnedStamps.edges)
  pageInfo = response.data.data.earnedStamps.pageInfo

  return {
    newProfileData: profileData,
    newAllEdges: allEdges,
    newPageInfo: pageInfo
  }
}

// Define the factorized fetchData function
async function fetchData(
  endpoint,
  graphqlQuery,
  extractData,
  maxPage = 100,
  currentPage = 1,
  profileData = null,
  allEdges = [],
  pageInfo = null
) {
  console.log('fetchData')
  console.log('endpoint: ', endpoint)
  console.log('graphqlQuery: ', graphqlQuery)
  console.log('maxPage: ', maxPage)
  console.log('currentPage: ', currentPage)
  console.log('profileData: ', profileData)
  console.log('allEdges: ', allEdges)
  console.log('pageInfo: ', pageInfo)

  if (currentPage > maxPage) {
    return {
      data: {
        profile: {
          ...profileData,
          earnedAwards: { edges: allEdges, pageInfo }
        }
      }
    }
  }

  try {
    const response = await axios.post(endpoint, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const { newProfileData, newAllEdges, newPageInfo } = extractData(
      response,
      profileData,
      allEdges,
      pageInfo
    )

    if (newPageInfo != undefined && !newPageInfo.hasNextPage) {
      console.log('newPageInfo: ', newPageInfo)
      return {
        data: {
          profile: {
            ...newProfileData,
            earnedAwards: { edges: newAllEdges, pageInfo: newPageInfo }
          }
        }
      }
    }

    return await fetchData(
      endpoint,
      graphqlQuery,
      extractData,
      maxPage,
      currentPage + 1,
      newProfileData,
      newAllEdges,
      newPageInfo
    )
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

// Use the fetchData function in each specific function
async function fetchTrailblazerRankInfo(trailheadUsername) {
  console.log('fetchTrailblazerRankInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_RANK,
    variables: {
      count: 100,
      after: null,
      filter: null,
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractRankData)
}

async function fetchTrailblazerBadgesInfo(trailheadUsername) {
  console.log('fetchTrailblazerBadgesInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_BADGES,
    variables: {
      count: 100,
      after: null,
      filter: null,
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractBadgesData)
}

async function fetchTrailblazerSuperBadgesInfo(trailheadUsername) {
  console.log('fetchTrailblazerSuperBadgesInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_BADGES,
    variables: {
      count: 100,
      after: null,
      filter: 'SUPERBADGE',
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractBadgesData)
}

async function fetchTrailblazerEventBadgesInfo(trailheadUsername) {
  console.log('fetchTrailblazerEventBadgesInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_BADGES,
    variables: {
      count: 100,
      after: null,
      filter: 'EVENT',
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractBadgesData)
}

async function fetchTrailblazerCertifsInfo(trailheadUsername) {
  console.log('fetchTrailblazerCertifsInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_CERTIFS,
    variables: {
      hasSlug: true,
      slug: trailheadUsername,
      count: 100
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractCertifsData)
}

async function fetchTrailblazerSkillsInfo(trailheadUsername) {
  console.log('fetchTrailblazerSkillsInfo')
  const endpoint = 'https://profile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_SKILLS,
    variables: {
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractSkillsData)
}

async function fetchTrailblazerEarnedStampsInfo(trailheadUsername) {
  console.log('fetchTrailblazerEarnedStampsInfo')
  const endpoint = 'https://mobile.api.trailhead.com/graphql'
  const graphqlQuery = {
    query: GET_TRAILBLAZER_EARNED_STAMPS,
    variables: {
      first: 100,
      count: 100,
      after: null,
      hasSlug: true,
      slug: trailheadUsername
    }
  }

  return await fetchData(endpoint, graphqlQuery, extractStampsData)
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
