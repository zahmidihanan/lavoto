import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard, Users, UserCheck, Car, Wrench, CalendarCheck,
  CreditCard, Tag, Building2, Bell, BarChart3, Settings,
  Car as CarIcon, LogOut, ChevronLeft,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const adminNav: NavItem[] = [
  { label: 'Dashboard',     href: '/admin',              icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Customers',     href: '/admin/customers',    icon: <Users className="h-4 w-4" /> },
  { label: 'Employees',     href: '/admin/employees',    icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Vehicles',      href: '/admin/vehicles',     icon: <Car className="h-4 w-4" /> },
  { label: 'Services',      href: '/admin/services',     icon: <Wrench className="h-4 w-4" /> },
  { label: 'Bookings',      href: '/admin/bookings',     icon: <CalendarCheck className="h-4 w-4" /> },
  { label: 'Payments',      href: '/admin/payments',     icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Coupons',       href: '/admin/coupons',      icon: <Tag className="h-4 w-4" /> },
  { label: 'Stations',      href: '/admin/stations',     icon: <Building2 className="h-4 w-4" /> },
  { label: 'Notifications', href: '/admin/notifications',icon: <Bell className="h-4 w-4" /> },
  { label: 'Reports',       href: '/admin/reports',      icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Settings',      href: '/admin/settings',     icon: <Settings className="h-4 w-4" /> },
]

const customerNav: NavItem[] = [
  { label: 'Dashboard',       href: '/customer',                 icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'My Vehicles',     href: '/customer/vehicles',        icon: <CarIcon className="h-4 w-4" /> },
  { label: 'Bookings',        href: '/customer/bookings',        icon: <CalendarCheck className="h-4 w-4" /> },
  { label: 'Payments',        href: '/customer/payments',        icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Loyalty Points',  href: '/customer/loyalty',         icon: <Tag className="h-4 w-4" /> },
  { label: 'Profile',         href: '/customer/profile',         icon: <Settings className="h-4 w-4" /> },
]

const employeeNav: NavItem[] = [
  { label: 'Dashboard',     href: '/employee',              icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Bookings',      href: '/employee/bookings',     icon: <CalendarCheck className="h-4 w-4" /> },
  { label: 'Notifications', href: '/employee/notifications',icon: <Bell className="h-4 w-4" /> },
  { label: 'Profile',       href: '/employee/profile',      icon: <Settings className="h-4 w-4" /> },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const { user, role, clearAuth } = useAuthStore()

  const nav = role === 'admin' ? adminNav
    : role === 'customer' ? customerNav
    : employeeNav

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 flex flex-col',
          'bg-sidebar border-r border-sidebar-border transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <CarIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>Lavoto</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = item.href === '/admin' || item.href === '/customer' || item.href === '/employee'
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4">
          <Separator className="mb-3 bg-sidebar-border" />
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <button
              onClick={clearAuth}
              className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
