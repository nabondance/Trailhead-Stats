const core = require('@actions/core')

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
  if (!trailheadUsername) {
    throw new Error('trailhead-username is required.')
  }

  if (typeof trailheadUsername !== 'string') {
    throw new Error('trailhead-username must be a string.')
  }
}

function validateDisplayType(displayType) {
  const allowedTypes = ['text', 'card', 'output', 'html']

  if (!displayType) {
    throw new Error('display-type is required.')
  }

  if (typeof displayType !== 'string') {
    throw new Error('display-type must be a string.')
  }

  if (!allowedTypes.includes(displayType)) {
    throw new Error(
      `Invalid display-type. Allowed types are: ${allowedTypes.join(', ')}.`
    )
  }
}

function validateDisplayFile(displayFile) {
  if (!displayFile) {
    throw new Error('display-file is required.')
  }

  if (typeof displayFile !== 'string') {
    throw new Error('display-file must be a string.')
  }
}

function validateOutputOnly(outputOnly) {
  if (outputOnly !== undefined && typeof outputOnly !== 'boolean') {
    throw new Error('output-only must be a boolean.')
  }
}

module.exports = {
  validateAllInputs,
  validateTrailheadUsername,
  validateDisplayType,
  validateDisplayFile,
  validateOutputOnly
}
