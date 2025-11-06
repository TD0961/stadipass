/**
 * Email Verification Page
 * 
 * IMPORTANCE:
 * - Prompts user to verify email
 * - Shows verification status
 * - Allows resending verification email
 * - Required for account activation
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { authService } from '../services/authService';
import { useToastStore } from '../stores/toastStore';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email') || (location.state as { email?: string })?.email || '';

  /**
   * Auto-verify if token is present in URL
   * 
   * IMPORTANCE:
   * - Automatically verifies email when user clicks link
   * - Seamless verification experience
   * - No manual action required
   */
  useEffect(() => {
    if (token && email) {
      handleVerifyEmail(token, email);
    }
  }, [token, email]);

  /**
   * Verify Email
   * 
   * IMPORTANCE:
   * - Verifies user email address
   * - Activates account
   * - Updates verification status
   */
  const handleVerifyEmail = async (verifyToken: string, verifyEmail: string) => {
    setVerifying(true);
    try {
      await authService.verifyEmail(verifyToken, verifyEmail);
      setVerified(true);
      success('Email verified successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      showError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Resend Verification Email
   * 
   * IMPORTANCE:
   * - Resends verification link
   * - Used when email is lost or expired
   * - Allows user to verify later
   */
  const handleResend = async () => {
    if (!email) {
      showError('Email address is required');
      return;
    }

    setLoading(true);
    try {
      await authService.resendVerification(email);
      success('Verification email sent! Check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#0a0f1e] border border-green-500/20 rounded-2xl p-8 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-400 mb-6">Your email has been successfully verified.</p>
              <Link to="/login">
                <Button className="w-full">Continue to Login</Button>
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
          <div className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-2xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400 mb-6">
              {email ? (
                <>
                  We've sent a verification link to <strong className="text-white">{email}</strong>
                </>
              ) : (
                'Please verify your email address to continue'
              )}
            </p>

            {verifying ? (
              <div className="py-4">
                <RefreshCw className="w-6 h-6 text-[#00f5a0] animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Verifying...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>

                {email && (
                  <Button
                    onClick={handleResend}
                    disabled={loading}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                )}

                <Link
                  to="/login"
                  className="text-sm text-[#00f5a0] hover:text-[#00d9ff] transition-colors"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

