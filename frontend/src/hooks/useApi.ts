import { useState, useCallback } from 'react'
import { ApiResponse } from '@/types'

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
}

export interface UseApiReturn<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiFunction(...args)
      const result = response.data || response
      setData(result as T)
      options.onSuccess?.(result as T)
      return result as T
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      options.onError?.(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  }
}
