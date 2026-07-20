import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { vehiclesApi } from '@/api/services'
import type { Vehicle } from '@/types'

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  plate_number: z.string().min(2),
})
type FormData = z.infer<typeof schema>

export function CustomerVehicles() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  })

  const openCreate = () => { setEditing(null); reset({}); setOpen(true) }
  const openEdit = (v: Vehicle) => {
    setEditing(v)
    reset({ brand: v.brand, model: v.model, year: v.year, color: v.color, plate_number: v.plate_number })
    setOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (d: FormData) =>
      editing ? vehiclesApi.update(editing.id, d) : vehiclesApi.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Vehicle updated' : 'Vehicle added')
      qc.invalidateQueries({ queryKey: ['my-vehicles'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to save vehicle'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => { toast.success('Vehicle removed'); qc.invalidateQueries({ queryKey: ['my-vehicles'] }) },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Vehicles"
        description={`${data?.meta.total ?? 0} registered vehicles`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Add Vehicle</Button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No vehicles yet</p>
            <Button onClick={openCreate}>Add your first vehicle</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.data.map((v) => (
            <Card key={v.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-bold text-lg">{v.brand} {v.model}</p>
                <p className="text-muted-foreground text-sm">{v.year} · {v.color ?? 'No color'}</p>
                <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-mono font-semibold">
                  {v.plate_number}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d as FormData))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Brand" error={errors.brand?.message} required>
                <Input {...register('brand')} placeholder="Toyota" />
              </FormField>
              <FormField label="Model" error={errors.model?.message} required>
                <Input {...register('model')} placeholder="Camry" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Year" error={errors.year?.message} required>
                <Input type="number" {...register('year')} placeholder="2022" />
              </FormField>
              <FormField label="Color" error={errors.color?.message}>
                <Input {...register('color')} placeholder="White" />
              </FormField>
            </div>
            <FormField label="Plate Number" error={errors.plate_number?.message} required>
              <Input {...register('plate_number')} placeholder="ABC-123" className="uppercase" />
            </FormField>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save' : 'Add Vehicle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
