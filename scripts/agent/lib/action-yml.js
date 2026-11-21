const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..', '..', '..')

function unquote(value) {
  return value.trim().replace(/^(['"])(.*)\1$/, '$2')
}

// Reads the flat `inputs:` block of action.yml without a YAML dependency.
function readActionInputs(file = path.join(ROOT, 'action.yml')) {
  const inputs = new Map()
  let current = null
  let inBlock = false

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (/^inputs:/.test(line)) {
      inBlock = true
      continue
    }
    if (inBlock && /^\S/.test(line) && !line.startsWith('#')) break
    if (!inBlock) continue

    const name = line.match(/^ {2}([a-z][a-z-]*):\s*$/)
    if (name) {
      current = { default: '', required: false }
      inputs.set(name[1], current)
      continue
    }
    const field = line.match(/^ {4}(default|required):\s*(.*)$/)
    if (field && current) {
      current[field[1]] =
        field[1] === 'required'
          ? unquote(field[2]) === 'true'
          : unquote(field[2])
    }
  }
  return inputs
}

module.exports = { ROOT, readActionInputs }
