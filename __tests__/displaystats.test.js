const { displayStats } = require('./../src/displayStats')
const cardGenerator = require('.././src/cardGenerator')
const core = require('@actions/core')
const fs = require('fs')
const os = require('os')
const path = require('path')

jest.mock('@actions/core')

// Mock generateCard function
jest.mock('../src/cardGenerator', () => ({
  ...jest.requireActual('../src/cardGenerator'),
  generateCard: jest.fn()
}))

// Cards are written into a throwaway workspace. The generateCard stub writes
// a file where the real one would, so the copy step runs for real.
const writeCard = async (_data, inputs, theme) => {
  const file = path.join(inputs.cardPath, `TScard-${theme}.png`)
  fs.writeFileSync(file, `${theme} png`)
  return file
}

describe('displayStats Function', () => {
  const savedWorkspace = process.env.GITHUB_WORKSPACE
  let workspace

  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'th-display-'))
    process.env.GITHUB_WORKSPACE = workspace
    cardGenerator.generateCard.mockImplementation(writeCard)
  })

  afterEach(() => {
    jest.clearAllMocks()
    fs.rmSync(workspace, { recursive: true, force: true })
    if (savedWorkspace === undefined) delete process.env.GITHUB_WORKSPACE
    else process.env.GITHUB_WORKSPACE = savedWorkspace
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

  const mockTrailheadEventBadgesData = {
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
                  title: 'Event',
                  type: 'EVENT',
                  icon: 'https://example.com/event-badge.png',
                  content: {
                    webUrl:
                      'https://trailhead.salesforce.com/example-event-badge'
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

  let mockInputs
  beforeEach(() => {
    mockInputs = {
      trailheadUsername: 'username',
      displayFile: 'dummyFile.txt',
      displayType: 'text',
      fileFormat: 'md',
      cardPath: 'images',
      showSkillNumber: 123,
      outputOnly: 'false',
      noCommit: false
    }
  })

  it('should throw when stats are null, as the API sometimes returns', async () => {
    await expect(
      displayStats(
        mockInputs,
        { data: { profile: { trailheadStats: null } } },
        mockTrailheadBadgesData,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        mockTrailheadCertifsData,
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow('missing: trailheadStats')
  })

  it('should name every missing collection', async () => {
    await expect(
      displayStats(
        mockInputs,
        mockTrailheadRankData,
        undefined,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        { data: { profile: { credential: null } } },
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow('missing: badges, certifications')
  })

  it('should throw when the card cannot be generated (e.g. timeout)', async () => {
    cardGenerator.generateCard.mockRejectedValueOnce(
      new Error('Navigation timeout of 30000 ms exceeded')
    )
    await expect(
      displayStats(
        { ...mockInputs, displayType: 'card' },
        mockTrailheadRankData,
        mockTrailheadBadgesData,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        mockTrailheadCertifsData,
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow(
      'Error generating the card: Navigation timeout of 30000 ms exceeded'
    )
  })

  it('should throw when nothing is rendered', async () => {
    await expect(
      displayStats(
        { ...mockInputs, displayType: 'card', fileFormat: 'pdf' },
        mockTrailheadRankData,
        mockTrailheadBadgesData,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        mockTrailheadCertifsData,
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow('Nothing was rendered for display-type card')
  })

  it('should throw if there is no rank in md', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    await expect(
      displayStats(
        mockInputs,
        undefined, // thRank
        mockTrailheadBadgesData, // thBadges
        mockTrailheadSuperBadgesData, // thSuperBadges
        mockTrailheadEventBadgesData, // thEventBadges
        mockTrailheadCertifsData, // thCertifs
        mockTrailheadSkillsData, // thSkills
        mockTrailheadEarnedStampsData // thEarnedStamps
      )
    ).rejects.toThrow('missing: trailheadStats')
  })

  it('should throw if there is no rank in html', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    mockInputs.fileFormat = 'html'

    await expect(
      displayStats(
        mockInputs,
        undefined, // thRank
        mockTrailheadBadgesData, // thBadges
        mockTrailheadSuperBadgesData, // thSuperBadges
        mockTrailheadEventBadgesData, // thEventBadges
        mockTrailheadCertifsData, // thCertifs
        mockTrailheadSkillsData, // thSkills
        mockTrailheadEarnedStampsData // thEarnedStamps
      )
    ).rejects.toThrow('missing: trailheadStats')
  })

  it('should throw if there is no rank in card', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    mockInputs.fileFormat = 'card'

    await expect(
      displayStats(
        mockInputs,
        undefined, // thRank
        mockTrailheadBadgesData, // thBadges
        mockTrailheadSuperBadgesData, // thSuperBadges
        mockTrailheadEventBadgesData, // thEventBadges
        mockTrailheadCertifsData, // thCertifs
        mockTrailheadSkillsData, // thSkills
        mockTrailheadEarnedStampsData // thEarnedStamps
      )
    ).rejects.toThrow('missing: trailheadStats')
  })

  it('should fail if the display type is not allowed', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    mockInputs.displayType = 'badType'

    await expect(
      displayStats(
        mockInputs,
        mockTrailheadRankData, // thRank
        mockTrailheadBadgesData, // thBadges
        mockTrailheadSuperBadgesData, // thSuperBadges
        mockTrailheadEventBadgesData, // thEventBadges
        mockTrailheadCertifsData, // thCertifs
        mockTrailheadSkillsData, // thSkills
        mockTrailheadEarnedStampsData // thEarnedStamps
      )
    ).rejects.toThrow('badType is not an accepted type')
  })

  it('should correctly format and display rank stats', async () => {
    // Mock other data as empty or minimal for this test
    const mockEmptyData = { data: { profile: {} } }

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Rank: Triple Star Ranger')
    expect(result).toContain('Badges: 480')
    expect(result).toContain('Points: 185300')
    expect(result).toContain('Number of trails completed: 44')
  })

  it('should correctly format and display badge stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Badges: 480')
  })

  it('should correctly format and display superbadge stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Number of Superbadges: 3')
  })

  it('should correctly format and display event badge stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Number of Event Badges: 1')
  })

  it('should correctly format and display certification stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Number of Certification: 2')
  })

  it('should correctly format and display skill stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Chatter')
  })

  it('should correctly format and display earned stamps stats', async () => {
    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain(`Dreamforce '24`)
  })

  it('should correctly format and display as output', async () => {
    mockInputs.displayType = 'output'

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result.nbBadges).toBe(480)
  })

  it('should correctly format and display as text md', async () => {
    mockInputs.fileFormat = 'md'

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('Badges: 480')
  })

  it('should correctly format and display as text html', async () => {
    mockInputs.fileFormat = 'html'

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('480</li>')
  })

  it('should correctly format and display as card md', async () => {
    // Setup the mock to return a specific value
    mockInputs.displayType = 'card'
    mockInputs.fileFormat = 'md'

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    // Check if the result contains the path returned by the mocked generateCard function
    expect(result).toContain('images/TScard-light.png#gh-light-mode-only')
    expect(result).toContain('images/TScard-dark.png#gh-dark-mode-only')
    expect(
      fs.readFileSync(
        path.join(workspace, 'images', 'TScard-light.png'),
        'utf8'
      )
    ).toBe('light png')
  })

  it('should correctly format and display as card html', async () => {
    // Setup the mock to return a specific value
    const cardPathFolder = 'newImages'
    mockInputs.displayType = 'card'
    mockInputs.fileFormat = 'html'
    mockInputs.cardPath = cardPathFolder

    const result = await displayStats(
      mockInputs,
      mockTrailheadRankData, // thRank
      mockTrailheadBadgesData, // thBadges
      mockTrailheadSuperBadgesData, // thSuperBadges
      mockTrailheadEventBadgesData, // thEventBadges
      mockTrailheadCertifsData, // thCertifs
      mockTrailheadSkillsData, // thSkills
      mockTrailheadEarnedStampsData // thEarnedStamps
    )

    expect(result).toContain('srcset="newImages/TScard-dark.png"')
    expect(
      fs.readFileSync(
        path.join(workspace, 'newImages', 'TScard-dark.png'),
        'utf8'
      )
    ).toBe('dark png')
  })

  it('renders both cards aside before replacing any', async () => {
    fs.mkdirSync(path.join(workspace, 'images'))
    fs.writeFileSync(path.join(workspace, 'images', 'TScard-light.png'), 'old')
    cardGenerator.generateCard
      .mockImplementationOnce(writeCard)
      .mockRejectedValueOnce(new Error('dark render timed out'))

    await expect(
      displayStats(
        { ...mockInputs, displayType: 'card', cardPath: 'images' },
        mockTrailheadRankData,
        mockTrailheadBadgesData,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        mockTrailheadCertifsData,
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow('dark render timed out')

    expect(
      fs.readFileSync(
        path.join(workspace, 'images', 'TScard-light.png'),
        'utf8'
      )
    ).toBe('old')
    expect(cardGenerator.generateCard.mock.calls[0][1].cardPath).toContain(
      'th-cards-'
    )
    expect(
      fs.existsSync(cardGenerator.generateCard.mock.calls[0][1].cardPath)
    ).toBe(false)
  })

  it('replaces a symlinked card instead of writing through it', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'th-outside-'))
    fs.writeFileSync(path.join(outside, 'target.png'), 'precious')
    fs.mkdirSync(path.join(workspace, 'images'))
    fs.symlinkSync(
      path.join(outside, 'target.png'),
      path.join(workspace, 'images', 'TScard-light.png')
    )

    await expect(
      displayStats(
        { ...mockInputs, displayType: 'card', cardPath: 'images' },
        mockTrailheadRankData,
        mockTrailheadBadgesData,
        mockTrailheadSuperBadgesData,
        mockTrailheadEventBadgesData,
        mockTrailheadCertifsData,
        mockTrailheadSkillsData,
        mockTrailheadEarnedStampsData
      )
    ).rejects.toThrow('card-path must stay inside the repository')

    expect(fs.readFileSync(path.join(outside, 'target.png'), 'utf8')).toBe(
      'precious'
    )
    fs.rmSync(outside, { recursive: true, force: true })
  })
})
