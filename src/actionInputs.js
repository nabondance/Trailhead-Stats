const core = require('@actions/core')
const {
  validateRequiredField,
  validateStringField,
  validateBooleanField
} = require('./validators')

class ActionInputs {
  constructor() {
    this.trailheadUsername = core.getInput('trailhead-username', {
      required: true
    })
    this.displayFile = core.getInput('display-file', { required: false })
    this.fileFormat = core.getInput('file-format', { required: false })
    this.displayType = core.getInput('display-type', { required: false })
    this.cardPath = core.getInput('card-path', { required: false })
    this.outputOnly = core.getInput('output-only', { required: false })

    this.validateInputs()
    this.inputsFixup()
  }

  validateInputs() {
    try {
      // Validate inputs
      this.validateTrailheadUsername()
      this.validateDisplayFile()
      this.validateDisplayType()
      this.validateOutputOnly()
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

    const allowedTypes = ['text', 'card', 'output', 'html']
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

  validateOutputOnly() {
    validateBooleanField(this.outputOnly, 'output-only')
  }

  inputsFixup() {
    if (this.displayType === 'card') {
      this.cardPath = undefined
    }
  }
}

module.exports = {
  ActionInputs
}
