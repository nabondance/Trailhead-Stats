const { parseSourceInputs } = require('../scripts/agent/action-contract')

describe('action-contract source parsing', () => {
  it.each([
    [`core.getInput('name', { required: true })`, true],
    [`core.getInput('name', { required: false })`, false],
    [`core.getInput(\n  'name',\n  {\n    required: true\n  }\n)`, true],
    [`core.getInput('name', { trimWhitespace: false, required: true })`, true],
    [`core.getInput('name')`, false],
    [`core.getInput('name', { trimWhitespace: false })`, false],
    [`core.getBooleanInput('name')`, false],
    [`core.getBooleanInput('name', { required: true })`, true],
    [`core.getMultilineInput('name')`, false]
  ])('reads %s', (source, required) => {
    const { inputs } = parseSourceInputs(source)
    expect(inputs.get('name')).toBe(required)
  })

  it('treats boolean readers as validated', () => {
    const { validated } = parseSourceInputs(`core.getBooleanInput('flag')`)
    expect(validated.has('flag')).toBe(true)
  })

  it('requires a validator for other readers', () => {
    const plain = parseSourceInputs(`core.getInput('flag')`)
    expect(plain.validated.has('flag')).toBe(false)

    const checked = parseSourceInputs(
      `core.getInput('flag')\nvalidateStringField(this.flag, 'flag')`
    )
    expect(checked.validated.has('flag')).toBe(true)
  })
})
