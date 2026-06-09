import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { paymentsApi } from '@/api/services'
import type { Payment } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'secondary',
  failed: 'destructive',
}

export function AdminPayments() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search],
    queryFn: () => paymentsApi.list({ page, search }).then((r) => r.data),
  })

  const refundMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.refund(id),
    onSuccess: () => {
      toast.success('Payment refunded')
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: () => toast.error('Refund failed'),
  })

  const columns: Column<Payment>[] = [
    {
      key: 'id', header: '#',
      cell: (p) => <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>,
    },
    {
      key: 'booking', header: 'Booking',
      cell: (p) => <span className="font-mono text-xs">#{p.booking_id}</span>,
    },
    {
      key: 'amount', header: 'Amount',
      cell: (p) => <span className="font-bold">${p.amount}</span>,
    },
    {
      key: 'method', header: 'Method',
      cell: (p) => <Badge variant="secondary" className="capitalize">{p.payment_method}</Badge>,
    },
    {
      key: 'status', header: 'Status',
      cell: (p) => <Badge variant={statusVariant[p.payment_status] ?? 'secondary'}>{p.payment_status}</Badge>,
    },
    {
      key: 'date', header: 'Paid At',
      cell: (p) => p.paid_at?.slice(0, 10) ?? '—',
    },
    {
      key: 'actions', header: '',
      cell: (p) => p.payment_status === 'paid' ? (
        <Button
          variant="ghost"
          size="icon"
          title="Refund"
          onClick={() => refundMutation.mutate(p.id)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${data?.meta.total ?? 0} transactions`} />
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
      />
    </div>
  )
}
