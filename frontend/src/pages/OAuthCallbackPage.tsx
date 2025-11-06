/**
 * OAuth Callback Page
 * 
 * IMPORTANCE:
 * - Handles OAuth redirects from providers
 * - Processes OAuth authentication
 * - Completes OAuth login flow
 * - Redirects to appropriate page after auth
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useToastStore } from '../stores/toastStore';
import { authService } from '../services/authService';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToastStore();

  /**
   * Handle OAuth Callback
   * 
   * IMPORTANCE:
   * - Processes OAuth callback from provider
   * - Extracts token from URL
   * - Completes authentication
   * - Redirects to dashboard
   * 
   * HOW IT WORKS:
   * 1. OAuth provider redirects here with code/token
   * 2. Backend processes OAuth callback
   * 3. Returns access token
   * 4. Store token and redirect
   */
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        showError('OAuth authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Token is already set by backend redirect, just fetch user
          await authService.getCurrentUser();
          success('Login successful!');
          navigate('/');
        } catch (err) {
          showError('Failed to complete authentication. Please try again.');
          navigate('/login');
        }
      } else {
        // No token, redirect to login
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, showError, success]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00f5a0]"></div>
          <p className="mt-4 text-gray-400">Completing authentication...</p>
        </div>
      </div>
    </Layout>
  );
}

