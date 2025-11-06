/**
 * useAuth Hook
 * 
 * IMPORTANCE:
 * - Centralized authentication state management
 * - Provides easy access to auth state in any component
 * - Eliminates prop drilling (passing auth through multiple components)
 * - Type-safe auth operations
 * - Consistent auth state across the app
 * 
 * USAGE:
 * const { user, isAuthenticated, logout } = useAuth();
 */

import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for authentication
 * 
 * IMPORTANCE:
 * - Wrapper around auth store for easy component access
 * - Provides convenient auth methods
 * - Can be extended with additional auth logic
 * - Used throughout the app for auth checks
 * 
 * @returns Auth state and methods
 */
export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
    /**
     * Check if user has specific role
     * 
     * IMPORTANCE:
     * - Type-safe role checking
     * - Used for conditional rendering
     * - Admin panel access control
     */
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    isStaff: user?.role === 'staff',
  };
}

