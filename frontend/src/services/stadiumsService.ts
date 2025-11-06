/**
 * Stadiums Service
 * 
 * IMPORTANCE:
 * - Centralized stadiums API calls
 * - Type-safe stadium operations
 * - Consistent error handling
 * - Reusable across components
 */

import apiClient from './apiClient';
import type { Stadium } from '../types/api';

/**
 * Stadiums Service
 */
export const stadiumsService = {
  /**
   * Get All Stadiums
   * 
   * IMPORTANCE:
   * - Fetches list of all stadiums
   * - Used in stadiums page, filters
   * - Type-safe response
   * 
   * @returns Array of stadiums
   */
  async getStadiums(): Promise<Stadium[]> {
    const response = await apiClient.get<Stadium[]>('/stadiums');
    return response.data;
  },

  /**
   * Get Stadium by ID
   * 
   * IMPORTANCE:
   * - Fetches single stadium details
   * - Used in stadium details page
   * 
   * @param id - Stadium ID
   * @returns Stadium data
   */
  async getStadiumById(id: string): Promise<Stadium> {
    const response = await apiClient.get<Stadium>(`/stadiums/${id}`);
    return response.data;
  },
};

