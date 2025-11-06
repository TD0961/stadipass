/**
 * useLocalStorage Hook
 * 
 * IMPORTANCE:
 * - Syncs React state with localStorage
 * - Persists data across page refreshes
 * - Type-safe localStorage operations
 * - Handles JSON serialization automatically
 * - Used for preferences, cached data, form drafts
 * 
 * USAGE:
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * // theme persists across page refreshes
 */

import { useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * useLocalStorage Hook
 * 
 * IMPORTANCE:
 * - Combines React state with localStorage
 * - Data persists when user refreshes page
 * - Type-safe storage operations
 * - Automatic JSON handling
 * - Used for user preferences, cart, filters
 * 
 * HOW IT WORKS:
 * - Initializes state from localStorage
 * - Updates localStorage when state changes
 * - Returns state and setter (like useState)
 * 
 * @param key - Storage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple (like useState)
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getStorageItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      setStorageItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

