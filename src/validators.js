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

function validateIntegerField(field, fieldName) {
  if (!Number.isInteger(field)) {
    throw new Error(
      `${fieldName} must be an integer, got ${typeof field}: ${field}`
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

function validateStringInListField(field, fieldName, validValues) {
  if (!validValues.includes(field)) {
    throw new Error(
      `${fieldName} must be one of [${validValues.join(', ')}], got: ${field}`
    )
  }
}

function validateHexadecimalField(field, fieldName) {
  // Ensure field is a string
  field = String(field)

  // Return if the field is empty
  if (field.trim() === '') {
    return
  }

  // Add # if doesn't start with it
  if (!field.startsWith('#')) {
    field = `#${field}`
  }
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(field)) {
    throw new Error(
      `${fieldName} must be a valid hexadecimal color, got: ${field}`
    )
  }
}

module.exports = {
  validateRequiredField,
  validateStringField,
  validateIntegerField,
  validateBooleanField,
  validateStringInListField,
  validateHexadecimalField
}
