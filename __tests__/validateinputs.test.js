jest.mock('@actions/core')
const core = require('@actions/core')

const {
  validateAllInputs,
  validateTrailheadUsername,
  validateDisplayType,
  validateDisplayFile,
  validateOutputOnly
} = require('./../src/validateInputs') // Adjust the import path as needed

describe('Input Validation Tests', () => {
  // Tests for validateTrailheadUsername
  describe('validateTrailheadUsername', () => {
    it('should throw an error if username is empty', () => {
      expect(() => {
        validateTrailheadUsername('')
      }).toThrow('trailhead-username is required.')
    })

    it('should throw an error if username is not a string', () => {
      expect(() => {
        validateTrailheadUsername(123)
      }).toThrow('trailhead-username must be a string, got number: 123')
    })

    it('should not throw an error for a valid username', () => {
      expect(() => {
        validateTrailheadUsername('validUsername')
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayType
  describe('validateDisplayType', () => {
    it('should throw an error if displayType is empty', () => {
      expect(() => {
        validateDisplayType('')
      }).toThrow('display-type is required.')
    })

    it('should throw an error if displayType is not a string', () => {
      expect(() => {
        validateDisplayType(123)
      }).toThrow('display-type must be a string, got number: 123')
    })

    it('should throw an error if displayType is invalid', () => {
      expect(() => {
        validateDisplayType('invalidType')
      }).toThrow(
        "Invalid display-type 'invalidType'. Allowed types are: text, card, output, html"
      )
    })

    it('should not throw an error for a valid displayType', () => {
      expect(() => {
        validateDisplayType('text')
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayFile
  describe('validateDisplayFile', () => {
    it('should throw an error if displayFile is empty', () => {
      expect(() => {
        validateDisplayFile('')
      }).toThrow('display-file is required.')
    })

    it('should throw an error if displayFile is not a string', () => {
      expect(() => {
        validateDisplayFile(123)
      }).toThrow('display-file must be a string, got number: 123')
    })

    it('should not throw an error for a valid displayFile', () => {
      expect(() => {
        validateDisplayFile('README.md')
      }).not.toThrow()
    })
  })

  // Tests for validateOutputOnly
  describe('validateOutputOnly', () => {
    it('should throw an error if outputOnly is not a boolean', () => {
      expect(() => {
        validateOutputOnly('notABoolean')
      }).toThrow('output-only must be a boolean, got string: notABoolean')
    })

    it('should not throw an error for a valid outputOnly', () => {
      expect(() => {
        validateOutputOnly(true)
      }).not.toThrow()
    })
  })

  // Test for validateAllInputs with valid inputs
  describe('validateAllInputs with valid inputs', () => {
    it('should not throw an error for valid inputs', () => {
      expect(() => {
        validateAllInputs('validUsername', 'text', 'README.md', false)
      }).not.toThrow()
    })
  })
  // Test for validateAllInputs with invalid inputs
  describe('validateAllInputs error handling', () => {
    it('should call setFailed for invalid username', () => {
      validateAllInputs('', 'text', 'README.md', false)
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: trailhead-username is required.'
      )
    })

    it('should call setFailed for invalid displayType', () => {
      validateAllInputs('validUsername', 'invalidType', 'README.md', false)
      expect(core.setFailed).toHaveBeenCalledWith(
        "Error during inputs validation: Invalid display-type 'invalidType'. Allowed types are: text, card, output, html"
      )
    })

    it('should call setFailed for invalid displayFile', () => {
      validateAllInputs('validUsername', 'text', 123, false)
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: display-file must be a string, got number: 123'
      )
    })

    it('should call setFailed for invalid outputOnly', () => {
      validateAllInputs('validUsername', 'text', 'README.md', 'notABoolean')
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: output-only must be a boolean, got string: notABoolean'
      )
    })
  })
})
