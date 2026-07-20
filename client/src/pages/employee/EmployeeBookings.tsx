import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Play, CheckCircle2, Car, MapPin, Clock, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PaymentDialog } from '@/components/shared/PaymentDialog'
import { bookingsApi } from '@/api/services'
import type { Booking } from '@/types'
import { cn } from '@/utils/cn'

export function EmployeeBookings() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-bookings-list', page],
    queryFn: () => bookingsApi.list({ page, per_page: 20 }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'in_progress' ? 'Job started!' : 'Job completed!')
      qc.invalidateQueries({ queryKey: ['employee-bookings-list'] })
      qc.invalidateQueries({ queryKey: ['employee-bookings'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Action failed')
    },
  })

  const bookings = data?.data ?? []
  const active = bookings.filter((b) => b.status === 'assigned' || b.status === 'in_progress')
  const done   = bookings.filter((b) => b.status === 'completed' || b.status === 'quality_check')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Bookings" description="Your assigned jobs" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" description={`${data?.meta.total ?? 0} assigned jobs`} />

      {bookings.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No bookings assigned to you yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Active Jobs ({active.length})
              </p>
              {active.map((b) => (
                <JobCard
                  key={b.id}
                  booking={b}
                  onAction={(status) => updateStatus.mutate({ id: b.id, status })}
                  isPending={updateStatus.isPending}
                />
              ))}
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Completed ({done.length})
              </p>
              {done.map((b) => <JobCard key={b.id} booking={b} />)}
            </div>
          )}
        </div>
      )}

      {(data?.meta.last_page ?? 1) > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground py-1.5">{page} / {data?.meta.last_page}</span>
          <Button variant="outline" size="sm" disabled={page === data?.meta.last_page} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}

function JobCard({
  booking,
  onAction,
  isPending,
}: {
  booking: Booking
  onAction?: (status: string) => void
  isPending?: boolean
}) {
  const isAssigned   = booking.status === 'assigned'
  const isInProgress = booking.status === 'in_progress'
  const isDone       = booking.status === 'completed' || booking.status === 'quality_check'

  return (
    <Card className={cn(
      'transition-all',
      isInProgress && 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20',
      isDone && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{booking.service?.name ?? '—'}</p>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {booking.booking_date?.slice(0, 10)} · {booking.booking_time?.slice(0, 5)}
              </span>
              {booking.station && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.station.name}
                </span>
              )}
              {booking.vehicle && (
                <span className="flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" />
                  {booking.vehicle.brand} {booking.vehicle.model} · {booking.vehicle.plate_number}
                </span>
              )}
            </div>
            {booking.customer?.user?.name && (
              <p className="text-xs text-muted-foreground">
                Client: <span className="font-medium text-foreground">{booking.customer.user.name}</span>
              </p>
            )}
          </div>

          {onAction && (
            <div className="shrink-0 flex items-center gap-2">
              {isAssigned && (
                <Button
                  size="sm"
                  onClick={() => onAction('in_progress')}
                  loading={isPending}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </Button>
              )}
              {isInProgress && (
                <>
                  <PaymentDialog booking={booking}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      disabled={booking.payment?.payment_status === 'paid' || booking.payment?.payment_status === 'refunded'}
                    >
                      <DollarSign className="h-3.5 w-3.5" /> Pay
                    </Button>
                  </PaymentDialog>
                  <Button
                    size="sm"
                    onClick={() => onAction('completed')}
                    loading={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Finish
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
