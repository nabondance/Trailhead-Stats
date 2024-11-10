const {
  generateCss,
  getSkillColorMap,
  getSkillThemeColors,
  getSkillBackgroundColor
} = require('../src/cardCss')

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

  describe('getSkillColorMap function', () => {
    it('should return correct skill color map with custom colors', () => {
      const inputs = {
        showSkillCustomColorHigh: '#HIGH',
        showSkillCustomColorMedium: '#MEDIUM',
        showSkillCustomColorLow: '#LOW'
      }
      const resultMap = getSkillColorMap('light', inputs)

      expect(resultMap.get('high')).toContain('#HIGH')
      expect(resultMap.get('medium')).toContain('#MEDIUM')
      expect(resultMap.get('low')).toContain('#LOW')
    })

    it('should return correct skill color map with default theme', () => {
      const inputs = {}
      const resultMap = getSkillColorMap('light', inputs)

      expect(resultMap.get('high')).toEqual('#7A2048')
      expect(resultMap.get('medium')).toEqual('#408EC6')
      expect(resultMap.get('low')).toEqual('#1E2761')
    })

    it('should return correct skill color map with specified theme', () => {
      const inputs = { showSkillTheme: 'olympic' }
      const resultMap = getSkillColorMap('light', inputs)

      expect(resultMap.get('high')).toEqual('#d6af36')
      expect(resultMap.get('medium')).toEqual('#a7a7ad')
      expect(resultMap.get('low')).toEqual('#a77044')
    })
  })

  describe('getSkillThemeColors function', () => {
    it('should return correct skill color map if the theme is default light', () => {
      const resultMap = getSkillThemeColors('light', 'default')

      expect(resultMap.get('high')).toEqual('#7A2048')
      expect(resultMap.get('medium')).toEqual('#408EC6')
      expect(resultMap.get('low')).toEqual('#1E2761')
    })

    it('should return correct skill color map if the theme is default dark', () => {
      const resultMap = getSkillThemeColors('dark', 'default')

      expect(resultMap.get('high')).toEqual('#6e5494')
      expect(resultMap.get('medium')).toEqual('#c9510c')
      expect(resultMap.get('low')).toEqual('#4078c0')
    })

    it('should return correct skill color map if the theme is olympic', () => {
      const resultMap = getSkillThemeColors('light', 'olympic')

      expect(resultMap.get('high')).toEqual('#d6af36')
      expect(resultMap.get('medium')).toEqual('#a7a7ad')
      expect(resultMap.get('low')).toEqual('#a77044')
    })

    it('should return correct skill color map if the theme is halloween', () => {
      const resultMap = getSkillThemeColors('light', 'halloween')

      expect(resultMap.get('high')).toEqual('#fa7a18')
      expect(resultMap.get('medium')).toEqual('#bd561d')
      expect(resultMap.get('low')).toEqual('#631c03')
    })

    it('should return correct skill color map if the theme is winter', () => {
      const resultMap = getSkillThemeColors('light', 'winter')

      expect(resultMap.get('high')).toEqual('#54AEFF')
      expect(resultMap.get('medium')).toEqual('#0969DA')
      expect(resultMap.get('low')).toEqual('#0A3069')
    })

    it('should return correct skill color map if the theme is spring', () => {
      const resultMap = getSkillThemeColors('light', 'spring')

      expect(resultMap.get('high')).toEqual('#f4649e')
      expect(resultMap.get('medium')).toEqual('#49e5aa')
      expect(resultMap.get('low')).toEqual('#229fa9')
    })

    it('should return correct skill color map if the theme is summer', () => {
      const resultMap = getSkillThemeColors('light', 'summer')

      expect(resultMap.get('high')).toEqual('#39d353')
      expect(resultMap.get('medium')).toEqual('#006d32')
      expect(resultMap.get('low')).toEqual('#0e4429')
    })
  })

  describe('getSkillBackgroundColor function', () => {
    it('should return correct skill colors based on the color map', () => {
      const thresholds = { threshold1: 10, threshold2: 20 }
      const skillColorsMap = new Map([
        ['low', '#LOW'],
        ['medium', '#MEDIUM'],
        ['high', '#HIGH']
      ])

      const resultLow = getSkillBackgroundColor(1, thresholds, skillColorsMap)
      const resultMedium = getSkillBackgroundColor(
        11,
        thresholds,
        skillColorsMap
      )
      const resultHigh = getSkillBackgroundColor(21, thresholds, skillColorsMap)

      expect(resultLow).toContain('#LOW')
      expect(resultMedium).toContain('#MEDIUM')
      expect(resultHigh).toContain('#HIGH')
    })
  })
})
