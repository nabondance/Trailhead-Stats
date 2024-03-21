const { generateCss } = require('../src/cardCss')

describe('cardCss Tests', () => {
  describe('getStyle function', () => {
    it('should return correct style string for white', () => {
      const expectedStyleString = 'background-color: #f4f4f4;'

      const result = generateCss('light')

      expect(result).toContain(expectedStyleString)
    })
  })
})
