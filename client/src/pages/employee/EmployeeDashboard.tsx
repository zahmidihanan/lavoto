import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'

export function EmployeeDashboard() {
  const { user } = useAuthStore()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['employee-bookings'],
    queryFn: () => bookingsApi.list({ per_page: 10 }).then((r) => r.data),
  })

  const assigned = bookings?.data.filter((b) => b.status === 'assigned').length ?? 0
  const inProgress = bookings?.data.filter((b) => b.status === 'in_progress').length ?? 0
  const completed = bookings?.data.filter((b) => b.status === 'completed').length ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hi, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here are your assigned jobs for today"
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Assigned" value={assigned} icon={<CalendarCheck className="h-5 w-5" />} color="amber" />
        <StatCard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard title="Completed" value={completed} icon={<CheckCircle className="h-5 w-5" />} color="green" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle>My Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/employee/bookings">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4 h-14 animate-pulse bg-muted/30" />)}</div>
          ) : (bookings?.data ?? []).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No assigned bookings</div>
          ) : (
            <div className="divide-y">
              {(bookings?.data ?? []).map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{b.service?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.booking_date} · {b.station?.name}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
