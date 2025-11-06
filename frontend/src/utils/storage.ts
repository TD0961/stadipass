/**
 * Local Storage Utilities
 * 
 * IMPORTANCE:
 * - Type-safe local storage operations
 * - Prevents JSON parsing errors
 * - Handles storage errors gracefully
 * - Consistent storage key management
 * - Used for caching, preferences, tokens
 */

/**
 * Storage Keys
 * 
 * IMPORTANCE:
 * - Centralized key management
 * - Prevents key typos
 * - Easy to find all storage keys
 * - Type-safe key references
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  CART: 'cart',
} as const;

/**
 * Get item from local storage
 * 
 * IMPORTANCE:
 * - Type-safe storage retrieval
 * - Handles JSON parsing
 * - Prevents runtime errors from invalid JSON
 * - Returns null if item doesn't exist
 * 
 * @param key - Storage key
 * @returns Parsed value or null
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in local storage
 * 
 * IMPORTANCE:
 * - Type-safe storage setting
 * - Handles JSON stringification
 * - Prevents storage errors
 * - Used throughout the app for persistence
 * 
 * @param key - Storage key
 * @param value - Value to store
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from local storage
 * 
 * IMPORTANCE:
 * - Safe removal of storage items
 * - Used for logout, clearing data
 * - Prevents errors from missing keys
 * 
 * @param key - Storage key to remove
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all local storage
 * 
 * IMPORTANCE:
 * - Complete cleanup
 * - Used for logout
 * - Removes all stored data
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get string item from local storage (non-JSON)
 * 
 * IMPORTANCE:
 * - For simple string values (tokens)
 * - Avoids unnecessary JSON parsing
 * - Faster for simple values
 * 
 * @param key - Storage key
 * @returns String value or null
 */
export function getStorageString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading string from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set string item in local storage (non-JSON)
 * 
 * IMPORTANCE:
 * - For simple string values (tokens)
 * - Avoids unnecessary JSON stringification
 * - Faster for simple values
 * 
 * @param key - Storage key
 * @param value - String value to store
 */
export function setStorageString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing string to localStorage key "${key}":`, error);
  }
}

