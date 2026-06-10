import api from './axios'
import type {
  ApiResponse, PaginatedResponse, PaginationParams,
  AuthResponse, User, Station, Service, Customer, Employee,
  Vehicle, Coupon, Booking, Payment, QualityCheck,
  Notification, LoyaltyTransaction, DashboardData,
} from '@/types'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: {
    name: string; email: string; password: string
    password_confirmation: string; company_name: string; phone?: string
  }) => api.post<ApiResponse<AuthResponse>>('/auth/register', data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  refresh: () => api.post<ApiResponse<{ token: string }>>('/auth/refresh'),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  resetPassword: (data: {
    token: string; email: string; password: string; password_confirmation: string
  }) => api.post<ApiResponse<null>>('/auth/reset-password', data),
  updateProfile: (data: Partial<User & { password: string; current_password: string }>) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: (period: 'week' | 'month' | 'year' = 'month') =>
    api.get<ApiResponse<DashboardData>>('/dashboard', { params: { period } }),
}

// ─── Stations ────────────────────────────────────────────────────────────────

export const stationsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Station>>('/stations', { params }),
  get: (id: number) => api.get<ApiResponse<Station>>(`/stations/${id}`),
  create: (data: Partial<Station>) => api.post<ApiResponse<Station>>('/stations', data),
  update: (id: number, data: Partial<Station>) =>
    api.put<ApiResponse<Station>>(`/stations/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/stations/${id}`),
}

// ─── Services ────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Service>>('/services', { params }),
  active: () => api.get<ApiResponse<Service[]>>('/services/active'),
  get: (id: number) => api.get<ApiResponse<Service>>(`/services/${id}`),
  create: (data: Partial<Service>) => api.post<ApiResponse<Service>>('/services', data),
  update: (id: number, data: Partial<Service>) =>
    api.put<ApiResponse<Service>>(`/services/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/services/${id}`),
}

// ─── Customers ───────────────────────────────────────────────────────────────

export const customersApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }),
  get: (id: number) => api.get<ApiResponse<Customer>>(`/customers/${id}`),
  update: (id: number, data: Partial<Customer>) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/customers/${id}`),
  loyalty: (id: number, params?: PaginationParams) =>
    api.get<PaginatedResponse<LoyaltyTransaction>>(`/customers/${id}/loyalty`, { params }),
  redeem: (id: number, points: number) =>
    api.post<ApiResponse<null>>(`/customers/${id}/loyalty/redeem`, { points }),
}

// ─── Employees ───────────────────────────────────────────────────────────────

export const employeesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Employee>>('/employees', { params }),
  available: (params?: { station_id?: number; date?: string; time?: string; exclude_booking_id?: number }) =>
    api.get<ApiResponse<Employee[]>>('/employees/available', { params }),
  get: (id: number) => api.get<ApiResponse<Employee>>(`/employees/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Employee>>('/employees', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/employees/${id}`),
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Vehicle>>('/vehicles', { params }),
  get: (id: number) => api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`),
  create: (data: Partial<Vehicle>) => api.post<ApiResponse<Vehicle>>('/vehicles', data),
  update: (id: number, data: Partial<Vehicle>) =>
    api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/vehicles/${id}`),
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }),
  get: (id: number) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Booking>>('/bookings', data),
  updateStatus: (id: number, data: { status: string; cancellation_reason?: string }) =>
    api.post<ApiResponse<Booking>>(`/bookings/${id}/status`, data),
  assignEmployees: (id: number, employee_ids: number[]) =>
    api.post<ApiResponse<Booking>>(`/bookings/${id}/assign-employees`, { employee_ids }),
  cancel: (id: number, reason?: string) =>
    api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { cancellation_reason: reason }),
}

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Payment>>('/payments', { params }),
  get: (id: number) => api.get<ApiResponse<Payment>>(`/payments/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Payment>>('/payments', data),
  refund: (id: number) => api.post<ApiResponse<Payment>>(`/payments/${id}/refund`),
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const couponsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Coupon>>('/coupons', { params }),
  get: (id: number) => api.get<ApiResponse<Coupon>>(`/coupons/${id}`),
  create: (data: Partial<Coupon>) => api.post<ApiResponse<Coupon>>('/coupons', data),
  update: (id: number, data: Partial<Coupon>) =>
    api.put<ApiResponse<Coupon>>(`/coupons/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/coupons/${id}`),
  validate: (code: string, amount: number) =>
    api.post<ApiResponse<{ coupon: Coupon; discount: number }>>('/coupons/validate', {
      code,
      amount,
    }),
}

// ─── Quality Checks ──────────────────────────────────────────────────────────

export const qualityChecksApi = {
  get: (id: number) => api.get<ApiResponse<QualityCheck>>(`/quality-checks/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<QualityCheck>>('/quality-checks', data),
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Notification>>('/notifications', { params }),
  unreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  markRead: (id: string) =>
    api.post<ApiResponse<null>>(`/notifications/${id}/mark-read`),
  markAllRead: () => api.post<ApiResponse<null>>('/notifications/mark-all-read'),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/notifications/${id}`),
}

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  get: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/users/${id}`),
}

// ─── Public Booking Portal (no auth) ─────────────────────────────────────────

export interface PublicBookingPayload {
  name: string
  email: string
  phone?: string
  brand: string
  model: string
  year: number
  color?: string
  plate_number: string
  service_id: number
  station_id: number
  booking_date: string
  booking_time: string
  notes?: string
}

export interface PublicBookingResult {
  booking_id: number
  booking_date: string
  booking_time: string
  company_name: string
  service_name: string
  total_amount: string
}

export const publicApi = {
  company: (slug: string) =>
    api.get<ApiResponse<{ id: number; name: string; slug: string }>>(`/public/${slug}`),
  services: (slug: string) =>
    api.get<ApiResponse<Service[]>>(`/public/${slug}/services`),
  stations: (slug: string) =>
    api.get<ApiResponse<Station[]>>(`/public/${slug}/stations`),
  book: (slug: string, data: PublicBookingPayload) =>
    api.post<ApiResponse<PublicBookingResult>>(`/public/${slug}/book`, data),
  availability: (slug: string, params: { date: string; station_id?: number }) =>
    api.get<ApiResponse<{ full_slots: string[]; has_employees: boolean }>>(`/public/${slug}/availability`, { params }),
}
