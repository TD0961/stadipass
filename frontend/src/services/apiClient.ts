import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
})

// Create a separate client for non-API endpoints (like health)
const healthClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for tracking
    if (config.headers) {
      config.headers['X-Request-ID'] = crypto.randomUUID()
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract token from response if present
    if (response.data?.token) {
      localStorage.setItem('auth-token', response.data.token)
    }
    
    return response
  },
  (error) => {
    const { response } = error
    
    // Handle different error scenarios
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
        case 404:
        case 422:
        case 429:
        case 500:
        default:
          // Let individual components handle error display
          break
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

export { apiClient, healthClient }
