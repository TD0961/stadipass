/**
 * useMediaQuery Hook
 * 
 * IMPORTANCE:
 * - Detects screen size changes
 * - Enables responsive behavior in components
 * - Conditionally renders based on screen size
 * - Better than CSS-only responsive design for complex logic
 * - Used for mobile/desktop layouts, conditional features
 * 
 * USAGE:
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * // Component adapts based on screen size
 */

import { useState, useEffect } from 'react';

/**
 * useMediaQuery Hook
 * 
 * IMPORTANCE:
 * - React hook for CSS media queries
 * - Detects screen size changes in real-time
 * - Enables responsive component behavior
 * - Better than CSS for conditional rendering
 * - Used for mobile menus, layout changes
 * 
 * HOW IT WORKS:
 * - Uses window.matchMedia API
 * - Listens for media query changes
 * - Updates state when screen size changes
 * - Returns boolean (matches or not)
 * 
 * @param query - CSS media query string
 * @returns True if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Check initial match
    setMatches(mediaQuery.matches);

    // Listen for changes (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Common media query presets
 * 
 * IMPORTANCE:
 * - Pre-defined breakpoints matching Tailwind
 * - Consistent breakpoints across the app
 * - Easy to use without writing queries
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

