import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { stationsApi } from '@/api/services'
import type { Station } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})
type FormData = z.infer<typeof schema>

export function AdminStations() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Station | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['stations', page, search],
    queryFn: () => stationsApi.list({ page, search }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { status: 'active' },
  })

  const statusVal = watch('status')

  const openCreate = () => { setEditing(null); reset({ status: 'active' }); setOpen(true) }
  const openEdit = (s: Station) => {
    setEditing(s)
    reset({ name: s.name, address: s.address, city: s.city, phone: s.phone, status: s.status })
    setOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (d: FormData) =>
      editing ? stationsApi.update(editing.id, d) : stationsApi.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Station updated' : 'Station created')
      qc.invalidateQueries({ queryKey: ['stations'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to save station'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => stationsApi.delete(id),
    onSuccess: () => { toast.success('Station deleted'); qc.invalidateQueries({ queryKey: ['stations'] }) },
  })

  const columns: Column<Station>[] = [
    {
      key: 'name', header: 'Station',
      cell: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {s.city}
          </div>
        </div>
      ),
    },
    { key: 'address', header: 'Address', cell: (s) => <span className="text-muted-foreground">{s.address}</span> },
    { key: 'phone', header: 'Phone', cell: (s) => s.phone ?? '—' },
    {
      key: 'status', header: 'Status',
      cell: (s) => <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>,
    },
    {
      key: 'actions', header: '',
      cell: (s) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stations"
        description="Manage car wash locations"
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />New Station</Button>}
      />

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Station' : 'New Station'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))} className="space-y-4">
            <FormField label="Name" error={errors.name?.message} required>
              <Input {...register('name')} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" error={errors.city?.message} required>
                <Input {...register('city')} />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input {...register('phone')} />
              </FormField>
            </div>
            <FormField label="Address" error={errors.address?.message} required>
              <Input {...register('address')} />
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <Select value={statusVal} onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
