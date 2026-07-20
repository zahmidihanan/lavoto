import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/api/services'
import type { Booking } from '@/types'

export function CustomerBookings() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => bookingsApi.list({ page }).then((r) => r.data),
  })

  const columns: Column<Booking>[] = [
    {
      key: 'service', header: 'Service',
      cell: (b) => (
        <div>
          <p className="font-medium">{b.service?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{b.station?.name}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date & Time', cell: (b) => `${b.booking_date} · ${b.booking_time}` },
    {
      key: 'vehicle', header: 'Vehicle',
      cell: (b) => b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '—',
    },
    { key: 'status', header: 'Status', cell: (b) => <BookingStatusBadge status={b.status} /> },
    { key: 'amount', header: 'Total', cell: (b) => <span className="font-semibold">MAD {b.total_amount}</span> },
    {
      key: 'actions', header: '',
      cell: (b) => (
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/customer/bookings/${b.id}`}><Eye className="h-4 w-4" /></Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description={`${data?.meta.total ?? 0} total bookings`}
        actions={
          <Button asChild>
            <Link to="/customer/bookings/new"><Plus className="h-4 w-4 mr-1" />New Booking</Link>
          </Button>
        }
      />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        total={data?.meta.total}
        page={page}
        lastPage={data?.meta.last_page}
        onPageChange={setPage}
        emptyMessage="No bookings yet. Book your first car wash!"
      />
    </div>
  )
}
