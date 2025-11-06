/**
 * Date Formatting Utilities
 * 
 * IMPORTANCE:
 * - Consistent date formatting across the app
 * - Prevents date formatting code duplication
 * - User-friendly date displays
 * - Handles timezone conversions
 * - Localized date formats
 */

/**
 * Format date to readable string
 * 
 * IMPORTANCE:
 * - Converts ISO date strings to user-friendly format
 * - Used in event cards, tickets, orders
 * - Consistent format: "January 15, 2025"
 * 
 * @param date - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format time to readable string
 * 
 * IMPORTANCE:
 * - Shows time in user-friendly format
 * - Used in event listings
 * - Consistent format: "3:00 PM"
 * 
 * @param date - ISO date string or Date object
 * @returns Formatted time string
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Format date and time together
 * 
 * IMPORTANCE:
 * - Shows both date and time in one string
 * - Used in event details, tickets
 * - Format: "January 15, 2025 at 3:00 PM"
 * 
 * @param date - ISO date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Format date to short format
 * 
 * IMPORTANCE:
 * - Compact date format for cards and lists
 * - Format: "Jan 15, 2025"
 * - Saves space in UI
 * 
 * @param date - ISO date string or Date object
 * @returns Short formatted date string
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Check if date is in the past
 * 
 * IMPORTANCE:
 * - Determines if event has passed
 * - Used for disabling past events
 * - Shows "Past Event" status
 * 
 * @param date - ISO date string or Date object
 * @returns True if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Get relative time (e.g., "in 2 days", "yesterday")
 * 
 * IMPORTANCE:
 * - User-friendly relative time display
 * - Shows "This Weekend", "Next Week", etc.
 * - Used in event cards for quick reference
 * 
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Past';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else if (diffDays <= 14) {
    return 'Next Week';
  } else if (diffDays <= 30) {
    return 'This Month';
  } else {
    return formatDateShort(dateObj);
  }
}

/**
 * Check if date is today
 * 
 * IMPORTANCE:
 * - Highlights events happening today
 * - Used for special styling
 * - Shows "Live" or "Today" badges
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

