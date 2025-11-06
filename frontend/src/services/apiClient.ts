/**
 * API Client
 * 
 * IMPORTANCE:
 * - Single point of communication with backend
 * - Centralized error handling
 * - Automatic token management
 * - Consistent request/response handling
 * - Prevents code duplication across components
 * - Makes testing easier (mock one client)
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../stores/authStore';
import type { ApiError } from '../types/api';

/**
 * Create Axios instance with base configuration
 * 
 * IMPORTANCE:
 * - Pre-configured with base URL
 * - Sets default headers (Content-Type, Accept)
 * - Single instance used throughout the app
 * - Consistent timeout settings
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth (refresh tokens)
});

/**
 * Request Interceptor
 * 
 * IMPORTANCE:
 * - Automatically adds auth token to every request
 * - No need to manually add tokens in each API call
 * - Handles token retrieval from store
 * - Ensures authenticated requests work seamlessly
 * 
 * HOW IT WORKS:
 * - Runs before every API request
 * - Gets token from auth store
 * - Adds Authorization header if token exists
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from auth store
    const token = useAuthStore.getState().token;
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development (helps with debugging)
    if (env.isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error (network issues, etc.)
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * IMPORTANCE:
 * - Handles successful responses
 * - Extracts data from response wrapper
 * - Logs responses in development
 * - Provides consistent response structure
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (env.isDevelopment) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Return data directly (most APIs return data in response.data)
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle response errors
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Call refresh endpoint
          const response = await axios.post(
            `${env.apiBaseUrl}/auth/refresh`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true,
            }
          );

          const { accessToken } = response.data;
          
          // Update token in store
          useAuthStore.getState().setToken(accessToken);
          
          // Update Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Retry original request with new token
          return apiClient(originalRequest);
        } else {
          // No refresh token, logout user
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      error: error.response?.data?.error || error.message || 'An error occurred',
      message: error.response?.data?.message,
      details: error.response?.data?.details,
      statusCode: error.response?.status,
    };

    // Log error in development
    if (env.isDevelopment) {
      console.error('❌ API Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

/**
 * Export the configured API client
 * 
 * IMPORTANCE:
 * - Used by all API service functions
 * - Ensures consistent configuration
 * - Single point of API communication
 */
export default apiClient;

/**
 * Helper function to handle API errors
 * 
 * IMPORTANCE:
 * - Consistent error message extraction
 * - User-friendly error messages
 * - Prevents showing technical errors to users
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.error || apiError?.message || error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

