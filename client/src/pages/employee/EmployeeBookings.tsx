import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/api/services'
import type { Booking, BookingStatus } from '@/types'

const ALLOWED_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus>> = {
  assigned: 'in_progress',
  in_progress: 'quality_check',
}

export function EmployeeBookings() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-bookings-list', page],
    queryFn: () => bookingsApi.list({ page }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['employee-bookings-list'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Invalid transition')
    },
  })

  const columns: Column<Booking>[] = [
    {
      key: 'id', header: '#',
      cell: (b) => <span className="font-mono text-xs text-muted-foreground">#{b.id}</span>,
    },
    {
      key: 'service', header: 'Service',
      cell: (b) => (
        <div>
          <p className="font-medium">{b.service?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{b.booking_date} · {b.booking_time}</p>
        </div>
      ),
    },
    { key: 'station', header: 'Station', cell: (b) => b.station?.name ?? '—' },
    {
      key: 'vehicle', header: 'Vehicle',
      cell: (b) => b.vehicle
        ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.plate_number})`
        : '—',
    },
    { key: 'status', header: 'Status', cell: (b) => <BookingStatusBadge status={b.status} /> },
    {
      key: 'actions', header: '',
      cell: (b) => {
        const next = ALLOWED_TRANSITIONS[b.status]
        return (
          <div className="flex items-center gap-1 justify-end">
            {next && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus.mutate({ id: b.id, status: next })}
                loading={updateStatus.isPending}
              >
                → {next.replace('_', ' ')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/employee/bookings/${b.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" description={`${data?.meta.total ?? 0} assigned jobs`} />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        total={data?.meta.total}
        page={page}
        lastPage={data?.meta.last_page}
        onPageChange={setPage}
        emptyMessage="No bookings assigned to you"
      />
    </div>
  )
}
