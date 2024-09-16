const {
  generateCard,
  generateHtmlContent,
  hashHtml
} = require('../src/cardGenerator')
const puppeteer = require('puppeteer')

// Mocking Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setViewport: jest.fn().mockResolvedValue(null),
      setContent: jest.fn().mockResolvedValue(null),
      screenshot: jest.fn().mockResolvedValue('image data'),
      $: jest.fn().mockResolvedValue({
        screenshot: jest.fn().mockResolvedValue('element image data')
      })
      // ... other necessary mock implementations
    }),
    close: jest.fn().mockResolvedValue(null)
  })
}))

// Mocking @actions/core
jest.mock('@actions/core')

describe('cardGenerator Tests', () => {
  // Mocks
  const mockData = {
    rank: 'Triple Star Ranger',
    rankIcon:
      'https://res.cloudinary.com/trailhead/image/upload/public-trailhead/assets/images/ranks/triple-star-ranger.png',
    nbBadges: 481,
    badgeDetails: [
      {
        title: 'Quest For Data Literacy',
        iconUrl:
          'https://dfc-static-production.s3.amazonaws.com/resource/images/trailhead/badges/community/trailhead_community_quest_data_literacy.png'
      }
    ],
    lastBadge: 'Quest For Data Literacy',
    points: 185400,
    trails: 45,
    nbSuperBadges: 5,
    superbadgeDetails: [
      {
        title: 'Access Governance Superbadge Unit',
        iconUrl:
          'https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/superbadges/superbadge_governing_access_sbu/476d05ca5f8e4373526963bf410cc2e0_badge.png',
        webUrl:
          'https://trailhead.salesforce.com/content/learn/superbadges/superbadge_governing_access_sbu'
      }
    ],
    lastSuperbadge: 'Access Governance Superbadge Unit',
    nbCertifs: 1,
    certificationsDetails: [
      {
        title: 'Salesforce Certified Platform App Builder',
        dateCompleted: '2021-4-2',
        status: 'Active',
        logoUrl:
          'https://drm.file.force.com/servlet/servlet.ImageServer?id=0153k00000A5Mtl&oid=00DF0000000gZsu&lastMod=1617268490000'
      }
    ],
    lastCertif: 'Salesforce Certified Associate',
    skillPointsDetails: [
      { name: 'CRM', points: 30325 },
      { name: 'Chatter', points: 1250 }
    ],
    nbEarnedStamps: 1,
    lastEarnedStamps: 'Salesforce stamp',
    earnedStampsDetails: [
      {
        name: 'Salesforce stamp',
        kind: 'EVENT_IN_PERSON',
        iconUrl:
          'https://res.cloudinary.com/hy4kyit2a/f_auto,q_85,w_200/trailblazer-stamps/dreamforce-2023.png',
        eventDate: '2023-09-12T07:00:00.000+0000'
      }
    ]
  }

  let mockInputs
  beforeEach(() => {
    mockInputs = {
      trailheadUsername: 'username',
      displayFile: 'dummyFile.txt',
      displayType: 'text',
      fileFormat: 'md',
      cardPath: './path/to/',
      nbSkills: 123,
      outputOnly: 'false',
      noCommit: false
    }
  })

  describe('generateCard function', () => {
    it('should correctly generate a card', async () => {
      const result = await generateCard(mockData, mockInputs, 'theme')

      // Assertions
      expect(result).toBe('path/to/TScard-theme.png')
      expect(puppeteer.launch).toHaveBeenCalled()
      // More assertions to verify correct function behavior
    })

    it('should work when no data', async () => {
      const result = await generateCard({}, mockInputs, undefined)

      // Assertions
      expect(result).toBe('path/to/TScard-undefined.png')
      expect(puppeteer.launch).toHaveBeenCalled()
      // More assertions to verify correct function behavior
    })

    // Additional tests for edge cases and error handling
  })

  // Tests for helper functions
  describe('cardGenerator Utility Function Tests', () => {
    describe('hashHtml function', () => {
      it('should return consistent hash for same HTML content', () => {
        const htmlContent = '<div>Test HTML</div>'
        const expectedHash =
          'addb544db9c5173e2423f19919d704ceb37e6f7e919ccecff84691b636407cdd'

        const result = hashHtml(htmlContent)

        expect(result).toBe(expectedHash)
      })

      // Tests for different HTML contents and edge cases
    })
  })

  // Snapshot tests for HTML/CSS output
  describe('Snapshot testing', () => {
    it('should match the snapshot', async () => {
      const htmlContent = generateHtmlContent(mockData, mockInputs, 'light')

      expect(htmlContent).toMatchSnapshot()
    })
  })

  // Integration tests
  describe('Integration testing', () => {
    // Your integration testing logic
  })
})
