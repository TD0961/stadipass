// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation regex - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

// Phone validation regex
export const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/

// Validation error messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  pattern: 'Invalid format',
  match: 'Values do not match',
}

// Validation functions
export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return VALIDATION_MESSAGES.required
    }
    return null
  },

  email: (value: string) => {
    if (!value) return null
    if (!EMAIL_REGEX.test(value)) {
      return VALIDATION_MESSAGES.email
    }
    return null
  },

  password: (value: string) => {
    if (!value) return null
    if (!PASSWORD_REGEX.test(value)) {
      return VALIDATION_MESSAGES.password
    }
    return null
  },

  phone: (value: string) => {
    if (!value) return null
    if (!PHONE_REGEX.test(value.replace(/\s/g, ''))) {
      return VALIDATION_MESSAGES.phone
    }
    return null
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null
    if (value.length < min) {
      return VALIDATION_MESSAGES.minLength(min)
    }
    return null
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null
    if (value.length > max) {
      return VALIDATION_MESSAGES.maxLength(max)
    }
    return null
  },

  min: (min: number) => (value: number) => {
    if (value === null || value === undefined) return null
    if (value < min) {
      return VALIDATION_MESSAGES.min(min)
    }
    return null
  },

  max: (max: number) => (value: number) => {
    if (value === null || value === undefined) return null
    if (value > max) {
      return VALIDATION_MESSAGES.max(max)
    }
    return null
  },

  pattern: (regex: RegExp, message?: string) => (value: string) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message || VALIDATION_MESSAGES.pattern
    }
    return null
  },

  match: (matchValue: any, message?: string) => (value: any) => {
    if (value !== matchValue) {
      return message || VALIDATION_MESSAGES.match
    }
    return null
  },
}

// Form validation helper
export const validateField = (value: any, rules: Array<(value: any) => string | null>) => {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// Form validation helper for multiple fields
export const validateForm = (data: Record<string, any>, schema: Record<string, Array<(value: any) => string | null>>) => {
  const errors: Record<string, string> = {}
  
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules)
    if (error) {
      errors[field] = error
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Common validation schemas
export const validationSchemas = {
  login: {
    email: [validators.required, validators.email],
    password: [validators.required],
  },
  
  register: {
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [validators.required],
    firstName: [validators.required, validators.minLength(2)],
    lastName: [validators.required, validators.minLength(2)],
    phone: [validators.phone],
  },
  
  profile: {
    firstName: [validators.required, validators.minLength(2)],
    lastName: [validators.required, validators.minLength(2)],
    phone: [validators.phone],
  },
  
  changePassword: {
    currentPassword: [validators.required],
    newPassword: [validators.required, validators.password],
    confirmPassword: [validators.required],
  },
}
