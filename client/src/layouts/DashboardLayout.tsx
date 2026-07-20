import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme.store'
import { useAuthStore } from '@/stores/auth.store'
import { notificationsApi } from '@/api/services'
import { useNotifications } from '@/hooks/useNotifications'
import { Toaster } from 'sonner'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggle } = useThemeStore()
  const { user } = useAuthStore()

  // Real-time SSE connection for instant notification delivery
  useNotifications()

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.data),
    refetchInterval: 30_000,
  })

  const unread = unreadData?.count ?? 0
  const role = user?.roles?.[0]
  const notifPath = role === 'admin' || role === 'manager'
    ? '/admin/notifications'
    : '/employee/notifications'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 lg:hidden" />
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to={notifPath}>
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 leading-none">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
