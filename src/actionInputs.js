const core = require('@actions/core')
const {
  validateRequiredField,
  validateStringField,
  validateIntegerField,
  validateBooleanField,
  validateStringInListField
} = require('./validators')

const validDarkStyle = ['dimmed', 'dark', 'high-contrast']
const validSkillTheme = [
  'default',
  'olympic',
  'halloween',
  'winter',
  'spring',
  'summer'
]
const validHiddenVisible = ['hidden', 'visible']
const validDisplayChoice = ['hidden', 'icon', 'table', 'detail', 'number']

class ActionInputs {
  constructor() {
    this.trailheadUsername = core.getInput('trailhead-username', {
      required: true
    })
    this.displayFile = core.getInput('display-file', { required: false })
    this.displayType = core.getInput('display-type', { required: false })
    this.fileFormat = core.getInput('file-format', { required: false })
    this.cardPath = core.getInput('card-path', { required: false })
    this.showSkillNumber = core.getInput('show-skill-number', {
      required: false
    })
    this.showSkillTheme = core.getInput('show-skill-theme', { required: false })
    this.outputOnly = core.getInput('output-only', { required: false })
    this.noCommit = core.getInput('no-commit', { required: false })
    this.darkStyle = core.getInput('dark-style', { required: false })
    this.showSkill = core.getInput('show-skill', { required: false })
    this.showCertification = core.getInput('show-certification', {
      required: false
    })
    this.showCertificationLatest = core.getInput('show-certification-latest', {
      required: false
    })
    this.showBadge = core.getInput('show-badge', { required: false })
    this.showBadgeLatest = core.getInput('show-badge-latest', {
      required: false
    })
    this.showSuperBadge = core.getInput('show-superbadge', { required: false })
    this.showSuperBadgeLatest = core.getInput('show-superbadge-latest', {
      required: false
    })
    this.showEventBadge = core.getInput('show-event-badge', { required: false })
    this.showEventBadgeLatest = core.getInput('show-event-badge-latest', {
      required: false
    })
    this.showStamp = core.getInput('show-stamp', { required: false })
    this.showStampLatest = core.getInput('show-stamp-latest', {
      required: false
    })

    // Debug
    core.debug('Action inputs:', this)

    // Validate inputs
    this.validateInputs()
  }

  validateInputs() {
    try {
      // Validate inputs
      this.validateTrailheadUsername()
      this.validateDisplayFile()
      this.validateDisplayType()
      this.validateFileFormat()
      this.validateCardPath()
      this.validateShowSkillNumber()
      this.validateShowSkillTheme()
      this.validateOutputOnly()
      this.validateNoCommit()
      this.validateDarkStyle()
      this.validateShowSkill()
      this.validateShowCertification()
      this.validateShowCertificationLatest()
      this.validateShowBadge()
      this.validateShowBadgeLatest()
      this.validateShowSuperBadge()
      this.validateShowSuperBadgeLatest()
      this.validateShowEventBadge()
      this.validateShowEventBadgeLatest()
      this.validateShowStamp()
      this.validateShowStampLatest()
    } catch (error) {
      console.error(`Error during inputs validation: ${error.message}`)
      core.setFailed(`Error during inputs validation: ${error.message}`)
    }
  }

  validateTrailheadUsername() {
    validateRequiredField(this.trailheadUsername, 'trailhead-username')
    validateStringField(this.trailheadUsername, 'trailhead-username')
  }

  validateDisplayType() {
    validateRequiredField(this.displayType, 'display-type')
    validateStringField(this.displayType, 'display-type')

    const allowedTypes = ['text', 'card', 'output']
    if (!allowedTypes.includes(this.displayType)) {
      throw new Error(
        `Invalid display-type '${
          this.displayType
        }'. Allowed types are: ${allowedTypes.join(', ')}`
      )
    }
  }

  validateDisplayFile() {
    validateRequiredField(this.displayFile, 'display-file')
    validateStringField(this.displayFile, 'display-file')
  }

