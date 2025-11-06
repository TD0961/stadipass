/**
 * Protected Route Component
 * 
 * IMPORTANCE:
 * - Guards routes that require authentication
 * - Redirects unauthenticated users to login
 * - Preserves intended destination (redirect after login)
 * - Used throughout the app for protected pages
 * - Provides consistent auth protection
 * 
 * HOW IT WORKS:
 * 1. Checks if user is authenticated
 * 2. If not authenticated → redirect to login
 * 3. If authenticated → render children
 * 4. Stores intended destination in URL state
 * 
 * USAGE:
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to register with return path
  // IMPORTANCE: Users must register/login before accessing protected content
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/register"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}

