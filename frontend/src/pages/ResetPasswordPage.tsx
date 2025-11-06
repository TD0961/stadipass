/**
 * Reset Password Page
 * 
 * IMPORTANCE:
 * - Completes password reset flow
 * - Validates reset token
 * - Allows user to set new password
 * - Final step in password recovery
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { authService } from '../services/authService';
import { useToastStore } from '../stores/toastStore';
import { validatePassword } from '../utils/validation';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').refine(
      (password) => {
        const validation = validatePassword(password);
        return validation.isValid;
      },
      {
        message: 'Password must contain uppercase, lowercase, number, and special character',
      }
    ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setSubmitted(true);
      success('Password reset successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="bg-[#0a0f1e] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
            <p className="text-gray-400 mb-6">This password reset link is invalid or has expired.</p>
            <Link
              to="/forgot-password"
              className="inline-block text-[#00f5a0] hover:text-[#00d9ff] transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#0a0f1e] border border-green-500/20 rounded-2xl p-8 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
              <p className="text-gray-400 mb-6">Your password has been reset. Redirecting to login...</p>
              <Link
                to="/login"
                className="inline-block text-[#00f5a0] hover:text-[#00d9ff] transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const passwordStrength = password ? validatePassword(password) : null;

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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] rounded-full mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400">Enter your new password</p>
              {email && (
                <p className="text-sm text-gray-500 mt-2">for {email}</p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
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
                {password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.strength === 'weak'
                              ? 'bg-red-500 w-1/3'
                              : passwordStrength.strength === 'medium'
                              ? 'bg-yellow-500 w-2/3'
                              : 'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {passwordStrength.strength}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#00f5a0] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

