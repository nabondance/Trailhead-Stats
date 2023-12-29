function validateRequiredField(field, fieldName) {
  if (field === undefined || field === null || field === '') {
    throw new Error(`${fieldName} is required.`)
  }
}

function validateStringField(field, fieldName) {
  if (typeof field !== 'string') {
    throw new Error(
      `${fieldName} must be a string, got ${typeof field}: ${field}`
    )
  }
}

function validateBooleanField(field, fieldName) {
  if (field === 'true') {
    field = true
  } else if (field === 'false') {
    field = false
  }

  if (typeof field !== 'boolean') {
    throw new Error(
      `${fieldName} must be a boolean, got ${typeof field}: ${field}`
    )
  }

  return field
}

module.exports = {
  validateRequiredField,
  validateStringField,
  validateBooleanField
}
