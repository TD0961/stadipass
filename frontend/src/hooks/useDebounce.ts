/**
 * useDebounce Hook
 * 
 * IMPORTANCE:
 * - Delays value updates until user stops typing
 * - Reduces unnecessary API calls during typing
 * - Improves performance (fewer requests)
 * - Better user experience (no flickering results)
 * - Used in search inputs, filters
 * 
 * USAGE:
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch updates 300ms after user stops typing
 */

import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * IMPORTANCE:
 * - Prevents excessive API calls during typing
 * - Waits for user to finish typing before updating value
 * - Essential for search functionality
 * - Reduces server load
 * 
 * HOW IT WORKS:
 * - User types "football" → waits 300ms → updates value
 * - Without debounce: 8 API calls (one per letter)
 * - With debounce: 1 API call (after typing stops)
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timer if value changes before delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

