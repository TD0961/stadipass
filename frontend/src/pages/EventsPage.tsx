/**
 * Events Page
 * 
 * IMPORTANCE:
 * - Main page for browsing all available events
 * - Requires authentication (protected route)
 * - Fetches events from backend API
 * - Displays events in organized layout
 * - Entry point for event booking
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import EventCard from '../components/events/EventCard';
import { eventsService } from '../services/eventsService';
import type { EventsResponse } from '../types/api';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/date';
import { useToastStore } from '../stores/toastStore';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventsData, setEventsData] = useState<EventsResponse | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { error: showError } = useToastStore();

  /**
   * Fetch Events from API
   * 
   * IMPORTANCE:
   * - Fetches published events from backend
   * - Supports filtering by date
   * - Handles loading and error states
   * - Type-safe API response
   */
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          from?: string;
          to?: string;
          page?: number;
          limit?: number;
        } = {
          page: 1,
          limit: 50,
        };

        // Add date filter if selected
        if (selectedDate) {
          const date = new Date(selectedDate);
          date.setHours(0, 0, 0, 0);
          params.from = date.toISOString();
          
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          params.to = endDate.toISOString();
        }

        const data = await eventsService.getEvents(params);
        setEventsData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate, showError]);

  /**
   * Filter Events
   * 
   * IMPORTANCE:
   * - Client-side filtering for search and date
   * - Real-time filtering as user types
   * - Improves user experience
   */
  const filteredEvents = eventsData?.items?.filter(event => {
    // Search filter
    const matchesSearch = debouncedSearch === '' || 
      event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (typeof event.stadium === 'object' && event.stadium?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()));

    // Date filter
    const matchesDate = !selectedDate || 
      formatDate(event.startsAt) === formatDate(selectedDate);

    return matchesSearch && matchesDate;
  }) || [];

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Browse Events
            </h1>
            <p className="text-gray-400 text-lg">
              Discover and book tickets for exciting stadium events
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, stadiums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(debouncedSearch || selectedDate) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {debouncedSearch && (
                  <span className="px-3 py-1 bg-[#00f5a0]/20 text-[#00f5a0] rounded-full text-sm flex items-center gap-2">
                    Search: {debouncedSearch}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:text-[#00d9ff]"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDate && (
                  <span className="px-3 py-1 bg-[#00f5a0]/20 text-[#00f5a0] rounded-full text-sm flex items-center gap-2">
                    Date: {formatDate(selectedDate)}
                    <button
                      onClick={() => setSelectedDate('')}
                      className="hover:text-[#00d9ff]"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#00f5a0] animate-spin mb-4" />
              <p className="text-gray-400">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center mb-8"
            >
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              {filteredEvents.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredEvents.map((event, index) => (
                    <EventCard key={event._id} event={event} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0f1e] border border-gray-700/50 rounded-xl p-12 text-center"
                >
                  <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
                  <p className="text-gray-400 mb-6">
                    {eventsData?.items?.length === 0
                      ? "There are no events available at the moment. Check back later!"
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {(debouncedSearch || selectedDate) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedDate('');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] hover:from-[#00d9ff] hover:to-[#00f5a0] text-white rounded-lg transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* Results Count */}
          {!loading && !error && filteredEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center text-gray-400"
            >
              Showing {filteredEvents.length} of {eventsData?.total || 0} events
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
