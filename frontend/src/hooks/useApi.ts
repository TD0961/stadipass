/**
 * useApi Hook
 * 
 * IMPORTANCE:
 * - Simplifies API calls in components
 * - Handles loading, error, and success states automatically
 * - Prevents code duplication across components
 * - Consistent error handling
 * - Makes components cleaner and easier to read
 * 
 * USAGE:
 * const { data, loading, error, refetch } = useApi<Event>('/events');
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient, { getErrorMessage } from '../services/apiClient';

/**
 * API Hook State
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * useApi Hook
 * 
 * IMPORTANCE:
 * - Wrapper for API calls with built-in state management
 * - Automatically handles loading and error states
 * - Reduces boilerplate code in components
 * - Makes API calls declarative instead of imperative
 * 
 * @param url - API endpoint URL
 * @param options - Request options (method, data, etc.)
 * @returns API state and refetch function
 */
export function useApi<T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    skip?: boolean; // Skip initial request
  }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !options?.skip,
    error: null,
  });

  /**
   * Fetch data from API
   * 
   * IMPORTANCE:
   * - Centralized fetch logic
   * - Consistent error handling
   * - Updates loading state automatically
   */
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const method = options?.method || 'GET';
      let response;

      switch (method) {
        case 'GET':
          response = await apiClient.get<T>(url);
          break;
        case 'POST':
          response = await apiClient.post<T>(url, options?.data);
          break;
        case 'PUT':
          response = await apiClient.put<T>(url, options?.data);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(url, options?.data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(url);
          break;
      }

      setState({
        data: response.data as T,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [url, options?.method, options?.data]);

  /**
   * Refetch data
   * 
   * IMPORTANCE:
   * - Allows manual refresh of data
   * - Used after mutations (create, update, delete)
   * - Enables pull-to-refresh functionality
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data on mount (unless skipped)
  useEffect(() => {
    if (!options?.skip) {
      fetchData();
    }
  }, [fetchData, options?.skip]);

  return {
    ...state,
    refetch,
  };
}

