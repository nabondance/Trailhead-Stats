const validators = require('./../src/validators')

describe('Validators', () => {
  describe('validateRequiredField', () => {
    it('should not throw an error for valid input', () => {
      expect(() =>
        validators.validateRequiredField('test', 'Test Field')
      ).not.toThrow()
    })

    it('should throw an error for undefined input', () => {
      expect(() =>
        validators.validateRequiredField(undefined, 'Test Field')
      ).toThrow('Test Field is required.')
    })

    it('should throw an error for null input', () => {
      expect(() =>
        validators.validateRequiredField(null, 'Test Field')
      ).toThrow('Test Field is required.')
    })

    it('should throw an error for empty string input', () => {
      expect(() => validators.validateRequiredField('', 'Test Field')).toThrow(
        'Test Field is required.'
      )
    })
  })

  describe('validateStringField', () => {
    it('should not throw an error for valid string input', () => {
      expect(() =>
        validators.validateStringField('test', 'Test Field')
      ).not.toThrow()
    })

    it('should throw an error for non-string input (number)', () => {
      expect(() => validators.validateStringField(123, 'Test Field')).toThrow(
        'Test Field must be a string, got number: 123'
      )
    })

    it('should throw an error for non-string input (boolean)', () => {
      expect(() => validators.validateStringField(true, 'Test Field')).toThrow(
        'Test Field must be a string, got boolean: true'
      )
    })

    it('should throw an error for non-string input (object)', () => {
      expect(() => validators.validateStringField({}, 'Test Field')).toThrow(
        'Test Field must be a string, got object: [object Object]'
      )
    })
  })

  describe('validateIntegerField', () => {
    it('should not throw an error for valid integer input', () => {
      expect(() =>
        validators.validateIntegerField(123, 'Test Field')
      ).not.toThrow()
    })

    it('should throw an error for non-integer input (string)', () => {
      expect(() =>
        validators.validateIntegerField('notAnInteger', 'Test Field')
      ).toThrow('Test Field must be an integer, got string: notAnInteger')
    })

    it('should throw an error for non-integer input (boolean)', () => {
      expect(() => validators.validateIntegerField(true, 'Test Field')).toThrow(
        'Test Field must be an integer, got boolean: true'
      )
    })

    it('should throw an error for non-integer input (object)', () => {
      expect(() => validators.validateIntegerField({}, 'Test Field')).toThrow(
        'Test Field must be an integer, got object: [object Object]'
      )
    })
  })

  describe('validateBooleanField', () => {
    it('should return true for string "true"', () => {
      expect(validators.validateBooleanField('true', 'Test Field')).toBe(true)
    })

    it('should return false for string "false"', () => {
      expect(validators.validateBooleanField('false', 'Test Field')).toBe(false)
    })

    it('should return the boolean value for boolean input (true)', () => {
      expect(validators.validateBooleanField(true, 'Test Field')).toBe(true)
    })

    it('should return the boolean value for boolean input (false)', () => {
      expect(validators.validateBooleanField(false, 'Test Field')).toBe(false)
    })

    it('should throw an error for non-boolean and non-string-boolean input (number)', () => {
      expect(() => validators.validateBooleanField(123, 'Test Field')).toThrow(
        'Test Field must be a boolean, got number: 123'
      )
    })

    it('should throw an error for non-boolean and non-string-boolean input (object)', () => {
      expect(() => validators.validateBooleanField({}, 'Test Field')).toThrow(
        'Test Field must be a boolean, got object: [object Object]'
      )
    })

    it('should throw an error for non-boolean and non-string-boolean input (string non-boolean)', () => {
      expect(() =>
        validators.validateBooleanField('not a boolean', 'Test Field')
      ).toThrow('Test Field must be a boolean, got string: not a boolean')
    })
  })

  describe('validateStringInListField', () => {
    const validValues = ['valid1', 'valid2']
    it('should not throw an error for valid string input', () => {
      expect(() =>
        validators.validateStringInListField(
          'valid1',
          'Test Field',
          validValues
        )
      ).not.toThrow()
    })

    it('should throw an error for invalid string "invalidValue"', () => {
      expect(() =>
        validators.validateStringInListField(
          'invalidValue',
          'Test Field',
          validValues
        )
      ).toThrow('Test Field must be one of [valid1, valid2], got: invalidValue')
    })

    it('should throw an error for invalid string "id1"', () => {
      expect(() =>
        validators.validateStringInListField('id1', 'Test Field', validValues)
      ).toThrow('Test Field must be one of [valid1, valid2], got: id1')
    })

    it('should throw an error for non-string input (number)', () => {
      expect(() =>
        validators.validateStringInListField(123, 'Test Field', validValues)
      ).toThrow('Test Field must be one of [valid1, valid2], got: 123')
    })

    it('should throw an error for non-string input (boolean)', () => {
      expect(() =>
        validators.validateStringInListField(true, 'Test Field', validValues)
      ).toThrow('Test Field must be one of [valid1, valid2], got: true')
    })

    it('should throw an error for non-string input (object)', () => {
      expect(() =>
        validators.validateStringInListField({}, 'Test Field', validValues)
      ).toThrow(
        'Test Field must be one of [valid1, valid2], got: [object Object]'
      )
    })
  })

  describe('validateHexadecimalField', () => {
    it('should not throw an error for valid hexadecimal input', () => {
      expect(() =>
        validators.validateHexadecimalField('#FFFFFF', 'Test Field')
      ).not.toThrow()
    })

    it('should not throw an error for valid shorthand hexadecimal input', () => {
      expect(() =>
        validators.validateHexadecimalField('#FFF', 'Test Field')
      ).not.toThrow()
    })

    it('should not throw an error if the input is empty', () => {
      expect(() =>
        validators.validateHexadecimalField('', 'Test Field')
      ).not.toThrow()
    })

    it('should add # if the input does not start with it', () => {
      expect(() =>
        validators.validateHexadecimalField('FFFFFF', 'Test Field')
      ).not.toThrow()
    })

    it('should throw an error for invalid hexadecimal input (too long)', () => {
      expect(() =>
        validators.validateHexadecimalField('#FFFFFFF', 'Test Field')
      ).toThrow('Test Field must be a valid hexadecimal color, got: #FFFFFFF')
    })

    it('should throw an error for invalid hexadecimal input (too short)', () => {
      expect(() =>
        validators.validateHexadecimalField('#FF', 'Test Field')
      ).toThrow('Test Field must be a valid hexadecimal color, got: #FF')
    })

    it('should throw an error for invalid hexadecimal input (invalid characters)', () => {
      expect(() =>
        validators.validateHexadecimalField('#FFFGGG', 'Test Field')
      ).toThrow('Test Field must be a valid hexadecimal color, got: #FFFGGG')
    })

    it('should throw an error for non-string input (number)', () => {
      expect(() =>
        validators.validateHexadecimalField(7, 'Test Field')
      ).toThrow('Test Field must be a valid hexadecimal color, got: #7')
    })

    it('should throw an error for non-string input (boolean)', () => {
      expect(() =>
        validators.validateHexadecimalField(true, 'Test Field')
      ).toThrow('Test Field must be a valid hexadecimal color, got: #true')
    })

    it('should throw an error for non-string input (object)', () => {
      expect(() =>
        validators.validateHexadecimalField({}, 'Test Field')
      ).toThrow(
        'Test Field must be a valid hexadecimal color, got: #[object Object]'
      )
    })
  })
})
