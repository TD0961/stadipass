import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/services/authService'
import { oauthService } from '@/services/oauthService'

// Mock API client
vi.mock('@/services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  }
}))

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auth Service', () => {
    it('should handle login flow', async () => {
      const mockResponse = { data: { token: 'test-token' } }
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      vi.mocked(require('@/services/apiClient').apiClient.post).mockImplementation(mockPost)

      const result = await authService.login({ email: 'test@example.com', password: 'password123' })

      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password123' })
      expect(result.data.token).toBe('test-token')
    })

    it('should handle registration flow', async () => {
      const mockResponse = { data: { id: 'user-id', email: 'test@example.com' }, message: 'Account created' }
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      vi.mocked(require('@/services/apiClient').apiClient.post).mockImplementation(mockPost)

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })

      expect(mockPost).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
      expect(result.data.email).toBe('test@example.com')
    })

    it('should handle password reset request', async () => {
      const mockResponse = { data: { message: 'Reset link sent' } }
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      vi.mocked(require('@/services/apiClient').apiClient.post).mockImplementation(mockPost)

      const result = await authService.requestPasswordReset('test@example.com')

      expect(mockPost).toHaveBeenCalledWith('/auth/request-reset', { email: 'test@example.com' })
      expect(result.message).toBe('Reset link sent')
    })

    it('should handle password reset', async () => {
      const mockResponse = { data: { message: 'Password reset successfully' } }
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      vi.mocked(require('@/services/apiClient').apiClient.post).mockImplementation(mockPost)

      const result = await authService.resetPassword('test-token', 'test@example.com', 'newpassword123')

      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'test-token',
        email: 'test@example.com',
        password: 'newpassword123'
      })
      expect(result.message).toBe('Password reset successfully')
    })

    it('should handle email verification', async () => {
      const mockResponse = { data: { message: 'Email verified successfully' } }
      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      vi.mocked(require('@/services/apiClient').apiClient.post).mockImplementation(mockPost)

      const result = await authService.verifyEmail('test-token', 'test@example.com')

      expect(mockPost).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'test-token',
        email: 'test@example.com'
      })
      expect(result.message).toBe('Email verified successfully')
    })
  })

  describe('OAuth Service', () => {
    it('should check Google OAuth configuration', () => {
      expect(oauthService.isGoogleConfigured()).toBeDefined()
    })

    it('should check GitHub OAuth configuration', () => {
      expect(oauthService.isGitHubConfigured()).toBeDefined()
    })

    it('should handle OAuth callback', async () => {
      const mockResponse = { data: { token: 'oauth-token', email: 'oauth@example.com' } }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
      global.fetch = mockFetch

      const result = await oauthService.handleCallback('test-code', 'google')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth/callback'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code: 'test-code', state: 'google' })
        })
      )
      expect(result.data.token).toBe('oauth-token')
    })
  })
})

