/**
 * Error Boundary Component
 * 
 * IMPORTANCE:
 * - Catches React errors in component tree
 * - Prevents entire app from crashing
 * - Shows user-friendly error message
 * - Provides error recovery options
 * - Essential for production apps
 * 
 * HOW IT WORKS:
 * 1. Catches errors during rendering, lifecycle, constructors
 * 2. Logs error for debugging
 * 3. Displays fallback UI instead of crashing
 * 4. Allows user to retry or navigate away
 */

import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Catch Errors
   * 
   * IMPORTANCE:
   * - Called when error occurs in child components
   * - Updates state to show error UI
   * - Prevents error propagation
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log Error
   * 
   * IMPORTANCE:
   * - Logs error for debugging
   * - Can send to error tracking service
   * - Helps identify production issues
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  /**
   * Reset Error State
   * 
   * IMPORTANCE:
   * - Allows user to retry
   * - Resets error boundary state
   * - Enables error recovery
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#030712]">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-2">
              We're sorry, but something unexpected happened.
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-500 mb-6">
                {import.meta.env.DEV && this.state.error.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Link to="/">
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-red-900/20 border border-red-500/30 rounded p-4 overflow-auto text-red-300">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

