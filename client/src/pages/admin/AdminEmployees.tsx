import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { employeesApi } from '@/api/services'
import type { Employee } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  employee_code: z.string().min(1),
  hire_date: z.string(),
  salary: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function AdminEmployees() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search],
    queryFn: () => employeesApi.list({ page, search }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openCreate = () => { setEditing(null); reset({}); setOpen(true) }
  const openEdit = (e: Employee) => {
    setEditing(e)
    reset({
      name: e.user?.name,
      email: e.user?.email,
      phone: e.user?.phone,
      employee_code: e.employee_code,
      hire_date: e.hire_date,
      salary: e.salary,
    })
    setOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (d: FormData) =>
      editing
        ? employeesApi.update(editing.id, d)
        : employeesApi.create({ ...d, role: 'employee' }),
    onSuccess: () => {
      toast.success(editing ? 'Employee updated' : 'Employee created')
      qc.invalidateQueries({ queryKey: ['employees'] })
      setOpen(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to save employee')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => { toast.success('Employee deleted'); qc.invalidateQueries({ queryKey: ['employees'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      cell: (e) => (
        <div>
          <p className="font-medium">{e.user?.name}</p>
          <p className="text-xs text-muted-foreground">{e.employee_code}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', cell: (e) => <span className="text-muted-foreground">{e.user?.email}</span> },
    { key: 'station', header: 'Station', cell: (e) => e.station?.name ?? <span className="text-muted-foreground">—</span> },
    { key: 'hire_date', header: 'Hire Date', cell: (e) => e.hire_date },
    {
      key: 'actions', header: '',
      cell: (e) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(e.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${data?.meta.total ?? 0} team members`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Add Employee</Button>}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name" error={errors.name?.message} required>
                <Input {...register('name')} />
              </FormField>
              <FormField label="Employee Code" error={errors.employee_code?.message} required>
                <Input {...register('employee_code')} />
              </FormField>
            </div>
            <FormField label="Email" error={errors.email?.message} required>
              <Input type="email" {...register('email')} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" error={errors.phone?.message}>
                <Input {...register('phone')} />
              </FormField>
              <FormField label="Hire Date" error={errors.hire_date?.message} required>
                <Input type="date" {...register('hire_date')} />
              </FormField>
            </div>
            <FormField label="Salary" error={errors.salary?.message}>
              <Input type="number" step="0.01" {...register('salary')} />
            </FormField>
            {!editing && (
              <FormField label="Password" error={errors.password?.message} required>
                <Input type="password" {...register('password')} />
              </FormField>
            )}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
