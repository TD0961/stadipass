/**
 * Event Details Page
 * 
 * IMPORTANCE:
 * - Shows detailed information about a specific event
 * - Allows users to select tickets and quantities
 * - Entry point for ticket purchase
 * - Requires authentication
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Ticket, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { eventsService } from '../services/eventsService';
import { useState, useEffect } from 'react';
import type { Event } from '../types/api';
import { formatTime, formatDateTime } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { useToastStore } from '../stores/toastStore';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch Event Details
   * 
   * IMPORTANCE:
   * - Loads specific event data
   * - Handles loading and error states
   * - Type-safe event data
   */
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await eventsService.getEventById(id);
        setEvent(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load event';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, showError]);

  /**
   * Get Stadium Name
   */
  const stadiumName = typeof event?.stadium === 'string'
    ? 'Stadium'
    : event?.stadium?.name || 'Stadium';

  const stadiumLocation = typeof event?.stadium === 'object'
    ? event?.stadium?.location
    : undefined;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#00f5a0] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/events">
                <Button variant="outline">Back to Events</Button>
              </Link>
              <Link to="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#00f5a0] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Events
            </button>
          </motion.div>

          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-2xl p-8 mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#00f5a0]" />
                <div>
                  <p className="text-gray-400 text-sm">Date & Time</p>
                  <p className="text-white font-semibold">{formatDateTime(event.startsAt)}</p>
                  {event.endsAt && (
                    <p className="text-gray-400 text-sm">Ends: {formatTime(event.endsAt)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#00f5a0]" />
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{stadiumName}</p>
                  {stadiumLocation && (
                    <p className="text-gray-400 text-sm">{stadiumLocation}</p>
                  )}
                </div>
              </div>
            </div>

            {event.isPublished && (
              <div className="inline-block px-4 py-2 bg-[#00f5a0]/20 border border-[#00f5a0] rounded-full">
                <span className="text-[#00f5a0] font-semibold">✓ Published</span>
              </div>
            )}
          </motion.div>

          {/* Ticket Categories */}
          {event.ticketCategories.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#0a0f1e] border border-[#00f5a0]/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-[#00f5a0]" />
                Available Tickets
              </h2>

              <div className="space-y-4">
                {event.ticketCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-[#030712] border border-gray-700/50 rounded-lg p-6 hover:border-[#00f5a0]/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {category.quota} tickets available
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent">
                            {formatCurrency(category.price)}
                          </p>
                          <p className="text-gray-400 text-sm">per ticket</p>
                        </div>
                        <Button className="whitespace-nowrap">
                          Select Tickets
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 <strong>Note:</strong> Ticket selection and cart functionality coming soon. 
                  This will allow you to choose quantities and add tickets to your cart.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0f1e] border border-gray-700/50 rounded-2xl p-8 text-center"
            >
              <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Tickets Available</h3>
              <p className="text-gray-400">Tickets for this event are not yet available.</p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}

