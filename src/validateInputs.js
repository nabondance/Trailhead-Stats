const core = require('@actions/core')
const {
  validateRequiredField,
  validateStringField,
  validateBooleanField
} = require('./validators')

function validateAllInputs(
  trailheadUsername,
  displayType,
  displayFile,
  outputOnly
) {
  try {
    // Validate inputs
    validateTrailheadUsername(trailheadUsername)
    validateDisplayType(displayType)
    validateDisplayFile(displayFile)
    validateOutputOnly(outputOnly)
  } catch (error) {
    console.error(`Error during inputs validation: ${error.message}`)
    core.setFailed(`Error during inputs validation: ${error.message}`)
  }
}

function validateTrailheadUsername(trailheadUsername) {
  validateRequiredField(trailheadUsername, 'trailhead-username')
  validateStringField(trailheadUsername, 'trailhead-username')
}

function validateDisplayType(displayType) {
  validateRequiredField(displayType, 'display-type')
  validateStringField(displayType, 'display-type')

  const allowedTypes = ['text', 'card', 'output', 'html']
  if (!allowedTypes.includes(displayType)) {
    throw new Error(
      `Invalid display-type '${displayType}'. Allowed types are: ${allowedTypes.join(
        ', '
      )}`
    )
  }
}

function validateDisplayFile(displayFile) {
  validateRequiredField(displayFile, 'display-file')
  validateStringField(displayFile, 'display-file')
}

function validateOutputOnly(outputOnly) {
  validateBooleanField(outputOnly, 'output-only')
}

module.exports = {
  validateAllInputs,
  validateTrailheadUsername,
  validateDisplayType,
  validateDisplayFile,
  validateOutputOnly
}
