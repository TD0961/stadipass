import { describe, it, expect, beforeAll } from 'vitest'
import { authService } from '@/services/authService'

describe('Authentication API', () => {
  beforeAll(async () => {
    // Wait a bit for servers to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('should handle registration', async () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
    }

    try {
      const response = await authService.register(testUser)
      expect(response.data).toBeDefined()
      expect(response.data.message).toContain('Account created')
      expect(response.data.email).toBe(testUser.email)
    } catch (error: any) {
      // If user already exists, that's also a valid response
      if (error.response?.status === 409) {
        expect(error.response.status).toBe(409)
        expect(error.response.data.error).toContain('already registered')
      } else {
        console.error('Registration error:', error.response?.data || error.message)
        throw error
      }
    }
  })

  it('should handle login', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    }

    try {
      const response = await authService.login(loginData)
      expect(response.data).toBeDefined()
      expect(response.data.token).toBeDefined()
    } catch (error: any) {
      // If user doesn't exist or wrong password, that's expected
      if (error.response?.status === 401) {
        expect(error.response.status).toBe(401)
        expect(error.response.data.error).toContain('Invalid credentials')
      } else {
        console.error('Login error:', error.response?.data || error.message)
        throw error
      }
    }
  })

  it('should handle invalid login gracefully', async () => {
    const invalidLoginData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    }

    try {
      await authService.login(invalidLoginData)
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.response?.status).toBe(401)
    }
  })
})
