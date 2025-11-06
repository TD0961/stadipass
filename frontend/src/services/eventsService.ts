/**
 * Events Service
 * 
 * IMPORTANCE:
 * - Centralized events API calls
 * - Type-safe event operations
 * - Consistent error handling
 * - Reusable across components
 * - Makes it easy to fetch events anywhere
 * 
 * USAGE:
 * const events = await eventsService.getEvents();
 * const event = await eventsService.getEventById(id);
 */

import apiClient from './apiClient';
import type { Event, EventsResponse } from '../types/api';

/**
 * Events Service
 * 
 * IMPORTANCE:
 * - Single place for all event API calls
 * - Prevents code duplication
 * - Consistent API usage
 * - Easy to test and maintain
 */
export const eventsService = {
  /**
   * Get Events List
   * 
   * IMPORTANCE:
   * - Fetches list of published events
   * - Supports filtering and pagination
   * - Used in events page, homepage
   * - Type-safe response
   * 
   * @param params - Query parameters (stadium, from, to, page, limit)
   * @returns Paginated events response
   */
  async getEvents(params?: {
    stadium?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<EventsResponse> {
    const response = await apiClient.get<EventsResponse>('/events', { params });
    return response.data;
  },

  /**
   * Get Event by ID
   * 
   * IMPORTANCE:
   * - Fetches single event details
   * - Used in event details page
   * - Type-safe event data
   * 
   * @param id - Event ID
   * @returns Event data
   */
  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },
};

