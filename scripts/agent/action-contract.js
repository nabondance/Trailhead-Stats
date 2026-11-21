// Checks that action.yml, src/actionInputs.js and the README agree.
const fs = require('fs')
const path = require('path')
const { ROOT, readActionInputs } = require('./lib/action-yml')

function readSourceInputs() {
  const source = fs.readFileSync(
    path.join(ROOT, 'src', 'actionInputs.js'),
    'utf8'
  )
  const inputs = new Map()
  const pattern = /getInput\(\s*'([^']+)',\s*\{\s*required:\s*(true|false)/g
  for (const [, name, required] of source.matchAll(pattern)) {
    inputs.set(name, required === 'true')
  }
  const validated = new Set()
  for (const [, name] of source.matchAll(
    /validate\w+Field\(\s*this\.\w+,\s*'([^']+)'/g
  )) {
    validated.add(name)
  }
  return { inputs, validated }
}

function section(text, start, end) {
  const from = text.indexOf(start)
  if (from === -1) return ''
  const to = text.indexOf(end, from + start.length)
  return text.slice(from, to === -1 ? undefined : to)
}

function readReadmeInputs() {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  const tables =
    section(readme, '## Inputs', '## Outputs') +
    section(readme, '### Card Display customization', 'You can see')
  const inputs = new Map()
  for (const line of tables.split('\n')) {
    const cells = line.split('|').map(cell => cell.trim())
    const name = cells[1]?.match(/^`([a-z][a-z-]*)`$/)
    if (!name) continue
    const lastCell = cells[cells.length - 2]
    inputs.set(name[1], lastCell.replace(/`/g, ''))
  }
  return inputs
}

function checkContract() {
  const action = readActionInputs()
  const { inputs: source, validated } = readSourceInputs()
  const readme = readReadmeInputs()
  const problems = []

  for (const [name, spec] of action) {
    if (!source.has(name)) {
      problems.push(`${name}: in action.yml, not read by actionInputs.js`)
    } else if (source.get(name) !== spec.required) {
      problems.push(`${name}: required differs (action.yml vs actionInputs.js)`)
    }
    if (!validated.has(name)) {
      problems.push(`${name}: not validated in actionInputs.js`)
    }
    if (!readme.has(name)) {
      problems.push(`${name}: missing from the README tables`)
    } else if (readme.get(name) !== spec.default) {
      problems.push(
        `${name}: default is '${spec.default}' in action.yml, '${readme.get(name)}' in README`
      )
    }
  }
  for (const name of source.keys()) {
    if (!action.has(name)) {
      problems.push(`${name}: read by actionInputs.js, not in action.yml`)
    }
  }
  for (const name of readme.keys()) {
    if (!action.has(name)) {
      problems.push(`${name}: in the README, not in action.yml`)
    }
  }
  return { problems, count: action.size }
}

if (require.main === module) {
  const { problems, count } = checkContract()
  if (problems.length > 0) {
    console.error(`Contract: FAIL (${problems.length})`)
    for (const problem of problems) console.error(`- ${problem}`)
    process.exit(1)
  }
  console.log(`Contract: OK (${count} inputs)`)
}

module.exports = { checkContract }
