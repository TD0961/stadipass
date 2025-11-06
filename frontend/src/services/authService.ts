/**
 * Authentication Service
 * 
 * IMPORTANCE:
 * - Centralized authentication API calls
 * - Type-safe auth operations
 * - Handles all auth-related API endpoints
 * - Consistent error handling
 * - Makes auth logic reusable across components
 * 
 * USAGE:
 * const { user, token } = await authService.login(email, password);
 */

import apiClient from './apiClient';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/api';

/**
 * Authentication Service
 * 
 * IMPORTANCE:
 * - Single place for all auth API calls
 * - Prevents code duplication
 * - Consistent auth flow
 * - Easy to test and maintain
 */
export const authService = {
  /**
   * User Registration
   * 
   * IMPORTANCE:
   * - Creates new user account
   * - Sends email verification
   * - Returns user data on success
   * 
   * @param data - Registration data
   * @returns User data (without token, email verification required)
   */
  async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ user: Partial<User>; message: string }> {
    const response = await apiClient.post<{ id: string; email: string; message: string }>(
      '/auth/signup',
      data
    );
    return {
      user: { _id: response.data.id, email: response.data.email },
      message: response.data.message,
    };
  },

  /**
   * User Login
   * 
   * IMPORTANCE:
   * - Authenticates user credentials
   * - Returns access token and user data
   * - Automatically updates auth store
   * - Sets up authentication state
   * 
   * HOW IT WORKS:
   * 1. Sends email/password to backend
   * 2. Backend validates credentials
   * 3. Returns access token + user data
   * 4. Updates auth store with token and user
   * 5. Token is automatically added to future requests
   * 
   * @param email - User email
   * @param password - User password
   * @returns Auth response with user and token
   */
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/login', {
      email,
      password,
    });

    // Update auth store with token
    const { token } = response.data;
    useAuthStore.getState().setToken(token);

    // Fetch and update user data
    await this.getCurrentUser();

    return { token };
  },

  /**
   * Refresh Access Token
   * 
   * IMPORTANCE:
   * - Gets new access token when current one expires
   * - Prevents user from being logged out
   * - Seamless token refresh
   * - Used automatically by API client interceptor
   * 
   * HOW IT WORKS:
   * 1. Uses refresh token from cookie
   * 2. Backend validates refresh token
   * 3. Returns new access token
   * 4. Updates token in store
   * 
   * @returns New access token
   */
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    const { accessToken } = response.data;
    useAuthStore.getState().setToken(accessToken);
    return accessToken;
  },

  /**
   * Get Current User
   * 
   * IMPORTANCE:
   * - Retrieves current user data
   * - Updates user info in store
   * - Used on app load to restore session
   * - Validates token is still valid
   * 
   * @returns Current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    useAuthStore.getState().setUser(response.data);
    return response.data;
  },

  /**
   * Logout
   * 
   * IMPORTANCE:
   * - Invalidates session on backend
   * - Clears auth state
   * - Removes tokens
   * - Used when user logs out
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
      useAuthStore.getState().logout();
    }
  },

  /**
   * Request Password Reset
   * 
   * IMPORTANCE:
   * - Sends password reset email
   * - Used in forgot password flow
   * - Generates reset token
   * 
   * @param email - User email
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/request-reset', { email });
  },

  /**
   * Reset Password
   * 
   * IMPORTANCE:
   * - Resets password with token
   * - Used in reset password flow
   * - Validates reset token
   * 
   * @param token - Reset token
   * @param password - New password
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  /**
   * Verify Email
   * 
   * IMPORTANCE:
   * - Verifies user email address
   * - Activates account
   * - Updates emailVerified status
   * 
   * @param token - Verification token
   * @param email - User email
   */
  async verifyEmail(token: string, email: string): Promise<void> {
    await apiClient.get('/auth/verify-email', {
      params: { token, email },
    });
  },

  /**
   * Resend Verification Email
   * 
   * IMPORTANCE:
   * - Resends email verification link
   * - Used when verification email is lost
   * 
   * @param email - User email
   */
  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  },
};

