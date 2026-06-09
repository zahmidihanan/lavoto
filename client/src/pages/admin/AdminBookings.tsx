import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bookingsApi, employeesApi } from '@/api/services'
import type { Booking, BookingStatus } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

const STATUSES: BookingStatus[] = ['pending','confirmed','assigned','in_progress','quality_check','completed','cancelled']

export function AdminBookings() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusDialog, setStatusDialog] = useState<{ booking: Booking; newStatus: BookingStatus } | null>(null)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, search],
    queryFn: () => bookingsApi.list({ page, search }).then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('Booking status updated')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setStatusDialog(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Invalid status transition')
    },
  })

  const columns: Column<Booking>[] = [
    {
      key: 'id', header: '#',
      cell: (b) => <span className="text-muted-foreground font-mono text-xs">#{b.id}</span>,
    },
    {
      key: 'customer', header: 'Customer',
      cell: (b) => (
        <div>
          <p className="font-medium">{b.customer?.user?.name ?? `Customer #${b.customer_id}`}</p>
          <p className="text-xs text-muted-foreground">{b.service?.name}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date', cell: (b) => `${b.booking_date} ${b.booking_time}` },
    { key: 'station', header: 'Station', cell: (b) => b.station?.name ?? '—' },
    { key: 'status', header: 'Status', cell: (b) => <BookingStatusBadge status={b.status} /> },
    {
      key: 'amount', header: 'Amount',
      cell: (b) => <span className="font-semibold">${b.total_amount}</span>,
    },
    {
      key: 'actions', header: '',
      cell: (b) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/bookings/${b.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description={`${data?.meta.total ?? 0} total bookings`} />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        total={data?.meta.total}
        page={page}
        lastPage={data?.meta.last_page}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search bookings…"
      />
    </div>
  )
}
