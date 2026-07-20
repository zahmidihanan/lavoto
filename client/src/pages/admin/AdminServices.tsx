import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Clock, X } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { servicesApi } from '@/api/services'
import type { Service } from '@/types'

const CATEGORIES = [
  { value: 'full', label: 'Full Wash' },
  { value: 'interior', label: 'Interior Detail' },
  { value: 'exterior', label: 'Exterior Wash' },
  { value: 'premium', label: 'Premium Service' },
] as const

const categorySchema = z.enum(['full', 'interior', 'exterior', 'premium']).optional()

const schema = z.object({
  name: z.string().min(2),
  category: categorySchema,
  description: z.string().optional(),
  price: z.string().min(1),
  duration_minutes: z.coerce.number().min(1),
  options: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export function AdminServices() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['services', page, search],
    queryFn: () => servicesApi.list({ page, search }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { is_active: true, options: [] },
  })

  const isActive = watch('is_active')
  const options = watch('options') ?? []

  const addOption = () => setValue('options', [...options, ''], { shouldValidate: true })
  const removeOption = (i: number) => setValue('options', options.filter((_, idx) => idx !== i), { shouldValidate: true })

  const openCreate = () => { setEditing(null); reset({ is_active: true, options: [] }); setOpen(true) }
  const openEdit = (s: Service) => {
    setEditing(s)
    reset({
      name: s.name,
      category: s.category ?? undefined,
      description: s.description,
      price: s.price,
      duration_minutes: s.duration_minutes,
      options: s.options ?? [],
      is_active: s.is_active,
    } as FormData)
    setOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (d: FormData) =>
      editing ? servicesApi.update(editing.id, d) : servicesApi.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Service updated' : 'Service created')
      qc.invalidateQueries({ queryKey: ['services'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to save service'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => { toast.success('Service deleted'); qc.invalidateQueries({ queryKey: ['services'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const columns: Column<Service>[] = [
    {
      key: 'name', header: 'Service',
      cell: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'category', header: 'Pack',
      cell: (s) => s.category ? (
        <Badge variant="outline" className="capitalize">{s.category}</Badge>
      ) : null,
    },
    {
      key: 'price', header: 'Price',
      cell: (s) => (
        <div className="flex items-center gap-1 font-semibold">
          <span className="text-emerald-600">MAD</span>
          {s.price}
        </div>
      ),
    },
    {
      key: 'duration', header: 'Duration',
      cell: (s) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {s.duration_minutes} min
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      cell: (s) => <Badge variant={s.is_active ? 'success' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>,
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
        title="Services"
        description="Manage your car wash service catalog"
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />New Service</Button>}
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
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'New Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))} className="space-y-4">
            <FormField label="Service Name" error={errors.name?.message} required>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Pack Category" error={errors.category?.message}>
              <Select
                value={watch('category') ?? 'none'}
                onValueChange={(v) => setValue('category', v === 'none' ? undefined : v as Service['category'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a pack category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No pack</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Description" error={errors.description?.message}>
              <Textarea {...register('description')} rows={2} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price (MAD)" error={errors.price?.message} required>
                <Input type="number" step="0.01" {...register('price')} />
              </FormField>
              <FormField label="Duration (min)" error={errors.duration_minutes?.message} required>
                <Input type="number" {...register('duration_minutes')} />
              </FormField>
            </div>
            <div className="space-y-2">
              <Label>Service Options / Features</Label>
              {options.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={options[i]}
                    onChange={(e) => {
                      const next = [...options]
                      next[i] = e.target.value
                      setValue('options', next, { shouldValidate: true })
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeOption(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                + Add option
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue('is_active', v)}
                id="is_active"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {editing ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
