import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock, Play, Car, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentDialog } from '@/components/shared/PaymentDialog'
import { bookingsApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/utils/cn'

export function EmployeeDashboard() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['employee-bookings'],
    queryFn: () => bookingsApi.list({ per_page: 10 }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'in_progress' ? 'Job started!' : 'Job marked as complete!')
      qc.invalidateQueries({ queryKey: ['employee-bookings'] })
      qc.invalidateQueries({ queryKey: ['employee-bookings-list'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Action failed')
    },
  })

  const list       = bookings?.data ?? []
  const assigned   = list.filter((b) => b.status === 'assigned').length
  const inProgress = list.filter((b) => b.status === 'in_progress').length
  const completed  = list.filter((b) => b.status === 'completed').length

  const today = new Date().toISOString().slice(0, 10)
  const todayJobs = list.filter(
    (b) => (b.status === 'assigned' || b.status === 'in_progress') &&
           b.booking_date?.slice(0, 10) === today
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hi, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here are your assigned jobs"
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Assigned" value={assigned} icon={<CalendarCheck className="h-5 w-5" />} color="amber" />
        <StatCard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard title="Completed" value={completed} icon={<CheckCircle2 className="h-5 w-5" />} color="green" />
      </div>

      {todayJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today's Jobs</h2>
          {todayJobs.map((b) => (
            <div
              key={b.id}
              className={cn(
                'rounded-xl border p-4 flex items-center gap-4',
                b.status === 'in_progress' ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20' : 'bg-card'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{b.service?.name}</p>
                  <BookingStatusBadge status={b.status} />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span><Clock className="h-3 w-3 inline mr-0.5" />{b.booking_time?.slice(0, 5)}</span>
                  {b.vehicle && (
                    <span>
                      <Car className="h-3 w-3 inline mr-0.5" />
                      {b.vehicle.brand} {b.vehicle.model} · {b.vehicle.plate_number}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {b.status === 'assigned' && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                    onClick={() => updateStatus.mutate({ id: b.id, status: 'in_progress' })}
                  >
                    <Play className="h-3.5 w-3.5" /> Start
                  </Button>
                )}
                {b.status === 'in_progress' && (
                  <>
                    <PaymentDialog booking={b}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        disabled={b.payment?.payment_status === 'paid' || b.payment?.payment_status === 'refunded'}
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Pay
                      </Button>
                    </PaymentDialog>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                      onClick={() => updateStatus.mutate({ id: b.id, status: 'completed' })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Finish
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle>All My Jobs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/employee/bookings">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4 h-14 animate-pulse bg-muted/30" />)}</div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No assigned bookings yet</div>
          ) : (
            <div className="divide-y">
              {list.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{b.service?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.booking_date?.slice(0, 10)} · {b.booking_time?.slice(0, 5)} · {b.station?.name}
                    </p>
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
