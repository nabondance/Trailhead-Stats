const displayStats = require('./../src/displayStats')
const cardGenerator = require('.././src/cardGenerator')
const core = require('@actions/core')

jest.mock('@actions/core')
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

// Mock generateCard function
jest.mock('../src/cardGenerator', () => ({
  ...jest.requireActual('../src/cardGenerator'),
  generateCard: jest.fn()
}))

describe('displayStats Function', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockTrailheadRankData = {
    data: {
      profile: {
        trailheadStats: {
          earnedPointsSum: 185300,
          earnedBadgesCount: 480,
          completedTrailCount: 44,
          rank: {
            title: 'Triple Star Ranger',
            requiredPointsSum: 150000,
            requiredBadgesCount: 300,
            imageUrl:
              'https://res.cloudinary.com/trailhead/image/upload/public-trailhead/assets/images/ranks/triple-star-ranger.png'
          },
          nextRank: {
            title: 'Four Star Ranger',
            requiredPointsSum: 200000,
            requiredBadgesCount: 400,
            imageUrl:
              'https://res.cloudinary.com/trailhead/image/upload/public-trailhead/assets/images/ranks/four-star-ranger.png'
          }
        }
      }
    }
  }

  const mockTrailheadCertifsData = {
    data: {
      profile: {
        credential: {
          certifications: [
            {
              title: 'Salesforce Certified Platform App Builder',
              dateCompleted: '2021-4-2',
              status: {
                title: 'Active'
              }
            },
            {
              title: 'Salesforce Certified Associate',
              dateCompleted: '2023-4-23',
              status: {
                title: 'Active'
              }
            }
          ]
        }
      }
    }
  }

  const mockTrailheadBadgesData = {
    data: {
      profile: {
        earnedAwards: {
          edges: [
            {
              node: {
                award: {
                  title: "Administrator Certification Maintenance (Spring '23)",
                  icon: 'https://example.com/admin-cert-maintenance.png',
                  content: {
                    webUrl:
                      'https://trailhead.salesforce.com/example-admin-cert'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }

  const mockTrailheadSuperBadgesData = {
    data: {
      profile: {
        trailheadStats: {
          __typename: 'TrailheadProfileStats',
          earnedBadgesCount: 103,
          superbadgeCount: 3
        },
        earnedAwards: {
          edges: [
            {
              node: {
                award: {
                  title: 'Advanced Billing Specialist',
                  type: 'SUPERBADGE',
                  icon: 'https://example.com/advanced-billing-specialist.png',
                  content: {
                    webUrl:
                      'https://trailhead.salesforce.com/example-billing-specialist'
                  }
                }
              }
            }
            // ... more superbadges
          ]
        }
      }
    }
  }

  const mockTrailheadSkillsData = {
    data: {
      profile: {
        earnedSkills: [
          {
            skill: {
              name: 'Chatter'
            },
            earnedPointsSum: 30325
          },
          {
            skill: {
              name: 'CRM'
            },
            earnedPointsSum: 1250
          }
          // ... more skills
        ]
      }
    }
  }

  const mockTrailheadEarnedStampsData = {
    data: {
      earnedStamps: {
        count: 1,
        totalCount: 1,
        edges: [
          {
            node: {
              __typename: 'StampEarned',
              rewardId: 'a2S7y000000ApbGEAS',
              kind: 'EVENT_IN_PERSON',
              apiName: 'dreamforce-in-person-san-francisco-2023',
              name: "Dreamforce '23",
              description:
                'The largest AI event in the world has one of the most legendary bands in the world. Rock out to support a great cause. Proceeds benefit UCSF Benioff Children’s Hospitals.',
              eventDate: '2023-09-12T07:00:00.000+0000',
              eventLocation: 'San Francisco, CA',
              iconUrl:
                'https://res.cloudinary.com/hy4kyit2a/f_auto,q_85,w_200/trailblazer-stamps/dreamforce-2023.png',
              linkUrl: null
            }
          },
          {
            node: {
              __typename: 'StampEarned',
              rewardId: 'a2S7y000000ApbGEAS',
              kind: 'EVENT_IN_PERSON',
              apiName: 'dreamforce-in-person-san-francisco-2024',
              name: "Dreamforce '24",
              description:
                'The largest AI event in the world has one of the most legendary bands in the world. Rock out to support a great cause. Proceeds benefit UCSF Benioff Children’s Hospitals.',
              eventDate: '2024-09-12T07:00:00.000+0000',
              eventLocation: 'San Francisco, CA',
              iconUrl:
                'https://res.cloudinary.com/hy4kyit2a/f_auto,q_85,w_200/trailblazer-stamps/dreamforce-2024.png',
              linkUrl: null
            }
          }
        ]
      }
    }
  }

  let inputs
  beforeEach(() => {
    inputs = {
      trailheadUsername: 'username',
      displayFile: 'dummyFile.txt',
      displayType: 'text',
      fileFormat: 'md',
      cardPath: 'images',
      outputOnly: 'false'
    }
  })

  it('should fail if there is no rank in md', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    const result = await displayStats(
      inputs,
      undefined, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(setFailedMock).toHaveBeenCalledWith(undefined)
  })

  it('should fail if there is no rank in html', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    inputs.fileFormat = 'html'

    const result = await displayStats(
      inputs,
      undefined, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(setFailedMock).toHaveBeenCalledWith(undefined)
  })

  it('should fail if the display type is not allowed', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    inputs.displayType = 'badType'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(setFailedMock).toHaveBeenCalledWith(
      'badType is not an accepted type'
    )
  })

  it('should correctly format and display rank stats', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(core.info).toHaveBeenCalledWith(expect.any(String))
    expect(result).toContain('Rank: Triple Star Ranger')
    expect(result).toContain('Badges: 480')
    expect(result).toContain('Points: 185300')
    expect(result).toContain('Number of trails completed: 44')
  })

  it('should correctly format and display badge stats', async () => {
    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Badges: 480')
  })

  it('should correctly format and display superbadge stats', async () => {
    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Number of Superbadge: 3')
  })

  it('should correctly format and display certification stats', async () => {
    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(core.info).toHaveBeenCalledWith(expect.any(String))
    expect(result).toContain('Number of Certification: 2')
  })

  it('should correctly format and display skill stats', async () => {
    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Chatter')
  })

  it('should correctly format and display earned stamps stats', async () => {
    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain(`Dreamforce '24`)
  })

  it('should correctly format and display as output', async () => {
    inputs.displayType = 'output'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result.nbBadges).toBe(480)
  })

  it('should correctly format and display as text md', async () => {
    inputs.fileFormat = 'md'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Badges: 480')
  })

  it('should correctly format and display as text html', async () => {
    inputs.fileFormat = 'html'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('480</li>')
  })

  it('should correctly format and display as card md', async () => {
    // Setup the mock to return a specific value
    cardGenerator.generateCard.mockResolvedValue('path/to/generated/card.png')
    inputs.displayType = 'card'
    inputs.fileFormat = 'md'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    // Check if the result contains the path returned by the mocked generateCard function
    expect(result).toContain('![Trailhead-Stats](path/to/generated/card.png)')
    expect(cardGenerator.generateCard).toHaveBeenCalledWith(
      expect.anything(), // The data object passed to generateCard
      'images' // The cardPath argument passed to displayStats
    )
  })

  it('should correctly format and display as card html', async () => {
    // Setup the mock to return a specific value
    cardGenerator.generateCard.mockResolvedValue('path/to/generated/card.png')
    inputs.displayType = 'card'
    inputs.fileFormat = 'html'

    const result = await displayStats(
      inputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    // Check if the result contains the path returned by the mocked generateCard function
    expect(result).toContain(
      '<a href="https://www.salesforce.com/trailblazer/username"><img src="path/to/generated/card.png"></a>'
    )
    expect(cardGenerator.generateCard).toHaveBeenCalledWith(
      expect.anything(), // The data object passed to generateCard
      'images' // The cardPath argument passed to displayStats
    )
  })
})
