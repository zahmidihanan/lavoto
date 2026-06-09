import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2, Eye } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { customersApi } from '@/api/services'
import type { Customer } from '@/types'
import { useNavigate } from 'react-router-dom'

export function AdminCustomers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, search, per_page: 15 }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      toast.success('Customer deleted')
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: () => toast.error('Failed to delete customer'),
  })

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      cell: (c) => (
        <div>
          <p className="font-medium">{c.user?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{c.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (c) => <span className="text-muted-foreground">{c.user?.phone ?? '—'}</span>,
    },
    {
      key: 'loyalty',
      header: 'Loyalty Points',
      cell: (c) => (
        <Badge variant="default">{c.loyalty_points ?? 0} pts</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (
        <Badge variant={c.user?.status === 'active' ? 'success' : 'destructive'}>
          {c.user?.status ?? 'active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (c) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/customers/${c.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate(c.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description={`${data?.meta.total ?? 0} total customers`} />
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
        searchPlaceholder="Search customers…"
      />
    </div>
  )
}
