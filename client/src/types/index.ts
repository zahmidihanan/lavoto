// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  company_id?: number
  station_id?: number
  customer_id?: number
  employee_id?: number
  email_verified_at?: string
  last_login_at?: string
  roles?: string[]
  permissions?: string[]
  station?: Station
  company?: Company
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: number
  name: string
  slug: string
  status: string
  created_at: string
}

// ─── Station ─────────────────────────────────────────────────────────────────

export interface Station {
  id: number
  name: string
  address: string
  city: string
  phone?: string
  status: 'active' | 'inactive'
  company_id: number
  created_at: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface Service {
  id: number
  name: string
  description?: string
  price: string
  duration_minutes: number
  is_active: boolean
  company_id: number
  created_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: number
  address?: string
  loyalty_points: number
  company_id: number
  user?: User
  vehicles?: Vehicle[]
  created_at: string
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface Employee {
  id: number
  employee_code: string
  hire_date: string
  salary?: string
  company_id: number
  station_id?: number
  user?: User
  station?: Station
  created_at: string
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: number
  brand: string
  model: string
  year: number
  color?: string
  plate_number: string
  company_id: number
  customer_id: number
  customer?: Customer
  created_at: string
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface Coupon {
  id: number
  code: string
  type: 'fixed' | 'percentage'
  value: string
  min_amount?: string
  max_uses?: number
  used_count: number
  expires_at?: string
  is_active: boolean
  company_id: number
  created_at: string
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'quality_check'
  | 'completed'
  | 'cancelled'

export interface Booking {
  id: number
  company_id: number
  customer_id: number
  vehicle_id: number
  service_id: number
  station_id: number
  coupon_id?: number
  booking_date: string
  booking_time: string
  status: BookingStatus
  total_amount: string
  discount_amount: string
  notes?: string
  cancelled_at?: string
  cancellation_reason?: string
  customer?: Customer
  vehicle?: Vehicle
  service?: Service
  station?: Station
  coupon?: Coupon
  employees?: Employee[]
  payment?: Payment
  qualityCheck?: QualityCheck
  created_at: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: number
  booking_id: number
  amount: string
  payment_method: 'cash' | 'card' | 'transfer' | 'online'
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
  transaction_reference?: string
  notes?: string
  paid_at?: string
  booking?: Booking
  created_at: string
}

// ─── Quality Check ───────────────────────────────────────────────────────────

export interface QualityCheck {
  id: number
  booking_id: number
  employee_id?: number
  notes?: string
  passed: boolean
  rating?: number
  employee?: Employee
  created_at: string
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  data?: Record<string, unknown>
  read_at?: string
  is_read: boolean
  created_at: string
}

// ─── Loyalty ─────────────────────────────────────────────────────────────────

export interface LoyaltyTransaction {
  id: number
  customer_id: number
  booking_id?: number
  points: number
  type: 'earned' | 'redeemed'
  description: string
  created_at: string
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message?: string
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  bookings_by_status: Record<BookingStatus, number>
  revenue: { total: number; period: number }
  total_customers: number
  total_employees: number
  period: string
  recent_bookings: Booking[]
}
