import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser, User, LoginForm, RegisterForm } from '@/types'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginForm) => Promise<void>
  register: (userData: RegisterForm) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  setUser: (user: AuthUser) => void
  setToken: (token: string) => void
  clearError: () => void
  error: string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          const user = response.data
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success(`Welcome back, ${user?.firstName || 'User'}!`)
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(userData)
          const user = response.data
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success(`Welcome to StadiPass, ${user?.firstName || 'User'}!`)
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
        toast.success('Logged out successfully')
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken()
          const user = response.data
          
          set({
            user,
            isAuthenticated: true,
            error: null,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.updateProfile(userData)
          const updatedUser = response.data
          
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
            isLoading: false,
            error: null,
          }))
          
          toast.success('Profile updated successfully')
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Update failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      setUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true, error: null })
      },

      setToken: (token: string) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, token }, isAuthenticated: true })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Auth Provider Component
import { ReactNode, useEffect } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { refreshToken, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Try to refresh token on app start
    if (isAuthenticated) {
      refreshToken()
    }
  }, [refreshToken, isAuthenticated])

  return <>{children}</>
}
