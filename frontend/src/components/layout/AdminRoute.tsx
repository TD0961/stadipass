/**
 * Admin Route Component
 * 
 * IMPORTANCE:
 * - Guards routes that require admin role
 * - Protects admin-only pages (dashboard, management)
 * - Redirects non-admin users (even if authenticated)
 * - Prevents unauthorized access to admin features
 * - Used for all admin pages
 * 
 * HOW IT WORKS:
 * 1. Checks if user is authenticated
 * 2. Checks if user has admin role
 * 3. If not authenticated → redirect to login
 * 4. If not admin → redirect to home (or show 403)
 * 5. If admin → render children
 * 
 * USAGE:
 * <AdminRoute>
 *   <AdminDashboardPage />
 * </AdminRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If not admin, redirect to home (or show error)
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />;
  }

  // User is admin, render protected content
  return <>{children}</>;
}

