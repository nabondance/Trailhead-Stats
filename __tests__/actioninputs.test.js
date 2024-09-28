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
    inputs.cardPath = './images'
    inputs.showSkillNumber = 123
    inputs.outputOnly = false
    inputs.noCommit = false
    inputs.showSkill = 'visible'
    inputs.showCertification = 'detail'
    inputs.showCertificationLatest = 'visible'
    inputs.showBadge = 'hidden'
    inputs.showBadgeLatest = 'visible'
    inputs.showSuperBadge = 'icon'
    inputs.showSuperBadgeLatest = 'visible'
    inputs.showEventBadge = 'icon'
    inputs.showEventBadgeLatest = 'visible'
    inputs.showStamp = 'icon'
    inputs.showStampLatest = 'visible'
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

  // Tests for validateCardPath
  describe('validateCardPath', () => {
    it('should throw an error if cardPath is empty', () => {
      inputs.cardPath = ''

      expect(() => {
        inputs.validateCardPath()
      }).toThrow('card-path is required.')
    })

    it('should throw an error if cardPath is not a string', () => {
      inputs.cardPath = 123

      expect(() => {
        inputs.validateCardPath()
      }).toThrow('card-path must be a string, got number: 123')
    })

    it('should not throw an error for a valid cardPath', () => {
      inputs.cardPath = './images'

      expect(() => {
        inputs.validateCardPath()
      }).not.toThrow()
    })
  })

  // Tests for validateCardPath
  describe('validateshowSkillNumber', () => {
    it('should throw an error if showSkillNumber is not an integer', () => {
      inputs.showSkillNumber = 'notAnInteger'

      expect(() => {
        inputs.validateshowSkillNumber()
      }).toThrow(
        'show-skill-number must be an integer, got string: notAnInteger'
      )
    })

    it('should not throw an error for a valid showSkillNumber', () => {
      inputs.cardPath = './images'

      expect(() => {
        inputs.validateshowSkillNumber()
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

  // Tests for validateShowSkill
  describe('validateShowSkill', () => {
    it('should throw an error if show-skill is not a valid value', () => {
      inputs.showSkill = 'invalidValue'

      expect(() => {
        inputs.validateShowSkill()
      }).toThrow(
        'show-skill must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-skill', () => {
      inputs.showSkill = 'visible'

      expect(() => {
        inputs.validateShowSkill()
      }).not.toThrow()
    })
  })

  // Tests for validateShowCertification
  describe('validateShowCertification', () => {
    it('should throw an error if show-certification is not a valid value', () => {
      inputs.showCertification = 'invalidValue'

      expect(() => {
        inputs.validateShowCertification()
      }).toThrow(
        'show-certification must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-certification', () => {
      inputs.showCertification = 'detail'

      expect(() => {
        inputs.validateShowCertification()
      }).not.toThrow()
    })
  })

  // Tests for validateShowCertificationLatest
  describe('validateShowCertificationLatest', () => {
    it('should throw an error if show-certification-latest is not a valid value', () => {
      inputs.showCertificationLatest = 'invalidValue'

      expect(() => {
        inputs.validateShowCertificationLatest()
      }).toThrow(
        'show-certification-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-certification-latest', () => {
      inputs.showCertificationLatest = 'visible'

      expect(() => {
        inputs.validateShowCertificationLatest()
      }).not.toThrow()
    })
  })

  // Tests for validateShowBadge
  describe('validateShowBadge', () => {
    it('should throw an error if show-badge is not a valid value', () => {
      inputs.showBadge = 'invalidValue'

      expect(() => {
        inputs.validateShowBadge()
      }).toThrow(
        'show-badge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-badge', () => {
      inputs.showBadge = 'number'

      expect(() => {
        inputs.validateShowBadge()
      }).not.toThrow()
    })
  })

  // Tests for validateShowBadgeLatest
  describe('validateShowBadgeLatest', () => {
    it('should throw an error if show-badge-latest is not a valid value', () => {
      inputs.showBadgeLatest = 'invalidValue'

      expect(() => {
        inputs.validateShowBadgeLatest()
      }).toThrow(
        'show-badge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-badge-latest', () => {
      inputs.showBadgeLatest = 'visible'

      expect(() => {
        inputs.validateShowBadgeLatest()
      }).not.toThrow()
    })
  })

  // Tests for validateshowSuperBadge
  describe('validateshowSuperBadge', () => {
    it('should throw an error if show-superbadge is not a valid value', () => {
      inputs.showSuperBadge = 'invalidValue'

      expect(() => {
        inputs.validateshowSuperBadge()
      }).toThrow(
        'show-superbadge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-superbadge', () => {
      inputs.showSuperBadge = 'icon'

      expect(() => {
        inputs.validateshowSuperBadge()
      }).not.toThrow()
    })
  })

  // Tests for validateshowSuperBadgeLatest
  describe('validateshowSuperBadgeLatest', () => {
    it('should throw an error if show-superbadge-latest is not a valid value', () => {
      inputs.showSuperBadgeLatest = 'invalidValue'

      expect(() => {
        inputs.validateshowSuperBadgeLatest()
      }).toThrow(
        'show-superbadge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-superbadge-latest', () => {
      inputs.showSuperBadgeLatest = 'visible'

      expect(() => {
        inputs.validateshowSuperBadgeLatest()
      }).not.toThrow()
    })
  })

  // Tests for validateShowEventBadge
  describe('validateShowEventBadge', () => {
    it('should throw an error if show-event-badge is not a valid value', () => {
      inputs.showEventBadge = 'invalidValue'

      expect(() => {
        inputs.validateShowEventBadge()
      }).toThrow(
        'show-event-badge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-event-badge', () => {
      inputs.showEventBadge = 'icon'

      expect(() => {
        inputs.validateShowEventBadge()
      }).not.toThrow()
    })
  })

  // Tests for validateShowEventBadgeLatest
  describe('validateShowEventBadgeLatest', () => {
    it('should throw an error if show-event-badge-latest is not a valid value', () => {
      inputs.showEventBadgeLatest = 'invalidValue'

      expect(() => {
        inputs.validateShowEventBadgeLatest()
      }).toThrow(
        'show-event-badge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-event-badge-latest', () => {
      inputs.showEventBadgeLatest = 'visible'

      expect(() => {
        inputs.validateShowEventBadgeLatest()
      }).not.toThrow()
    })
  })

  // Tests for validateShowStamp
  describe('validateShowStamp', () => {
    it('should throw an error if show-stamp is not a valid value', () => {
      inputs.showStamp = 'invalidValue'

      expect(() => {
        inputs.validateShowStamp()
      }).toThrow(
        'show-stamp must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-stamp', () => {
      inputs.showStamp = 'icon'

      expect(() => {
        inputs.validateShowStamp()
      }).not.toThrow()
    })
  })

  // Tests for validateShowStampLatest
  describe('validateShowStampLatest', () => {
    it('should throw an error if show-stamp-latest is not a valid value', () => {
      inputs.showStampLatest = 'invalidValue'

      expect(() => {
        inputs.validateShowStampLatest()
      }).toThrow(
        'show-stamp-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should not throw an error for a valid show-stamp-latest', () => {
      inputs.showStampLatest = 'visible'

      expect(() => {
        inputs.validateShowStampLatest()
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

    it('should call setFailed for invalid cardPath', () => {
      inputs.cardPath = 123

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: card-path must be a string, got number: 123'
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

    it('should call setFailed for invalid show-skill', () => {
      inputs.showSkill = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-skill must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-certification', () => {
      inputs.showCertification = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-certification must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-certification-latest', () => {
      inputs.showCertificationLatest = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-certification-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-badge', () => {
      inputs.showBadge = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-badge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-badge-latest', () => {
      inputs.showBadgeLatest = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-badge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-superbadge', () => {
      inputs.showSuperBadge = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-superbadge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-superbadge-latest', () => {
      inputs.showSuperBadgeLatest = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-superbadge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-event-badge', () => {
      inputs.showEventBadge = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-event-badge must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-event-badge-latest', () => {
      inputs.showEventBadgeLatest = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-event-badge-latest must be one of [hidden, visible], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-stamp', () => {
      inputs.showStamp = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-stamp must be one of [hidden, icon, table, detail, number], got: invalidValue'
      )
    })

    it('should call setFailed for invalid show-stamp-latest', () => {
      inputs.showStampLatest = 'invalidValue'

      inputs.validateInputs()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error during inputs validation: show-stamp-latest must be one of [hidden, visible], got: invalidValue'
      )
    })
  })
})
