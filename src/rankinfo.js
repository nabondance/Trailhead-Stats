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
