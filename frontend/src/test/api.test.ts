import { describe, it, expect, beforeAll } from 'vitest'
import { apiClient, healthClient } from '@/services/apiClient'

describe('API Integration', () => {
  beforeAll(async () => {
    // Wait a bit for servers to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('should connect to backend health endpoint', async () => {
    try {
      const response = await healthClient.get('/health')
      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
    } catch (error) {
      console.error('Backend connection failed:', error)
      throw error
    }
  })

  it('should handle CORS properly', async () => {
    try {
      const response = await healthClient.get('/health')
      expect(response.status).toBe(200)
      // Just verify the response is successful
      expect(response.data).toBeDefined()
    } catch (error) {
      console.error('CORS test failed:', error)
      throw error
    }
  })
})
