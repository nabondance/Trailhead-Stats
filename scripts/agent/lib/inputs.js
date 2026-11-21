const core = require('@actions/core')
const { readActionInputs } = require('./action-yml')

// src/ logs whole payloads through core.debug, too noisy for local scripts.
core.debug = () => {}

// Builds real ActionInputs from the action.yml defaults plus overrides.
function loadInputs(overrides = {}) {
  for (const [name, spec] of readActionInputs()) {
    const value = overrides[name] ?? spec.default
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value
  }
  const { ActionInputs } = require('../../../src/actionInputs')
  return new ActionInputs()
}

module.exports = { loadInputs }
