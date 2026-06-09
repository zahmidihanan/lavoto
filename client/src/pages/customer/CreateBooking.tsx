import React, { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Tag, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { servicesApi, vehiclesApi, stationsApi, bookingsApi, couponsApi } from '@/api/services'

const schema = z.object({
  vehicle_id: z.coerce.number().min(1, 'Select a vehicle'),
  service_id: z.coerce.number().min(1, 'Select a service'),
  station_id: z.coerce.number().min(1, 'Select a station'),
  booking_date: z.string().min(1, 'Choose a date'),
  booking_time: z.string().min(1, 'Choose a time'),
  notes: z.string().optional(),
  coupon_code: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function CreateBooking() {
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [discount, setDiscount] = useState<number | null>(null)
  const [couponError, setCouponError] = useState('')

  const { data: vehiclesData } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  })
  const { data: services } = useQuery({
    queryKey: ['services-active'],
    queryFn: () => servicesApi.active().then((r) => r.data.data),
  })
  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsApi.list({ per_page: 100 }).then((r) => r.data.data),
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  })

  const serviceId = watch('service_id')
  const selectedService = services?.find((s) => s.id === Number(serviceId))
  const basePrice = parseFloat(selectedService?.price ?? '0')
  const finalPrice = discount !== null ? Math.max(0, basePrice - discount) : basePrice

  const validateCoupon = useMutation({
    mutationFn: () => couponsApi.validate(couponInput, basePrice),
    onSuccess: (res) => {
      setDiscount(res.data.data.discount)
      setCouponError('')
      toast.success(`Coupon applied! -$${res.data.data.discount}`)
    },
    onError: () => {
      setCouponError('Invalid or inapplicable coupon')
      setDiscount(null)
    },
  })

  const createBooking = useMutation({
    mutationFn: (d: FormData) =>
      bookingsApi.create({ ...(d as Record<string, unknown>), coupon_code: discount !== null ? couponInput : undefined }),
    onSuccess: () => {
      toast.success('Booking created successfully!')
      navigate('/customer/bookings')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create booking')
    },
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Book a Car Wash" description="Schedule your next service" />
      </div>

      <form onSubmit={handleSubmit((d) => createBooking.mutate(d as FormData))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Vehicle" error={errors.vehicle_id?.message} required>
              <Select onValueChange={(v) => setValue('vehicle_id', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select your vehicle" /></SelectTrigger>
                <SelectContent>
                  {(vehiclesData?.data ?? []).map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.brand} {v.model} — {v.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Service" error={errors.service_id?.message} required>
              <Select onValueChange={(v) => setValue('service_id', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choose a service" /></SelectTrigger>
                <SelectContent>
                  {(services ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — ${s.price} ({s.duration_minutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Station" error={errors.station_id?.message} required>
              <Select onValueChange={(v) => setValue('station_id', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choose a location" /></SelectTrigger>
                <SelectContent>
                  {(stations ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — {s.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" error={errors.booking_date?.message} required>
                <Input type="date" min={today} {...register('booking_date')} />
              </FormField>
              <FormField label="Time" error={errors.booking_time?.message} required>
                <Input type="time" {...register('booking_time')} />
              </FormField>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <Textarea placeholder="Any special instructions…" {...register('notes')} rows={2} />
            </FormField>
          </CardContent>
        </Card>

        {/* Coupon */}
        <Card>
          <CardHeader><CardTitle>Coupon Code</CardTitle></CardHeader>
          <CardContent>
            {discount !== null ? (
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1.5 py-1.5 px-3">
                  <Tag className="h-3.5 w-3.5" />
                  {couponInput} — -${discount}
                </Badge>
                <button
                  type="button"
                  onClick={() => { setDiscount(null); setCouponInput('') }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => validateCoupon.mutate()}
                  disabled={!couponInput || !selectedService}
                  loading={validateCoupon.isPending}
                >
                  Apply
                </Button>
              </div>
            )}
            {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedService && (
          <Card className="bg-muted/30">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {discount !== null && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>${finalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" loading={createBooking.isPending}>
          Confirm Booking
        </Button>
      </form>
    </div>
  )
}
