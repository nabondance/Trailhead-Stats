const { generateCss, getSkillColor } = require('../src/cardCss')

describe('cardCss Tests', () => {
  describe('getStyle function', () => {
    it('should return correct style string for light', () => {
      const expectedStyleString = '--color-background: white;'

      const result = generateCss('light', '')

      expect(result).toContain(expectedStyleString)
    })
  })

  it('should return correct style string for dark dimmed', () => {
    const expectedStyleString = '--color-background: #202830;'

    const result = generateCss('dark', 'dimmed')

    expect(result).toContain(expectedStyleString)
  })

  it('should return correct style string for dark dark', () => {
    const expectedStyleString = '--color-background: #0E1117;'

    const result = generateCss('dark', 'dark')

    expect(result).toContain(expectedStyleString)
  })

  it('should return correct style string for dark high-contrast', () => {
    const expectedStyleString = '--color-background: #02040A;'

    const result = generateCss('dark', 'high-contrast')

    expect(result).toContain(expectedStyleString)
  })

  describe('getSkillColor function', () => {
    it('should return correct skill colors for light theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'light')
      const resultThresholdMedium = getSkillColor(11, thresholds, 'light')
      const resultThresholdHigh = getSkillColor(21, thresholds, 'light')

      expect(resultThresholdLow).toContain('#1E2761')
      expect(resultThresholdMedium).toContain('#408EC6')
      expect(resultThresholdHigh).toContain('#7A2048')
    })

    it('should return correct skill colors for dark theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'dark')
      const resultThresholdMedium = getSkillColor(11, thresholds, 'dark')
      const resultThresholdHigh = getSkillColor(21, thresholds, 'dark')

      expect(resultThresholdLow).toContain('#4078c0')
      expect(resultThresholdMedium).toContain('#c9510c')
      expect(resultThresholdHigh).toContain('#6e5494')
    })

    it('should return correct skill colors for olympic theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'dark', 'olympic')
      const resultThresholdMedium = getSkillColor(
        11,
        thresholds,
        'dark',
        'olympic'
      )
      const resultThresholdHigh = getSkillColor(
        21,
        thresholds,
        'dark',
        'olympic'
      )

      expect(resultThresholdLow).toContain('#a77044')
      expect(resultThresholdMedium).toContain('#a7a7ad')
      expect(resultThresholdHigh).toContain('#d6af36')
    })

    it('should return correct skill colors for halloween theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(
        1,
        thresholds,
        'dark',
        'halloween'
      )
      const resultThresholdMedium = getSkillColor(
        11,
        thresholds,
        'dark',
        'halloween'
      )
      const resultThresholdHigh = getSkillColor(
        21,
        thresholds,
        'dark',
        'halloween'
      )

      expect(resultThresholdLow).toContain('#631c03')
      expect(resultThresholdMedium).toContain('#bd561d')
      expect(resultThresholdHigh).toContain('#fa7a18')
    })

    it('should return correct skill colors for winter theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'dark', 'winter')
      const resultThresholdMedium = getSkillColor(
        11,
        thresholds,
        'dark',
        'winter'
      )
      const resultThresholdHigh = getSkillColor(
        21,
        thresholds,
        'dark',
        'winter'
      )

      expect(resultThresholdLow).toContain('#0A3069')
      expect(resultThresholdMedium).toContain('#0969DA')
      expect(resultThresholdHigh).toContain('#54AEFF')
    })

    it('should return correct skill colors for spring theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'dark', 'spring')
      const resultThresholdMedium = getSkillColor(
        11,
        thresholds,
        'dark',
        'spring'
      )
      const resultThresholdHigh = getSkillColor(
        21,
        thresholds,
        'dark',
        'spring'
      )

      expect(resultThresholdLow).toContain('#229fa9')
      expect(resultThresholdMedium).toContain('#49e5aa')
      expect(resultThresholdHigh).toContain('#f4649e')
    })

    it('should return correct skill colors for summer theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThresholdLow = getSkillColor(1, thresholds, 'dark', 'summer')
      const resultThresholdMedium = getSkillColor(
        11,
        thresholds,
        'dark',
        'summer'
      )
      const resultThresholdHigh = getSkillColor(
        21,
        thresholds,
        'dark',
        'summer'
      )

      expect(resultThresholdLow).toContain('#0e4429')
      expect(resultThresholdMedium).toContain('#006d32')
      expect(resultThresholdHigh).toContain('#39d353')
    })
  })
})
