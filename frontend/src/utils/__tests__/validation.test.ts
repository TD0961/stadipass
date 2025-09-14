import { validators, validateField, validateForm, validationSchemas } from '../validation'

describe('validators', () => {
  describe('required', () => {
    it('returns error for empty values', () => {
      expect(validators.required('')).toBe('This field is required')
      expect(validators.required(null)).toBe('This field is required')
      expect(validators.required(undefined)).toBe('This field is required')
    })

    it('returns null for valid values', () => {
      expect(validators.required('test')).toBeNull()
      expect(validators.required(0)).toBeNull()
      expect(validators.required(false)).toBeNull()
    })
  })

  describe('email', () => {
    it('returns error for invalid emails', () => {
      expect(validators.email('invalid')).toBe('Please enter a valid email address')
      expect(validators.email('test@')).toBe('Please enter a valid email address')
      expect(validators.email('@test.com')).toBe('Please enter a valid email address')
    })

    it('returns null for valid emails', () => {
      expect(validators.email('test@example.com')).toBeNull()
      expect(validators.email('user.name@domain.co.uk')).toBeNull()
    })

    it('returns null for empty values', () => {
      expect(validators.email('')).toBeNull()
    })
  })

  describe('password', () => {
    it('returns error for weak passwords', () => {
      expect(validators.password('weak')).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
      expect(validators.password('weakpassword')).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
      expect(validators.password('WEAKPASSWORD')).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
    })

    it('returns null for strong passwords', () => {
      expect(validators.password('StrongPass123')).toBeNull()
      expect(validators.password('MyP@ssw0rd')).toBeNull()
    })

    it('returns null for empty values', () => {
      expect(validators.password('')).toBeNull()
    })
  })
})

describe('validateField', () => {
  it('returns first error found', () => {
    const rules = [validators.required, validators.email]
    expect(validateField('', rules)).toBe('This field is required')
    expect(validateField('invalid', rules)).toBe('Please enter a valid email address')
  })

  it('returns null when all rules pass', () => {
    const rules = [validators.required, validators.email]
    expect(validateField('test@example.com', rules)).toBeNull()
  })
})

describe('validateForm', () => {
  it('validates all fields and returns errors', () => {
    const data = { email: 'invalid', password: 'weak' }
    const schema = {
      email: [validators.required, validators.email],
      password: [validators.required, validators.password],
    }

    const result = validateForm(data, schema)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Please enter a valid email address')
    expect(result.errors.password).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
  })

  it('returns valid when all fields pass', () => {
    const data = { email: 'test@example.com', password: 'StrongPass123' }
    const schema = {
      email: [validators.required, validators.email],
      password: [validators.required, validators.password],
    }

    const result = validateForm(data, schema)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })
})

describe('validationSchemas', () => {
  it('has login schema with required fields', () => {
    expect(validationSchemas.login).toHaveProperty('email')
    expect(validationSchemas.login).toHaveProperty('password')
  })

  it('has register schema with all required fields', () => {
    expect(validationSchemas.register).toHaveProperty('email')
    expect(validationSchemas.register).toHaveProperty('password')
    expect(validationSchemas.register).toHaveProperty('firstName')
    expect(validationSchemas.register).toHaveProperty('lastName')
  })
})
