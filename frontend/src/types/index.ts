/**
 * Shared Type Definitions
 * 
 * IMPORTANCE:
 * - Central location for shared types
 * - Prevents type duplication
 * - Makes it easy to find common types
 * - Reusable across components and services
 */

// Re-export all API types for convenience
export * from './api';

/**
 * Generic Form Field Props
 * 
 * IMPORTANCE:
 * - Consistent form field structure
 * - Type-safe form components
 * - Reusable across all forms
 */
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Loading State
 * 
 * IMPORTANCE:
 * - Consistent loading state handling
 * - Type-safe loading indicators
 * - Prevents errors from undefined loading states
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * Async Operation Result
 * 
 * IMPORTANCE:
 * - Standard structure for async operations
 * - Type-safe error handling
 * - Consistent data/error/loading pattern
 */
export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

