import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { paymentsApi } from '@/api/services'
import type { Payment } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paid: 'success', pending: 'warning', refunded: 'secondary', failed: 'destructive',
}

export function CustomerPayments() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-payments', page],
    queryFn: () => paymentsApi.list({ page }).then((r) => r.data),
  })

  const columns: Column<Payment>[] = [
    { key: 'id', header: '#', cell: (p) => <span className="font-mono text-xs text-muted-foreground">#{p.id}</span> },
    { key: 'booking', header: 'Booking', cell: (p) => <span className="font-mono text-xs">#{p.booking_id}</span> },
    { key: 'amount', header: 'Amount', cell: (p) => <span className="font-bold">MAD {p.amount}</span> },
    { key: 'method', header: 'Method', cell: (p) => <Badge variant="secondary" className="capitalize">{p.payment_method}</Badge> },
    { key: 'status', header: 'Status', cell: (p) => <Badge variant={statusVariant[p.payment_status] ?? 'secondary'}>{p.payment_status}</Badge> },
    { key: 'date', header: 'Date', cell: (p) => p.paid_at?.slice(0, 10) ?? '—' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payment History" description={`${data?.meta.total ?? 0} transactions`} />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        total={data?.meta.total}
        page={page}
        lastPage={data?.meta.last_page}
        onPageChange={setPage}
        emptyMessage="No payments yet"
      />
    </div>
  )
}
