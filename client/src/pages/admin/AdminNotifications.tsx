import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notificationsApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'
import type { Notification } from '@/types'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

export function AdminNotifications() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list({ page }).then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] })
    qc.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  })

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read')
      invalidate()
    },
  })

  const deleteNotif = useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: invalidate,
  })

  const unread = data?.data.filter((n) => !n.is_read).length ?? 0

  const handleNav = (n: Notification) => {
    const d = (n.data ?? {}) as Record<string, unknown>
    if (d.booking_id) {
      const prefix = role === 'admin' || role === 'manager' ? 'admin' : 'employee'
      navigate(`/${prefix}/bookings/${d.booking_id}`)
    } else if (d.payment_id) {
      const prefix = role === 'admin' || role === 'manager' ? 'admin' : 'employee'
      navigate(`/${prefix}/payments`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'All caught up'}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAll.mutate()}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {data?.data.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNav(n)}
                className={cn(
                  'flex items-start gap-4 p-4 transition-colors cursor-pointer',
                  !n.is_read && 'bg-primary/5'
                )}
              >
                <div className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  n.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                )}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    {!n.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id) }} title="Mark read">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
