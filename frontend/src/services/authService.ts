import { apiClient } from './apiClient'
import { AuthUser, User, LoginForm, RegisterForm, ApiResponse } from '@/types'

class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.post('/auth/login', credentials)
    return { data: response.data as AuthUser }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.post('/auth/signup', userData)
    return { data: response.data as AuthUser, message: response.data.message }
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async refreshToken(): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/me')
    return response.data
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.patch('/auth/profile', userData)
    return response.data
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.patch('/auth/change-password', passwordData)
    return response.data
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/request-reset', { email })
    return { data: response.data, message: response.data.message }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
    })
    return { data: response.data, message: response.data.message }
  }

  async verifyEmail(token: string, email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/verify-email', { token, email })
    return { data: response.data, message: response.data.message }
  }

  async verifyEmailByLink(token: string, email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
    return { data: response.data, message: response.data.message }
  }

  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/resend-verification')
    return response.data
  }
}

export const authService = new AuthService()
