/**
 * Login Page
 * 
 * IMPORTANCE:
 * - User authentication entry point
 * - Handles login credentials
 * - OAuth integration (Google)
 * - Redirects to intended destination after login
 * - Core security feature
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import Layout from '../components/layout/Layout';
// FormInput available for future use
// import { FormInput } from '../components/forms/FormInput';
import { Button } from '../components/ui/button';
import { authService } from '../services/authService';
import { useToastStore } from '../stores/toastStore';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/env';

/**
 * Login Form Schema
 * 
 * IMPORTANCE:
 * - Validates form input before submission
 * - Type-safe form data
 * - Prevents invalid submissions
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { show: showToast, error: showError } = useToastStore();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  const from = (location.state as { from?: string })?.from || '/';
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  /**
   * Form Setup
   * 
   * IMPORTANCE:
   * - Manages form state and validation
   * - Integrates with Zod for validation
   * - Provides form methods and state
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handle Login Submission
   * 
   * IMPORTANCE:
   * - Processes login credentials
   * - Calls auth service
   * - Handles success/error states
   * - Redirects to intended destination
   */
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await authService.login(data.email, data.password);
      showToast('Login successful!', 'success');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OAuth Login
   * 
   * IMPORTANCE:
   * - Initiates OAuth flow
   * - Redirects to OAuth provider
   * - Used for Google login
   */
  const handleOAuthLogin = (provider: 'google') => {
    const oauthUrl = `${env.apiBaseUrl}/auth/${provider}`;
    window.location.href = oauthUrl;
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] rounded-full mb-4"
              >
                <LogIn className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#00f5a0] hover:text-[#00d9ff] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0a0f1e] text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* OAuth Button */}
            <div>
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white hover:bg-[#00f5a0]/10 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#00f5a0] hover:text-[#00d9ff] font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

