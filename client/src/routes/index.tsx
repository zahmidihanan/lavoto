import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole, PublicOnly } from './guards'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Public
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminCustomers } from '@/pages/admin/AdminCustomers'
import { AdminEmployees } from '@/pages/admin/AdminEmployees'
import { AdminVehicles } from '@/pages/admin/AdminVehicles'
import { AdminServices } from '@/pages/admin/AdminServices'
import { AdminBookings } from '@/pages/admin/AdminBookings'
import { AdminBookingDetail } from '@/pages/admin/AdminBookingDetail'
import { AdminPayments } from '@/pages/admin/AdminPayments'
import { AdminCoupons } from '@/pages/admin/AdminCoupons'
import { AdminStations } from '@/pages/admin/AdminStations'
import { AdminNotifications } from '@/pages/admin/AdminNotifications'
import { AdminReports } from '@/pages/admin/AdminReports'
import { AdminSettings } from '@/pages/admin/AdminSettings'

// Customer
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard'
import { CustomerVehicles } from '@/pages/customer/CustomerVehicles'
import { CustomerBookings } from '@/pages/customer/CustomerBookings'
import { CreateBooking } from '@/pages/customer/CreateBooking'
import { CustomerPayments } from '@/pages/customer/CustomerPayments'
import { CustomerLoyalty } from '@/pages/customer/CustomerLoyalty'
import { CustomerProfile } from '@/pages/customer/CustomerProfile'

// Employee
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard'
import { EmployeeBookings } from '@/pages/employee/EmployeeBookings'
import { EmployeeProfile } from '@/pages/employee/EmployeeProfile'

const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────────────────────
  { path: '/', element: <HomePage /> },
  { path: '/unauthorized', element: <div className="min-h-screen flex items-center justify-center"><p className="text-lg font-medium text-muted-foreground">Access denied.</p></div> },

  // ── Auth (public-only) ────────────────────────────────────────────────────
  {
    element: <PublicOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // ── Admin CRM ─────────────────────────────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={['admin', 'manager']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/admin', element: <AdminDashboard /> },
              { path: '/admin/customers', element: <AdminCustomers /> },
              { path: '/admin/employees', element: <AdminEmployees /> },
              { path: '/admin/vehicles', element: <AdminVehicles /> },
              { path: '/admin/services', element: <AdminServices /> },
              { path: '/admin/bookings', element: <AdminBookings /> },
              { path: '/admin/bookings/:id', element: <AdminBookingDetail /> },
              { path: '/admin/payments', element: <AdminPayments /> },
              { path: '/admin/coupons', element: <AdminCoupons /> },
              { path: '/admin/stations', element: <AdminStations /> },
              { path: '/admin/notifications', element: <AdminNotifications /> },
              { path: '/admin/reports', element: <AdminReports /> },
              { path: '/admin/settings', element: <AdminSettings /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Customer Portal ───────────────────────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={['customer']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/customer', element: <CustomerDashboard /> },
              { path: '/customer/vehicles', element: <CustomerVehicles /> },
              { path: '/customer/bookings', element: <CustomerBookings /> },
              { path: '/customer/bookings/new', element: <CreateBooking /> },
              { path: '/customer/payments', element: <CustomerPayments /> },
              { path: '/customer/loyalty', element: <CustomerLoyalty /> },
              { path: '/customer/profile', element: <CustomerProfile /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Employee Portal ───────────────────────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={['employee']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/employee', element: <EmployeeDashboard /> },
              { path: '/employee/bookings', element: <EmployeeBookings /> },
              { path: '/employee/profile', element: <EmployeeProfile /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
