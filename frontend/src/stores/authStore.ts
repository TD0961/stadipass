/**
 * Auth Store
 * 
 * IMPORTANCE:
 * - Centralized authentication state management
 * - Persists auth state across page refreshes
 * - Single source of truth for user authentication
 * - Used by all components that need auth state
 * - Handles token management automatically
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types/api';
import { STORAGE_KEYS, setStorageString, removeStorageItem } from '../utils/storage';

/**
 * Auth State Interface
 * 
 * IMPORTANCE:
 * - Defines the shape of auth state
 * - Type-safe state management
 * - Clear contract for auth operations
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  /**
   * Check if user has specific role
   * 
   * IMPORTANCE:
   * - Type-safe role checking
   * - Used for conditional rendering
   * - Admin panel access control
   */
  hasRole: (role: User['role']) => boolean;
}

/**
 * Auth Store
 * 
 * IMPORTANCE:
 * - Global state for authentication
 * - Persists to localStorage automatically
 * - Updates all components when auth changes
 * - Single source of truth for user data
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * Set user data
       * 
       * IMPORTANCE:
       * - Updates user state
       * - Automatically sets isAuthenticated
       * - Used after login/signup
       */
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      /**
       * Set authentication token
       * 
       * IMPORTANCE:
       * - Stores token in state and localStorage
       * - Used by API client for authenticated requests
       * - Automatically added to all API requests
       */
      setToken: (token) => {
        set({ token });
        if (token) {
          setStorageString(STORAGE_KEYS.AUTH_TOKEN, token);
        } else {
          removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      },

      /**
       * Logout user
       * 
       * IMPORTANCE:
       * - Clears all auth data
       * - Removes tokens from storage
       * - Used when user logs out or token expires
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
        removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
      },

      /**
       * Check if user has specific role
       * 
       * IMPORTANCE:
       * - Type-safe role checking
       * - Used for conditional rendering
       * - Admin/staff access control
       */
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user and token (not computed values)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