  validateFileFormat() {
    validateRequiredField(this.fileFormat, 'file-format')
    validateStringField(this.fileFormat, 'file-format')

    const allowedFormats = ['md', 'html']
    if (!allowedFormats.includes(this.fileFormat)) {
      throw new Error(
        `Invalid file-format '${
          this.fileFormat
        }'. Allowed types are: ${allowedFormats.join(', ')}`
      )
    }
  }

  validateCardPath() {
    validateRequiredField(this.cardPath, 'card-path')
    validateStringField(this.cardPath, 'card-path')
  }

  validateShowSkillNumber() {
    const parsed = parseInt(this.showSkillNumber)
    if (!isNaN(parsed)) {
      this.showSkillNumber = parsed
    }
    validateIntegerField(this.showSkillNumber, 'show-skill-number')
  }

  validateShowSkillTheme() {
    validateStringField(this.showSkillTheme, 'show-skill-theme')
    validateStringInListField(
      this.showSkillTheme,
      'show-skill-theme',
      validSkillTheme
    )
  }

  validateOutputOnly() {
    validateBooleanField(this.outputOnly, 'output-only')
  }

  validateNoCommit() {
    validateBooleanField(this.noCommit, 'no-commit')
  }

  validateDarkStyle() {
    validateStringField(this.darkStyle, 'dark-style')
    validateStringInListField(this.darkStyle, 'dark-style', validDarkStyle)
  }

  validateShowSkill() {
    validateStringField(this.showSkill, 'show-skill')
    validateStringInListField(this.showSkill, 'show-skill', validHiddenVisible)
  }

  validateShowCertification() {
    validateStringField(this.showCertification, 'show-certification')
    validateStringInListField(
      this.showCertification,
      'show-certification',
      validDisplayChoice
    )
  }

  validateShowCertificationLatest() {
    validateStringField(
      this.showCertificationLatest,
      'show-certification-latest'
    )
    validateStringInListField(
      this.showCertificationLatest,
      'show-certification-latest',
      validHiddenVisible
    )
  }

  validateShowBadge() {
    validateStringField(this.showBadge, 'show-badge')
    validateStringInListField(this.showBadge, 'show-badge', validDisplayChoice)
  }

  validateShowBadgeLatest() {
    validateStringField(this.showBadgeLatest, 'show-badge-latest')
    validateStringInListField(
      this.showBadgeLatest,
      'show-badge-latest',
      validHiddenVisible
    )
  }

  validateShowSuperBadge() {
    validateStringField(this.showSuperBadge, 'show-superbadge')
    validateStringInListField(
      this.showSuperBadge,
      'show-superbadge',
      validDisplayChoice
    )
  }

  validateShowSuperBadgeLatest() {
    validateStringField(this.showSuperBadgeLatest, 'show-superbadge-latest')
    validateStringInListField(
      this.showSuperBadgeLatest,
      'show-superbadge-latest',
      validHiddenVisible
    )
  }

  validateShowEventBadge() {
    validateStringField(this.showEventBadge, 'show-event-badge')
    validateStringInListField(
      this.showEventBadge,
      'show-event-badge',
      validDisplayChoice
    )
  }

  validateShowEventBadgeLatest() {
    validateStringField(this.showEventBadgeLatest, 'show-event-badge-latest')
    validateStringInListField(
      this.showEventBadgeLatest,
      'show-event-badge-latest',
      validHiddenVisible
    )
  }

  validateShowStamp() {
    validateStringField(this.showStamp, 'show-stamp')
    validateStringInListField(this.showStamp, 'show-stamp', validDisplayChoice)
  }

  validateShowStampLatest() {
    validateStringField(this.showStampLatest, 'show-stamp-latest')
    validateStringInListField(
      this.showStampLatest,
      'show-stamp-latest',
      validHiddenVisible
    )
  }
}

module.exports = {
  ActionInputs
}
