/**
 * Validation Utilities
 * 
 * IMPORTANCE:
 * - Reusable validation functions
 * - Consistent validation across forms
 * - Prevents code duplication
 * - Type-safe validation
 * - Used with react-hook-form and zod
 */

/**
 * Validate email address
 * 
 * IMPORTANCE:
 * - Used in login, registration, contact forms
 * - Prevents invalid email submissions
 * - Standard email format validation
 * - Reduces backend validation errors
 * 
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * 
 * IMPORTANCE:
 * - Ensures secure passwords
 * - Provides password strength feedback
 * - Prevents weak passwords
 * - Used in registration and password reset
 * 
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with validation result and strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Determine strength
  if (errors.length === 0) {
    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * Validate phone number
 * 
 * IMPORTANCE:
 * - Ensures phone numbers are in correct format
 * - Used in registration and profile forms
 * - Supports international formats
 * 
 * @param phone - Phone number to validate
 * @returns True if phone is valid
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Check if it's 10 digits (US format) or international format
  const phoneRegex = /^(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(cleaned) || /^\+\d{10,15}$/.test(cleaned);
}

/**
 * Validate URL
 * 
 * IMPORTANCE:
 * - Validates URLs in forms
 * - Used for social media links, website URLs
 * - Prevents invalid URL submissions
 * 
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input string
 * 
 * IMPORTANCE:
 * - Removes dangerous characters
 * - Prevents XSS attacks
 * - Cleans user input before display
 * - Used in forms and user-generated content
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

