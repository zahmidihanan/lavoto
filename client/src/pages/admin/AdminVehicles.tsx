import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { vehiclesApi } from '@/api/services'
import type { Vehicle } from '@/types'

export function AdminVehicles() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', page, search],
    queryFn: () => vehiclesApi.list({ page, search }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => { toast.success('Vehicle deleted'); qc.invalidateQueries({ queryKey: ['vehicles'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const columns: Column<Vehicle>[] = [
    {
      key: 'vehicle', header: 'Vehicle',
      cell: (v) => (
        <div>
          <p className="font-medium">{v.brand} {v.model} ({v.year})</p>
          <p className="text-xs text-muted-foreground font-mono">{v.plate_number}</p>
        </div>
      ),
    },
    { key: 'color', header: 'Color', cell: (v) => v.color ?? '—' },
    {
      key: 'customer', header: 'Owner',
      cell: (v) => v.customer?.user?.name ?? `Customer #${v.customer_id}`,
    },
    {
      key: 'actions', header: '',
      cell: (v) => (
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(v.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicles" description={`${data?.meta.total ?? 0} registered vehicles`} />
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
