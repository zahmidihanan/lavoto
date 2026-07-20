import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function RequireAuth() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

export function RequireRole({ roles }: { roles: string[] }) {
  const { role } = useAuthStore()
  if (!role || !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}

export function PublicOnly() {
  const { isAuthenticated, role } = useAuthStore()
  if (isAuthenticated) {
    const redirect = role === 'admin' ? '/admin'
      : role === 'employee' ? '/employee'
      : '/customer'
    return <Navigate to={redirect} replace />
  }
  return <Outlet />
}
