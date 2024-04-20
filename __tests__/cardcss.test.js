const { generateCss, getSkillColor } = require('../src/cardCss')

describe('cardCss Tests', () => {
  describe('getStyle function', () => {
    it('should return correct style string for light', () => {
      const expectedStyleString = '--color-background: white;'

      const result = generateCss('light')

      expect(result).toContain(expectedStyleString)
    })
  })

  it('should return correct style string for dark', () => {
    const expectedStyleString = '--color-background: #22272D;'

    const result = generateCss('dark')

    expect(result).toContain(expectedStyleString)
  })

  describe('getSkillColor function', () => {
    it('should return correct skill colors for light theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThreshold1 = getSkillColor(1, thresholds, 'light')
      const resultThreshold2 = getSkillColor(11, thresholds, 'light')
      const resultThreshold3 = getSkillColor(21, thresholds, 'light')

      expect(resultThreshold1).toContain('#1E2761')
      expect(resultThreshold2).toContain('#408EC6')
      expect(resultThreshold3).toContain('#7A2048')
    })

    it('should return correct skill colors for dark theme', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThreshold1 = getSkillColor(1, thresholds, 'dark')
      const resultThreshold2 = getSkillColor(11, thresholds, 'dark')
      const resultThreshold3 = getSkillColor(21, thresholds, 'dark')

      expect(resultThreshold1).toContain('#4078c0')
      expect(resultThreshold2).toContain('#c9510c')
      expect(resultThreshold3).toContain('#6e5494')
    })
  })
})
