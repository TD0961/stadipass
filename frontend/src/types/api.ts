/**
 * API Type Definitions
 * 
 * IMPORTANCE:
 * - Provides type safety for all API responses
 * - Prevents runtime errors from incorrect data structures
 * - Enables autocomplete in IDE for API data
 * - Documents the shape of data from backend
 * - Makes refactoring safer (TypeScript catches breaking changes)
 * - Ensures frontend and backend data contracts match
 */

/**
 * Ticket Category
 * 
 * Represents a category of tickets for an event (e.g., VIP, Regular)
 * Matches backend ITicketCategory interface
 */
export interface TicketCategory {
  name: string;      // e.g., "VIP", "Regular"
  price: number;     // Price per ticket
  quota: number;     // Total tickets available in this category
}

/**
 * Event
 * 
 * IMPORTANCE:
 * - Used throughout the app (homepage, events page, event details)
 * - Type-safe event data prevents bugs
 * - Stadium can be string (ID) or populated Stadium object
 */
export interface Event {
  _id: string;
  stadium: string | Stadium;  // Can be ID or populated object
  title: string;
  startsAt: string;           // ISO date string from API
  endsAt?: string;
  ticketCategories: TicketCategory[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stadium Section
 * 
 * Represents a section within a stadium (e.g., "North Stand", "VIP Section")
 */
export interface StadiumSection {
  name: string;
  capacity: number;
}

/**
 * Stadium
 * 
 * IMPORTANCE:
 * - Used in event listings and stadium pages
 * - Type-safe stadium data
 * - Prevents accessing undefined properties
 */
export interface Stadium {
  _id: string;
  name: string;
  location?: string;
  capacity: number;
  sections: StadiumSection[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Ticket Status
 * 
 * IMPORTANCE:
 * - Prevents typos in status strings
 * - Type-safe status comparisons
 * - Autocomplete for status values
 */
export const TicketStatus = {
  ACTIVE: 'active',
  USED: 'used',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

/**
 * Ticket
 * 
 * IMPORTANCE:
 * - Used in user dashboard (My Tickets)
 * - Type-safe ticket data prevents display errors
 * - Ensures QR code and validation data are correct
 */
export interface Ticket {
  _id: string;
  ticketNumber: string;        // e.g., "TKT-2024-00000001"
  order: string | Order;       // Order ID or populated object
  user: string | User;         // User ID or populated object
  event: string | Event;       // Event ID or populated object
  ticketCategory: string;
  price: number;
  status: TicketStatus;
  qrCode: string;
  qrCodeHash: string;
  usedAt?: string;
  usedBy?: string;
  entryLocation?: string;
  deviceInfo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Status
 * 
 * IMPORTANCE:
 * - Type-safe order status
 * - Prevents invalid status values
 * - Matches backend OrderStatus enum exactly
 */
export const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * Payment Status
 */
export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

/**
 * Order Item
 * 
 * Represents an item within an order (ticket category and quantity)
 */
export interface OrderItem {
  ticketCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Order
 * 
 * IMPORTANCE:
 * - Used in user dashboard (My Orders)
 * - Admin order management
 * - Type-safe order data prevents calculation errors
 * - Ensures all order fields are properly typed
 * - Matches backend IOrder interface exactly
 */
export interface Order {
  _id: string;
  orderNumber: string;         // e.g., "ORD-2024-00000001"
  user: string | User;
  event: string | Event;
  items: OrderItem[];           // Order items with ticket categories
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentMethod?: string;
  expiresAt: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Role
 * 
 * IMPORTANCE:
 * - Type-safe role checking
 * - Prevents typos in role comparisons
 * - Used for authorization throughout the app
 */
export const UserRole = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  STAFF: 'staff',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * User
 * 
 * IMPORTANCE:
 * - Used in authentication and user profile
 * - Type-safe user data
 * - Prevents accessing undefined user properties
 * - Ensures role-based access control is type-safe
 */
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated API Response
 * 
 * IMPORTANCE:
 * - Standard structure for all list endpoints
 * - Type-safe pagination data
 * - Consistent pagination handling across the app
 * - Prevents errors from missing pagination fields
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Events API Response
 * 
 * IMPORTANCE:
 * - Type-safe events list response
 * - Matches backend API structure exactly
 */
export type EventsResponse = PaginatedResponse<Event>;

/**
 * Stadiums API Response
 * 
 * IMPORTANCE:
 * - Type-safe stadiums list response
 */
export type StadiumsResponse = Stadium[]; // Backend returns array, not paginated

/**
 * API Error Response
 * 
 * IMPORTANCE:
 * - Standardized error structure
 * - Type-safe error handling
 * - Consistent error messages across the app
 * - Prevents errors from undefined error properties
 */
export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
  statusCode?: number;
}

/**
 * Authentication Response
 * 
 * IMPORTANCE:
 * - Type-safe auth responses
 * - Ensures tokens are properly typed
 * - Prevents errors from missing auth fields
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

