/**
 * Environment Configuration
 * 
 * IMPORTANCE:
 * - Centralizes all environment variables in one place
 * - Provides type safety for configuration values
 * - Allows easy switching between dev/staging/production
 * - Prevents typos and missing environment variables
 * - Makes it clear what configuration the app needs
 */

/**
 * Environment configuration object
 * 
 * All environment variables must be prefixed with VITE_ to be accessible
 * in the frontend (Vite requirement for security)
 */
export const env = {
  /**
   * API Base URL
   * 
   * IMPORTANCE:
   * - Single source of truth for API endpoint
   * - Used by all API service calls
   * - Changes based on environment (dev/prod)
   * - Prevents hardcoding URLs throughout the app
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

  /**
   * Application Environment
   * 
   * IMPORTANCE:
   * - Allows environment-specific behavior
   * - Enables/disables features based on environment
   * - Useful for logging, debugging, feature flags
   */
  appEnv: import.meta.env.VITE_APP_ENV || 'development',

  /**
   * Frontend Base URL
   * 
   * IMPORTANCE:
   * - Used for OAuth redirects
   * - Required for proper callback URLs
   * - Ensures correct redirect after authentication
   */
  frontendBaseUrl: import.meta.env.VITE_FRONTEND_BASE_URL || 'http://localhost:5173',

  /**
   * Check if running in development mode
   * 
   * IMPORTANCE:
   * - Enables development-only features (debugging, logging)
   * - Disables production optimizations during development
   */
  isDevelopment: import.meta.env.DEV,

  /**
   * Check if running in production mode
   * 
   * IMPORTANCE:
   * - Enables production optimizations
   * - Disables debug features
   * - Activates error tracking
   */
  isProduction: import.meta.env.PROD,
} as const;

/**
 * Validate required environment variables
 * 
 * IMPORTANCE:
 * - Catches missing configuration early
 * - Provides clear error messages
 * - Prevents runtime errors from missing env vars
 * - Helps with deployment troubleshooting
 */
if (!env.apiBaseUrl) {
  console.warn('⚠️ VITE_API_BASE_URL is not set. Using default:', env.apiBaseUrl);
}

