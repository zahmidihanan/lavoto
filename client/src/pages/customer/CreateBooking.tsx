import React, { useState, useEffect, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { addDays, format } from 'date-fns'
import { ArrowLeft, Tag, X, CalendarX, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/shared/DatePicker'
import { cn } from '@/utils/cn'
import { servicesApi, vehiclesApi, stationsApi, bookingsApi, couponsApi } from '@/api/services'

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMins = 8 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const label = `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  return { label, value }
})

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

  const stationId = watch('station_id')
  const bookingDate = watch('booking_date')

  const dateRange = useMemo(() => {
    const from = format(new Date(), 'yyyy-MM-dd')
    const to = format(addDays(new Date(), 60), 'yyyy-MM-dd')
    return { from, to }
  }, [])

  const { data: fullyBookedData } = useQuery({
    queryKey: ['fully-booked-dates', stationId, dateRange],
    queryFn: () =>
      bookingsApi.fullyBookedDates({ station_id: Number(stationId), from: dateRange.from, to: dateRange.to }).then((r) => r.data.data),
    enabled: !!stationId,
  })

  const fullyBookedDates = useMemo(() => {
    return (fullyBookedData?.fully_booked_dates ?? []).map((d) => {
      const dt = new Date(d + 'T00:00:00')
      return dt
    })
  }, [fullyBookedData])

  const { data: availability } = useQuery({
    queryKey: ['booking-availability', stationId, bookingDate],
    queryFn: () =>
      bookingsApi.availability({ date: bookingDate, station_id: Number(stationId) }).then((r) => r.data.data),
    enabled: !!bookingDate && !!stationId,
  })

  const fullSlots = new Set(availability?.full_slots ?? [])
  const allFull = fullSlots.size >= TIME_SLOTS.length
  const selectedTime = watch('booking_time')

  useEffect(() => {
    if (allFull && bookingDate) {
      setValue('booking_time', '')
    }
  }, [allFull, bookingDate, setValue])

  useEffect(() => {
    setValue('booking_time', '')
  }, [bookingDate, setValue])

  const validateCoupon = useMutation({
    mutationFn: () => couponsApi.validate(couponInput, basePrice),
    onSuccess: (res) => {
      setDiscount(res.data.data.discount)
      setCouponError('')
      toast.success(`Coupon applied! -MAD ${res.data.data.discount}`)
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
                      {s.name} — MAD {s.price} ({s.duration_minutes} min)
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
                <input type="hidden" {...register('booking_date')} />
                <DatePicker
                  value={bookingDate ? new Date(bookingDate + 'T00:00:00') : undefined}
                  onChange={(d) => setValue('booking_date', d ? format(d, 'yyyy-MM-dd') : '')}
                  disabledDates={fullyBookedDates}
                  placeholder="Choose a date"
                  className={allFull && bookingDate ? 'border-red-400' : ''}
                />
                {errors.booking_date && <p className="text-xs text-destructive mt-1">{errors.booking_date.message}</p>}
              </FormField>
              <FormField label="Time" error={errors.booking_time?.message} required>
                {bookingDate ? (
                  allFull ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <CalendarX className="h-4 w-4 shrink-0" />
                      <span>No time slots available on this date</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      <input type="hidden" {...register('booking_time')} />
                      {TIME_SLOTS.map((t) => {
                        const isFull = fullSlots.has(t.value)
                        return (
                          <button
                            key={t.value}
                            type="button"
                            disabled={isFull}
                            onClick={() => !isFull && setValue('booking_time', t.value)}
                            className={cn(
                              'rounded border py-1.5 text-xs font-medium transition-all flex flex-col items-center gap-0.5',
                              isFull
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : selectedTime === t.value
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'
                            )}
                          >
                            <span>{t.label}</span>
                            {isFull && <span className="text-[10px] font-semibold text-red-400">Full</span>}
                          </button>
                        )
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Select a date first</span>
                  </div>
                )}
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
                  {couponInput} — -MAD {discount}
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
                <span>MAD {basePrice.toFixed(2)}</span>
              </div>
              {discount !== null && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-MAD {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>MAD {finalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" loading={createBooking.isPending} disabled={allFull && !!bookingDate}>
          Confirm Booking
        </Button>
      </form>
    </div>
  )
}
