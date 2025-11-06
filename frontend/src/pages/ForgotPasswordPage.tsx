/**
 * Forgot Password Page
 * 
 * IMPORTANCE:
 * - Initiates password reset flow
 * - Sends reset email to user
 * - First step in password recovery
 * - User-friendly password recovery
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { authService } from '../services/authService';
import { useToastStore } from '../stores/toastStore';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      setSubmitted(true);
      success('Password reset email sent! Check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-2xl p-8 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <strong className="text-white">{getValues('email')}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-block text-[#00f5a0] hover:text-[#00d9ff] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-gray-400">Enter your email to receive a password reset link</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
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

