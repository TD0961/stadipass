/**
 * Event Card Component
 * 
 * IMPORTANCE:
 * - Reusable component for displaying event information
 * - Consistent event display across the app
 * - Used in events listing and related events
 * - Handles navigation to event details
 * - Type-safe event data display
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import type { Event } from '../../types/api';
import { formatDate, formatTime, getRelativeTime } from '../../utils/date';

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  /**
   * Get Stadium Name
   * 
   * IMPORTANCE:
   * - Handles both string (ID) and populated Stadium object
   * - Provides fallback if stadium not populated
   */
  const stadiumName = typeof event.stadium === 'string' 
    ? 'Stadium' 
    : event.stadium?.name || 'Stadium';

  /**
   * Get Available Ticket Categories
   * 
   * IMPORTANCE:
   * - Shows ticket options available
   * - Displays price range
   * - Helps users understand ticket availability
   */
  const ticketCategories = event.ticketCategories || [];
  const minPrice = ticketCategories.length > 0
    ? Math.min(...ticketCategories.map(cat => cat.price))
    : 0;
  const maxPrice = ticketCategories.length > 0
    ? Math.max(...ticketCategories.map(cat => cat.price))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        ease: [0.4, 0, 0.2, 1]
      }}
      className="group relative bg-[#0a0f1e] border border-gray-700/50 rounded-xl overflow-hidden hover:border-[#00f5a0]/50 transition-all duration-300 shadow-lg hover:shadow-[#00f5a0]/20"
    >
      {/* Event Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-[#00f5a0]/20 to-[#00d9ff]/20 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Ticket className="w-16 h-16 text-[#00f5a0]/30" />
        </div>
        {/* Featured Badge */}
        {event.isPublished && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-[#00f5a0] text-black text-xs font-bold rounded-full">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00f5a0] transition-colors">
          {event.title}
        </h3>

        {/* Event Date & Time */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.startsAt)}</span>
          <span className="mx-1">•</span>
          <span>{formatTime(event.startsAt)}</span>
        </div>

        {/* Stadium Location */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{stadiumName}</span>
        </div>

        {/* Ticket Categories Info */}
        {ticketCategories.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Ticket className="w-4 h-4 text-[#00f5a0]" />
              <span>
                {ticketCategories.length} {ticketCategories.length === 1 ? 'category' : 'categories'} available
              </span>
            </div>
            <div className="text-[#00f5a0] font-semibold">
              ${minPrice.toFixed(2)}
              {minPrice !== maxPrice && ` - $${maxPrice.toFixed(2)}`}
            </div>
          </div>
        )}

        {/* Relative Time Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
            {getRelativeTime(event.startsAt)}
          </span>
        </div>

        {/* View Details Button */}
        <Link to={`/events/${event._id}`}>
          <Button className="w-full bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] hover:from-[#00d9ff] hover:to-[#00f5a0]">
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

