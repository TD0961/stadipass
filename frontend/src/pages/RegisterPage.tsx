/**
 * Register Page
 * 
 * IMPORTANCE:
 * - User registration entry point
 * - Creates new user accounts
 * - Validates user input
 * - Sends email verification
 * - Foundation for user onboarding
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import PhoneInput from '../components/forms/PhoneInput';
import { authService } from '../services/authService';
import { useToastStore } from '../stores/toastStore';
import { validatePassword } from '../utils/validation';
import { formatPhoneNumber } from '../utils/countries';

/**
 * Registration Form Schema
 * 
 * IMPORTANCE:
 * - Validates all registration fields
 * - Ensures password strength
 * - Prevents invalid submissions
 * - Type-safe form data
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').refine(
    (password) => {
      const validation = validatePassword(password);
      return validation.isValid;
    },
    {
      message: 'Password must contain uppercase, lowercase, number, and special character',
    }
  ),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('US'); // Default to US

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
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  /**
   * Update Phone Number in Form
   * 
   * IMPORTANCE:
   * - Syncs phone input with form state
   * - Formats phone with country code
   * - Updates form value for submission
   */
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value) {
      const formattedPhone = formatPhoneNumber(value, countryCode);
      setValue('phone', formattedPhone);
    } else {
      setValue('phone', undefined);
    }
  };

  /**
   * Handle Registration Submission
   * 
   * IMPORTANCE:
   * - Creates new user account
   * - Calls auth service
   * - Handles success/error states
   * - Redirects to email verification
   */
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await authService.signup(data);
      success('Account created! Please check your email to verify your account.');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get Password Strength
   * 
   * IMPORTANCE:
   * - Shows password strength feedback
   * - Helps users create secure passwords
   * - Visual indicator of password quality
   */
  const getPasswordStrength = () => {
    if (!password) return null;
    const validation = validatePassword(password);
    return validation;
  };

  const passwordStrength = getPasswordStrength();

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
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Sign up to get started</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('firstName')}
                      type="text"
                      id="firstName"
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                      aria-invalid={errors.firstName ? 'true' : 'false'}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400" role="alert">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400" role="alert">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

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

              {/* Phone Input (Optional) */}
              <PhoneInput
                value={phoneNumber}
                onChange={handlePhoneChange}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                label="Phone Number"
                error={errors.phone?.message}
              />

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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#00f5a0] hover:text-[#00d9ff] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

