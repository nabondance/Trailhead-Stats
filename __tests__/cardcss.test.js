const { generateCss, getSkillColor } = require('../src/cardCss')

describe('cardCss Tests', () => {
  describe('getStyle function', () => {
    it('should return correct style string for light', () => {
      const expectedStyleString = 'background-color: #f4f4f4;'

      const result = generateCss('light')

      expect(result).toContain(expectedStyleString)
    })
  })

  describe('getSkillColor function', () => {
    it('should return correct skill colors', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }

      const resultThreshold1 = getSkillColor(1, thresholds)
      const resultThreshold2 = getSkillColor(11, thresholds)
      const resultThreshold3 = getSkillColor(21, thresholds)

      expect(resultThreshold1).toContain('#1E2761')
      expect(resultThreshold2).toContain('#408EC6')
      expect(resultThreshold3).toContain('#7A2048')
    })
  })
})
