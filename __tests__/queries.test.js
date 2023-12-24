const {
  GET_TRAILBLAZER_RANK,
  GET_TRAILBLAZER_BADGES,
  GET_TRAILBLAZER_CERTIFS,
  GET_TRAILBLAZER_SKILLS
} = require('./../src/queries')

describe('GraphQL Queries Test', () => {
  test('GET_TRAILBLAZER_RANK query structure', () => {
    expect(GET_TRAILBLAZER_RANK).toContain(
      'fragment TrailheadRank on TrailheadRank'
    )
    expect(GET_TRAILBLAZER_RANK).toContain(
      'fragment PublicProfile on PublicProfile'
    )
    expect(GET_TRAILBLAZER_RANK).toContain('query GetTrailheadRank')
  })

  test('GET_TRAILBLAZER_BADGES query structure', () => {
    expect(GET_TRAILBLAZER_BADGES).toContain(
      'fragment EarnedAward on EarnedAwardBase'
    )
    expect(GET_TRAILBLAZER_BADGES).toContain(
      'fragment ProfileBadges on PublicProfile'
    )
    expect(GET_TRAILBLAZER_BADGES).toContain('query GetTrailheadBadges')
  })

  test('GET_TRAILBLAZER_CERTIFS query structure', () => {
    expect(GET_TRAILBLAZER_CERTIFS).toContain('query GetUserCertifications')
    expect(GET_TRAILBLAZER_CERTIFS).toContain('... on PublicProfile')
  })

  test('GET_TRAILBLAZER_SKILLS query structure', () => {
    expect(GET_TRAILBLAZER_SKILLS).toContain(
      'fragment EarnedSkill on EarnedSkill'
    )
    expect(GET_TRAILBLAZER_SKILLS).toContain('query GetEarnedSkills')
  })
})
