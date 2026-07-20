import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Eye, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { bookingsApi, customersApi, servicesApi, stationsApi, vehiclesApi } from '@/api/services'
import type { Booking, BookingStatus } from '@/types'

const STATUSES: BookingStatus[] = ['pending','confirmed','assigned','in_progress','quality_check','completed','cancelled']

const schema = z.object({
  customer_id: z.coerce.number().min(1, 'Select a customer'),
  vehicle_id: z.coerce.number().min(1, 'Select a vehicle'),
  service_id: z.coerce.number().min(1, 'Select a service'),
  station_id: z.coerce.number().min(1, 'Select a station'),
  booking_date: z.string().min(1, 'Choose a date'),
  booking_time: z.string().min(1, 'Choose a time'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function AdminBookings() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusDialog, setStatusDialog] = useState<{ booking: Booking; newStatus: BookingStatus } | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, search],
    queryFn: () => bookingsApi.list({ page, search }).then((r) => r.data),
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customersApi.list({ per_page: 200 }).then((r) => r.data),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services-all'],
    queryFn: () => servicesApi.list({ per_page: 100 }).then((r) => r.data),
  })

  const { data: stationsData } = useQuery({
    queryKey: ['stations-all'],
    queryFn: () => stationsApi.list({ per_page: 100 }).then((r) => r.data),
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  })

  const selectedCustomerId = watch('customer_id')

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles-by-customer', selectedCustomerId],
    queryFn: () => vehiclesApi.list({ customer_id: selectedCustomerId, per_page: 100 }).then((r) => r.data),
    enabled: !!selectedCustomerId,
  })

  const customers = customersData?.data ?? []
  const services = servicesData?.data ?? []
  const stations = stationsData?.data ?? []
  const vehicles = vehiclesData?.data ?? []

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('Booking status updated')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setStatusDialog(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Invalid status transition')
    },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      bookingsApi.create(d as Record<string, unknown>),
    onSuccess: () => {
      toast.success('Booking created')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setCreateOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create booking')
    },
  })

  const columns: Column<Booking>[] = [
    {
      key: 'id', header: '#',
      cell: (b) => <span className="text-muted-foreground font-mono text-xs">#{b.id}</span>,
    },
    {
      key: 'customer', header: 'Customer',
      cell: (b) => (
        <div>
          <p className="font-medium">{b.customer?.user?.name ?? `Customer #${b.customer_id}`}</p>
          <p className="text-xs text-muted-foreground">{b.service?.name}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date', cell: (b) => `${b.booking_date} ${b.booking_time}` },
    { key: 'station', header: 'Station', cell: (b) => b.station?.name ?? '—' },
    { key: 'status', header: 'Status', cell: (b) => <BookingStatusBadge status={b.status} /> },
    {
      key: 'amount', header: 'Amount',
      cell: (b) => <span className="font-semibold">MAD {b.total_amount}</span>,
    },
    {
      key: 'actions', header: '',
      cell: (b) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/bookings/${b.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={`${data?.meta.total ?? 0} total bookings`}
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" />New Booking</Button>}
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
        searchPlaceholder="Search bookings…"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <FormField label="Customer" error={errors.customer_id?.message} required>
              <Select
                value={selectedCustomerId ? String(selectedCustomerId) : ''}
                onValueChange={(v) => {
                  setValue('customer_id', Number(v), { shouldValidate: true })
                  setValue('vehicle_id', 0 as unknown as number)
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.user?.name ?? `Customer #${c.id}`} — {c.user?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Vehicle" error={errors.vehicle_id?.message} required>
              <Select
                value={watch('vehicle_id') ? String(watch('vehicle_id')) : ''}
                onValueChange={(v) => setValue('vehicle_id', Number(v), { shouldValidate: true })}
                disabled={!selectedCustomerId}
              >
                <SelectTrigger><SelectValue placeholder={selectedCustomerId ? 'Select a vehicle' : 'Select a customer first'} /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.brand} {v.model} — {v.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Service" error={errors.service_id?.message} required>
                <Select
                  value={watch('service_id') ? String(watch('service_id')) : ''}
                  onValueChange={(v) => setValue('service_id', Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — MAD {s.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Station" error={errors.station_id?.message} required>
                <Select
                  value={watch('station_id') ? String(watch('station_id')) : ''}
                  onValueChange={(v) => setValue('station_id', Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" error={errors.booking_date?.message} required>
                <Input {...register('booking_date')} type="date" />
              </FormField>
              <FormField label="Time" error={errors.booking_time?.message} required>
                <Input {...register('booking_time')} type="time" />
              </FormField>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <Textarea {...register('notes')} rows={3} placeholder="Optional notes…" />
            </FormField>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending}>Create Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
