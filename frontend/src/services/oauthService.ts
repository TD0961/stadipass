import { AuthUser, ApiResponse } from '@/types'

// OAuth configuration
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || ''
const GITHUB_CLIENT_ID = (import.meta as any).env?.VITE_GITHUB_CLIENT_ID || ''
const REDIRECT_URI = `${window.location.origin}/auth/callback`

// OAuth URLs
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email profile&state=google`
const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email&state=github`

class OAuthService {
  /**
   * Initiate Google OAuth flow
   */
  initiateGoogleAuth(): void {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured')
    }
    
    // Store the current URL to redirect back after auth
    localStorage.setItem('auth_redirect', window.location.pathname)
    window.location.href = GOOGLE_AUTH_URL
  }

  /**
   * Initiate GitHub OAuth flow
   */
  initiateGitHubAuth(): void {
    if (!GITHUB_CLIENT_ID) {
      throw new Error('GitHub OAuth not configured')
    }
    
    // Store the current URL to redirect back after auth
    localStorage.setItem('auth_redirect', window.location.pathname)
    window.location.href = GITHUB_AUTH_URL
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<ApiResponse<AuthUser>> {
    const response = await fetch('/api/auth/oauth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code, state }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'OAuth authentication failed')
    }

    return response.json()
  }

  /**
   * Check if OAuth is configured
   */
  isGoogleConfigured(): boolean {
    return !!GOOGLE_CLIENT_ID
  }

  isGitHubConfigured(): boolean {
    return !!GITHUB_CLIENT_ID
  }
}

export const oauthService = new OAuthService()
