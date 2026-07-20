import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { customersApi } from '@/api/services'
import type { Customer } from '@/types'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function AdminCustomers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, search, per_page: 15 }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => customersApi.create(d as Record<string, unknown>),
    onSuccess: () => {
      toast.success('Customer created')
      qc.invalidateQueries({ queryKey: ['customers'] })
      setOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create customer')
    },
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
      <PageHeader
        title="Customers"
        description={`${data?.meta.total ?? 0} total customers`}
        actions={<Button onClick={() => { reset(); setOpen(true) }}><Plus className="h-4 w-4 mr-1" />New Customer</Button>}
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
        searchPlaceholder="Search customers…"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <FormField label="Name" error={errors.name?.message} required>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message} required>
              <Input {...register('email')} type="email" />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Password" error={errors.password?.message} required>
              <Input {...register('password')} type="password" />
            </FormField>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
