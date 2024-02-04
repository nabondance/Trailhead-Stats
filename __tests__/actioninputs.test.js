jest.mock('@actions/core')
const core = require('@actions/core')

const { ActionInputs } = require('../src/actionInputs')

// Do not care about console.error()
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Input Validation Tests', () => {
  let inputs
  beforeEach(() => {
    inputs = new ActionInputs()
    inputs.trailheadUsername = 'validUsername'
    inputs.displayFile = 'README.md'
    inputs.displayType = 'text'
    inputs.fileFormat = 'md'
    inputs.outputOnly = false
    inputs.noCommit = false
  })

  // Tests for validateTrailheadUsername
  describe('validateTrailheadUsername', () => {
    it('should throw an error if username is empty', () => {
      inputs.trailheadUsername = ''

      expect(() => {
        inputs.validateTrailheadUsername()
      }).toThrow('trailhead-username is required.')
    })

    it('should throw an error if username is not a string', () => {
      inputs.trailheadUsername = 123

      expect(() => {
        inputs.validateTrailheadUsername()
      }).toThrow('trailhead-username must be a string, got number: 123')
    })

    it('should not throw an error for a valid username', () => {
      inputs.trailheadUsername = 'validUsername'

      expect(() => {
        inputs.validateTrailheadUsername()
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayType
  describe('validateDisplayType', () => {
    it('should throw an error if displayType is empty', () => {
      inputs.displayType = ''

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow('display-type is required.')
    })

    it('should throw an error if displayType is not a string', () => {
      inputs.displayType = 123

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow('display-type must be a string, got number: 123')
    })

    it('should throw an error if displayType is invalid', () => {
      inputs.displayType = 'invalidType'

      expect(() => {
        inputs.validateDisplayType()
      }).toThrow(
        "Invalid display-type 'invalidType'. Allowed types are: text, card, output"
      )
    })

    it('should not throw an error for a valid displayType', () => {
      inputs.displayType = 'text'

      expect(() => {
        inputs.validateDisplayType()
      }).not.toThrow()
    })
  })

  // Tests for validateDisplayFile
  describe('validateDisplayFile', () => {
    it('should throw an error if displayFile is empty', () => {
      inputs.displayFile = ''

      expect(() => {
        inputs.validateDisplayFile()
      }).toThrow('display-file is required.')
    })

    it('should throw an error if displayFile is not a string', () => {
      inputs.displayFile = 123

      expect(() => {
        inputs.validateDisplayFile()
      }).toThrow('display-file must be a string, got number: 123')
    })

    it('should not throw an error for a valid displayFile', () => {
      inputs.displayFile = 'README.md'

      expect(() => {
        inputs.validateDisplayFile()
      }).not.toThrow()
    })
  })

  // Tests for validateFileFormat
  describe('validateFileFormat', () => {
    it('should throw an error if fileFormat is empty', () => {
      inputs.fileFormat = ''

      expect(() => {
        inputs.validateFileFormat()
      }).toThrow('file-format is required.')
    })

    it('should throw an error if fileFormat is not a string', () => {
      inputs.fileFormat = 123

      expect(() => {
        inputs.validateFileFormat()
      }).toThrow('file-format must be a string, got number: 123')
    })

    it('should throw an error if fileFormat is invalid', () => {
      inputs.fileFormat = 'invalidFormat'

      expect(() => {
        inputs.validateFileFormat()
      }).toThrow(
        "Invalid file-format 'invalidFormat'. Allowed types are: md, html"
      )
    })

    it('should not throw an error for a valid fileFormat', () => {
      inputs.fileFormat = 'md'

      expect(() => {
        inputs.validateFileFormat()
      }).not.toThrow()
    })
  })

  // Tests for validateOutputOnly
  describe('validateOutputOnly', () => {
    it('should throw an error if outputOnly is not a boolean', () => {
      inputs.outputOnly = 'notABoolean'

      expect(() => {
        inputs.validateOutputOnly()
      }).toThrow('output-only must be a boolean, got string: notABoolean')
    })

    it('should not throw an error for a valid outputOnly', () => {
      inputs.outputOnly = true

      expect(() => {
        inputs.validateOutputOnly()
      }).not.toThrow()
    })
  })

  // Tests for validateNoCommit
  describe('validateNoCommit', () => {
    it('should throw an error if noCommit is not a boolean', () => {
      inputs.noCommit = 'notABoolean'

      expect(() => {
        inputs.validateNoCommit()
      }).toThrow('no-commit must be a boolean, got string: notABoolean')
    })

    it('should not throw an error for a valid no-commit', () => {
      inputs.noCommit = true

      expect(() => {
        inputs.validateNoCommit()
      }).not.toThrow()
    })
  })

  // Test for validateAllInputs with valid inputs
  describe('validateAllInputs with valid inputs', () => {
    it('should not throw an error for valid inputs', () => {
      expect(() => {
        inputs.validateInputs()
      }).not.toThrow()
    })
  })
  // Test for validateAllInputs with invalid inputs
  describe('validateAllInputs error handling', () => {
    it('should call setFailed for invalid username', () => {
      inputs.trailheadUsername = ''

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: trailhead-username is required.'
      )
    })

    it('should call setFailed for invalid displayType', () => {
      inputs.displayType = 'invalidType'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        "Error during inputs validation: Invalid display-type 'invalidType'. Allowed types are: text, card, output"
      )
    })

    it('should call setFailed for invalid displayFile', () => {
      inputs.displayFile = 123

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: display-file must be a string, got number: 123'
      )
    })

    it('should call setFailed for invalid fileFormat', () => {
      inputs.fileFormat = 'invalidFormat'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        "Error during inputs validation: Invalid file-format 'invalidFormat'. Allowed types are: md, html"
      )
    })

    it('should call setFailed for invalid outputOnly', () => {
      inputs.outputOnly = 'notABoolean'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: output-only must be a boolean, got string: notABoolean'
      )
    })

    it('should call setFailed for invalid noCommit', () => {
      inputs.noCommit = 'notABoolean'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: no-commit must be a boolean, got string: notABoolean'
      )
    })
  })
})
