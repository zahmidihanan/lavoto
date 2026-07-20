import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { couponsApi } from '@/api/services'
import type { Coupon } from '@/types'

const schema = z.object({
  code: z.string().min(2).toUpperCase(),
  type: z.enum(['fixed', 'percentage']),
  value: z.string().min(1),
  min_amount: z.string().optional(),
  max_uses: z.coerce.number().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export function AdminCoupons() {
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', page],
    queryFn: () => couponsApi.list({ page }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { type: 'fixed', is_active: true },
  })

  const isActive = watch('is_active')
  const type = watch('type')

  const openCreate = () => { setEditing(null); reset({ type: 'fixed', is_active: true }); setOpen(true) }
  const openEdit = (c: Coupon) => {
    setEditing(c)
    reset({
      code: c.code,
      type: c.type,
      value: c.value,
      min_amount: c.min_amount,
      max_uses: c.max_uses,
      expires_at: c.expires_at?.slice(0, 10),
      is_active: c.is_active,
    })
    setOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (d: FormData) =>
      editing ? couponsApi.update(editing.id, d) : couponsApi.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Coupon updated' : 'Coupon created')
      qc.invalidateQueries({ queryKey: ['coupons'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to save coupon'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponsApi.delete(id),
    onSuccess: () => { toast.success('Coupon deleted'); qc.invalidateQueries({ queryKey: ['coupons'] }) },
  })

  const columns: Column<Coupon>[] = [
    {
      key: 'code', header: 'Code',
      cell: (c) => <span className="font-mono font-bold text-sm">{c.code}</span>,
    },
    {
      key: 'type', header: 'Discount',
      cell: (c) => (
        <span className="font-semibold">
          {c.type === 'percentage' ? `${c.value}%` : `MAD ${c.value}`}
        </span>
      ),
    },
    {
      key: 'usage', header: 'Usage',
      cell: (c) => (
        <span className="text-muted-foreground text-sm">
          {c.used_count} / {c.max_uses ?? '∞'}
        </span>
      ),
    },
    {
      key: 'expires', header: 'Expires',
      cell: (c) => c.expires_at ? c.expires_at.slice(0, 10) : <span className="text-muted-foreground">Never</span>,
    },
    {
      key: 'status', header: 'Status',
      cell: (c) => <Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions', header: '',
      cell: (c) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Manage discount codes"
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />New Coupon</Button>}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        total={data?.meta.total}
        page={page}
        lastPage={data?.meta.last_page}
        onPageChange={setPage}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Code" error={errors.code?.message} required>
                <Input {...register('code')} className="uppercase" />
              </FormField>
              <FormField label="Type" error={errors.type?.message} required>
                <Select value={type} onValueChange={(v) => setValue('type', v as 'fixed' | 'percentage')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed (MAD)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={type === 'percentage' ? 'Value (%)' : 'Value (MAD)'} error={errors.value?.message} required>
                <Input type="number" step="0.01" {...register('value')} />
              </FormField>
              <FormField label="Min Amount (MAD)" error={errors.min_amount?.message}>
                <Input type="number" step="0.01" {...register('min_amount')} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Max Uses" error={errors.max_uses?.message}>
                <Input type="number" {...register('max_uses')} />
              </FormField>
              <FormField label="Expires At" error={errors.expires_at?.message}>
                <Input type="date" {...register('expires_at')} />
              </FormField>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={(v) => setValue('is_active', v)} id="coupon_active" />
              <Label htmlFor="coupon_active">Active</Label>
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
