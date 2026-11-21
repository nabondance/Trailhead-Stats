// Synthetic Trailhead responses, in the shapes returned by src/getStats.js.
// Icons are inline so that rendering needs no network.
const icon = color =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23${color}'/%3E%3C/svg%3E`

const award = (title, color) => ({
  node: {
    award: {
      title,
      icon: icon(color),
      content: { webUrl: `https://example.com/${title.replace(/ /g, '-')}` }
    }
  }
})

const awards = (edges, superbadgeCount = 0) => ({
  data: {
    profile: {
      __typename: 'PublicProfile',
      trailheadStats: { superbadgeCount },
      earnedAwards: {
        edges,
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    }
  }
})

const rank = (title, points, badges, trails) => ({
  data: {
    profile: {
      __typename: 'PublicProfile',
      trailheadStats: {
        earnedPointsSum: points,
        earnedBadgesCount: badges,
        completedTrailCount: trails,
        rank: { title, imageUrl: icon('1b96ff') }
      }
    }
  }
})

const certifs = certifications => ({
  data: { profile: { credential: { certifications } } }
})

const skills = earnedSkills => ({ data: { profile: { earnedSkills } } })

const stamps = edges => ({
  data: {
    earnedStamps: {
      edges,
      pageInfo: { hasNextPage: false, endCursor: null }
    }
  }
})

function fullProfile() {
  return [
    rank('Ranger', 123456, 321, 42),
    awards([
      award('Apex Basics', '2e844a'),
      award('Flow Fundamentals', 'dd7a01')
    ]),
    awards([award('Security Specialist', '9050e9')], 1),
    awards([award('World Tour Paris', 'ba0517')]),
    certifs([
      {
        title: 'Platform Administrator',
        dateCompleted: '2023-03-15',
        status: { title: 'Active' },
        logoUrl: icon('0176d3')
      },
      {
        title: 'Platform Developer',
        dateCompleted: '2024-06-20',
        status: { title: 'Expired' },
        logoUrl: icon('706e6b')
      }
    ]),
    skills([
      { skill: { name: 'Apex' }, earnedPointsSum: 50000 },
      { skill: { name: 'Flow' }, earnedPointsSum: 12000 },
      { skill: { name: 'Security' }, earnedPointsSum: 3000 }
    ]),
    stamps([
      {
        node: {
          name: 'Dreamforce',
          eventDate: '2024-09-17',
          kind: 'EVENT_IN_PERSON',
          eventLocation: 'San Francisco',
          iconUrl: icon('fe9339')
        }
      },
      {
        node: {
          name: 'Community Live',
          eventDate: '2025-01-10',
          kind: 'EVENT_VIRTUAL',
          iconUrl: icon('06a59a')
        }
      }
    ])
  ]
}

function emptyProfile() {
  return [
    rank('Scout', 0, 0, 0),
    awards([]),
    awards([]),
    awards([]),
    certifs([]),
    skills([]),
    stamps([])
  ]
}

// Uses every card display shape: detail, number, icon and table.
const fixtureInputs = {
  trailheadUsername: 'fixture-user',
  displayFile: 'README.md',
  displayType: 'text',
  fileFormat: 'md',
  cardPath: 'images',
  darkStyle: 'dimmed',
  outputOnly: 'true',
  noCommit: 'true',
  showSkill: 'visible',
  showSkillNumber: 5,
  showSkillTheme: 'default',
  showSkillCustomColorHigh: '',
  showSkillCustomColorMedium: '',
  showSkillCustomColorLow: '',
  showCertification: 'detail',
  showCertificationLatest: 'visible',
  showBadge: 'number',
  showBadgeLatest: 'visible',
  showSuperBadge: 'icon',
  showSuperBadgeLatest: 'visible',
  showEventBadge: 'detail',
  showEventBadgeLatest: 'visible',
  showStamp: 'table',
  showStampLatest: 'visible'
}

module.exports = { fixtureInputs, fullProfile, emptyProfile }
