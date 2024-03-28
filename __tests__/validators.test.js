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
})
