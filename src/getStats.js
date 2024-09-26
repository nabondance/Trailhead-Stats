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

  const graphqlQuery = {
    query: GET_TRAILBLAZER_BADGES,
    variables: {
      count: 10,
      after: null,
      filter: null,
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

async function fetchTrailblazerSuperBadgesInfo(trailheadUsername) {
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

async function fetchTrailblazerEventBadgesInfo(trailheadUsername) {
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

async function fetchTrailblazerCertifsInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'

  const graphqlQuery = {
    query: GET_TRAILBLAZER_CERTIFS,
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

async function fetchTrailblazerSkillsInfo(trailheadUsername) {
  const endpoint = 'https://profile.api.trailhead.com/graphql'

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

    return response.data
  } catch (error) {
    console.error('Error fetching data: ', error)
    return null
  }
}

async function fetchTrailblazerEarnedStampsInfo(trailheadUsername) {
  const endpoint = 'https://mobile.api.trailhead.com/graphql'

  const graphqlQuery = {
    query: GET_TRAILBLAZER_EARNED_STAMPS,
    variables: {
      slug: trailheadUsername,
      first: 10
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

module.exports = {
  fetchTrailblazerRankInfo,
  fetchTrailblazerBadgesInfo,
  fetchTrailblazerSuperBadgesInfo,
  fetchTrailblazerEventBadgesInfo,
  fetchTrailblazerCertifsInfo,
  fetchTrailblazerSkillsInfo,
  fetchTrailblazerEarnedStampsInfo
}
