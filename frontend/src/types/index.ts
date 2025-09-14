// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'customer' | 'admin' | 'staff'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  token: string
}

// Stadium Types
export interface Stadium {
  _id: string
  name: string
  location?: string
  capacity: number
  sections: StadiumSection[]
  createdAt: string
  updatedAt: string
}

export interface StadiumSection {
  name: string
  capacity: number
}

// Event Types
export interface Event {
  _id: string
  stadium: string | Stadium
  title: string
  startsAt: string
  endsAt?: string
  ticketCategories: TicketCategory[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TicketCategory {
  name: string
  price: number
  quota: number
}

// Order Types
export interface Order {
  _id: string
  orderNumber: string
  user: string | User
  event: string | Event
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentId?: string
  paymentMethod?: string
  expiresAt: string
  paidAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
  isExpired: boolean
  canBeCancelled: boolean
}

export interface OrderItem {
  ticketCategory: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Ticket Types
export interface Ticket {
  _id: string
  ticketNumber: string
  order: string | Order
  user: string | User
  event: string | Event
  ticketCategory: string
  price: number
  status: 'active' | 'used' | 'cancelled' | 'refunded'
  qrCode: string
  qrCodeHash: string
  usedAt?: string
  usedBy?: string | User
  entryLocation?: string
  deviceInfo?: string
  createdAt: string
  updatedAt: string
  isUsed: boolean
  isValid: boolean
  canBeUsed: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  pages: number
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface CreateOrderForm {
  eventId: string
  items: {
    ticketCategory: string
    quantity: number
  }[]
}

// Inventory Types
export interface InventoryItem {
  category: string
  price: number
  totalQuota: number
  sold: number
  available: number
  reserved: number
  soldOut: boolean
  salesPercentage: number
}

export interface EventInventory {
  event: {
    id: string
    title: string
    startsAt: string
    stadium: string
    isPublished: boolean
  }
  categories: InventoryItem[]
  summary: {
    totalQuota: number
    totalSold: number
    totalAvailable: number
    totalReserved: number
    overallSalesPercentage: number
    revenue: number
  }
}

// Validation Types
export interface ValidationResult {
  valid: boolean
  ticket?: Ticket
  error?: string
  message?: string
  details?: {
    ticketNumber: string
    eventTitle: string
    userName: string
    category: string
    price: number
    usedAt?: string
    entryLocation?: string
  }
}

// QR Code Types
export interface QRCodeData {
  ticketId: string
  ticketNumber: string
  eventId: string
  userId: string
  timestamp: string
  hash: string
}

// Filter Types
export interface EventFilters {
  stadium?: string
  from?: string
  to?: string
  category?: string
  priceMin?: number
  priceMax?: number
  search?: string
}

// Dashboard Types
export interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalTickets: number
  soldTickets: number
  availableTickets: number
  totalRevenue: number
  averageTicketPrice: number
}

// Error Types
export interface ApiError {
  message: string
  status: number
  details?: any
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Theme Types
export type Theme = 'light' | 'dark'

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}
