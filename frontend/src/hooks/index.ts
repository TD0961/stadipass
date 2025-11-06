/**
 * Custom Hooks Index
 * 
 * IMPORTANCE:
 * - Central export point for all hooks
 * - Easy imports: import { useAuth, useApi } from '@/hooks'
 * - Prevents long import paths
 * - Makes hooks discoverable
 */

export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';

