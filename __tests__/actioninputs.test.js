jest.mock('@actions/core')
const core = require('@actions/core')

const { ActionInputs } = require('../src/actionInputs')

// Do not care about console.error()
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Input Validation Tests', () => {
  // Tests for validateTrailheadUsername
  describe('validateTrailheadUsername', () => {
    it('should throw an error if username is empty', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = ''

      expect(() => {
        inputs.validateTrailheadUsername()
      }).toThrow('trailhead-username is required.')
    })

    it('should throw an error if username is not a string', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 123

      expect(() => {
        inputs.validateTrailheadUsername()
      }).toThrow('trailhead-username must be a string, got number: 123')
    })

    it('should not throw an error for a valid username', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 'validUsername'

      expect(() => {
        inputs.validateTrailheadUsername()
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayType
  describe('validateDisplayType', () => {
    it('should throw an error if displayType is empty', () => {
      const inputs = new ActionInputs()
      inputs.displayType = ''

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow('display-type is required.')
    })

    it('should throw an error if displayType is not a string', () => {
      const inputs = new ActionInputs()
      inputs.displayType = 123

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow('display-type must be a string, got number: 123')
    })

    it('should throw an error if displayType is invalid', () => {
      const inputs = new ActionInputs()
      inputs.displayType = 'invalidType'

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow(
        "Invalid display-type 'invalidType'. Allowed types are: text, card, output, html"
      )
    })

    it('should not throw an error for a valid displayType', () => {
      const inputs = new ActionInputs()
      inputs.displayType = 'text'

      expect(() => {
        inputs.validateDisplayType()
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayFile
  describe('validateDisplayFile', () => {
    it('should throw an error if displayFile is empty', () => {
      const inputs = new ActionInputs()
      inputs.displayFile = ''

      expect(() => {
        inputs.validateDisplayFile()
      }).toThrow('display-file is required.')
    })

    it('should throw an error if displayFile is not a string', () => {
      const inputs = new ActionInputs()
      inputs.displayFile = 123

      expect(() => {
        inputs.validateDisplayFile()
      }).toThrow('display-file must be a string, got number: 123')
    })

    it('should not throw an error for a valid displayFile', () => {
      const inputs = new ActionInputs()
      inputs.displayFile = 'README.md'

      expect(() => {
        inputs.validateDisplayFile()
      }).not.toThrow()
    })
  })

  // Tests for validateOutputOnly
  describe('validateOutputOnly', () => {
    it('should throw an error if outputOnly is not a boolean', () => {
      const inputs = new ActionInputs()
      inputs.outputOnly = 'notABoolean'

      expect(() => {
        inputs.validateOutputOnly()
      }).toThrow('output-only must be a boolean, got string: notABoolean')
    })

    it('should not throw an error for a valid outputOnly', () => {
      const inputs = new ActionInputs()
      inputs.outputOnly = true

      expect(() => {
        inputs.validateOutputOnly()
      }).not.toThrow()
    })
  })

  // Test for validateAllInputs with valid inputs
  describe('validateAllInputs with valid inputs', () => {
    it('should not throw an error for valid inputs', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 'validUsername'
      inputs.displayFile = 'README.md'
      inputs.displayType = 'text'
      inputs.outputOnly = false

      expect(() => {
        inputs.validateInputs()
      }).not.toThrow()
    })
  })
  // Test for validateAllInputs with invalid inputs
  describe('validateAllInputs error handling', () => {
    it('should call setFailed for invalid username', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = ''
      inputs.displayFile = 'README.md'
      inputs.displayType = 'text'
      inputs.outputOnly = false

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: trailhead-username is required.'
      )
    })

    it('should call setFailed for invalid displayType', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 'validUsername'
      inputs.displayFile = 'README.md'
      inputs.displayType = 'invalidType'
      inputs.outputOnly = false

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        "Error during inputs validation: Invalid display-type 'invalidType'. Allowed types are: text, card, output, html"
      )
    })

    it('should call setFailed for invalid displayFile', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 'validUsername'
      inputs.displayFile = 123
      inputs.displayType = 'invalidType'
      inputs.outputOnly = false

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: display-file must be a string, got number: 123'
      )
    })

    it('should call setFailed for invalid outputOnly', () => {
      const inputs = new ActionInputs()
      inputs.trailheadUsername = 'validUsername'
      inputs.displayFile = 'README.md'
      inputs.displayType = 'invalidType'
      inputs.outputOnly = 'notABoolean'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: output-only must be a boolean, got string: notABoolean'
      )
    })
  })
})
