/**
 * Error Handling Utilities
 * 
 * IMPORTANCE:
 * - Consistent error message formatting
 * - User-friendly error messages
 * - Prevents technical errors from showing to users
 * - Centralized error handling logic
 * - Makes debugging easier
 */

import type { ApiError } from '../types/api';

/**
 * Get user-friendly error message
 * 
 * IMPORTANCE:
 * - Converts technical errors to user-friendly messages
 * - Prevents showing stack traces to users
 * - Provides helpful error messages
 * - Used throughout the app for error display
 * 
 * @param error - Error object (ApiError, Error, or unknown)
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle API errors
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as ApiError;
    return apiError.error || apiError.message || 'An error occurred';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Map common error messages to user-friendly ones
    const message = error.message;
    
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    if (message.includes('401') || message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (message.includes('403') || message.includes('Forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (message.includes('404') || message.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return 'A server error occurred. Please try again later.';
    }
    
    return message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get error status code
 * 
 * IMPORTANCE:
 * - Determines error type for handling
 * - Used for conditional error handling
 * - Helps with error-specific UI (e.g., 404 page)
 * 
 * @param error - Error object
 * @returns HTTP status code or null
 */
export function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as ApiError).statusCode || null;
  }
  return null;
}

/**
 * Check if error is a network error
 * 
 * IMPORTANCE:
 * - Determines if error is network-related
 * - Used for showing "No internet" messages
 * - Helps with offline handling
 * 
 * @param error - Error object
 * @returns True if network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Network Error') || error.message.includes('Failed to fetch');
  }
  return false;
}

/**
 * Check if error is an authentication error
 * 
 * IMPORTANCE:
 * - Determines if user needs to re-authenticate
 * - Used for automatic logout
 * - Handles expired tokens
 * 
 * @param error - Error object
 * @returns True if authentication error
 */
export function isAuthError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
}

