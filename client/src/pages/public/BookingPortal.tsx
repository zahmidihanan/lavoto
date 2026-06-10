import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  CheckCircle2, Clock, MapPin, Car, ChevronRight, ChevronLeft,
  Droplets, Calendar, User, Phone, Mail, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { publicApi, type PublicBookingPayload } from '@/api/services'
import type { Service, Station } from '@/types'
import { cn } from '@/utils/cn'

// ─── Step 3 form schema ───────────────────────────────────────────────────────

const schema = z.object({
  name:         z.string().min(2, 'Full name required'),
  email:        z.string().email('Valid email required'),
  phone:        z.string().optional(),
  brand:        z.string().min(1, 'Vehicle brand required'),
  model:        z.string().min(1, 'Vehicle model required'),
  year:         z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1, 'Invalid year'),
  color:        z.string().optional(),
  plate_number: z.string().min(1, 'Plate number required'),
  notes:        z.string().optional(),
})
type FormData = z.infer<typeof schema>

// ─── Time slot grid ───────────────────────────────────────────────────────────

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMins = 8 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const label = `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  return { label, value }
})

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Service', 'Date & Station', 'Your Info']
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                done   ? 'bg-blue-600 text-white' :
                active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                         'bg-gray-100 text-gray-400'
              )}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400'
              )}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 mx-2 mb-5 transition-colors',
                done ? 'bg-blue-600' : 'bg-gray-200'
              )} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, selected, onClick }: {
  service: Service
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border-2 p-5 transition-all hover:shadow-md',
        selected
          ? 'border-blue-600 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={cn('h-4 w-4', selected ? 'text-blue-600' : 'text-gray-400')} />
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
          </div>
          {service.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{service.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {service.duration_minutes} min
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-2xl font-bold', selected ? 'text-blue-600' : 'text-gray-900')}>
            ${parseFloat(service.price).toFixed(0)}
          </p>
          <p className="text-xs text-gray-400">per wash</p>
        </div>
      </div>
      {selected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selected
          </span>
        </div>
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 'success'

interface BookingResult {
  booking_id: number
  booking_date: string
  booking_time: string
  company_name: string
  service_name: string
  total_amount: string
}

export function BookingPortal() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [result, setResult] = useState<BookingResult | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  })

  const { data: company, isLoading: loadingCompany, isError: companyError } = useQuery({
    queryKey: ['public-company', slug],
    queryFn: () => publicApi.company(slug!).then((r) => r.data.data),
    enabled: !!slug,
    retry: false,
  })

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['public-services', slug],
    queryFn: () => publicApi.services(slug!).then((r) => r.data.data),
    enabled: !!slug,
  })

  const { data: stations, isLoading: loadingStations } = useQuery({
    queryKey: ['public-stations', slug],
    queryFn: () => publicApi.stations(slug!).then((r) => r.data.data),
    enabled: !!slug,
  })

  const bookMutation = useMutation({
    mutationFn: (info: FormData) => {
      const payload: PublicBookingPayload = {
        name:         info.name,
        email:        info.email,
        phone:        info.phone || undefined,
        brand:        info.brand,
        model:        info.model,
        year:         Number(info.year),
        color:        info.color || undefined,
        plate_number: info.plate_number,
        notes:        info.notes || undefined,
        service_id:   selectedService!.id,
        station_id:   selectedStation!.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
      }
      console.debug('[BookingPortal] submitting payload', payload)
      return publicApi.book(slug!, payload)
    },
    onSuccess: (res) => {
      setResult(res.data.data as BookingResult)
      setStep('success')
    },
    onError: (err: unknown) => {
      type ApiErr = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const data = (err as ApiErr)?.response?.data
      if (data?.errors) {
        const firstField = Object.values(data.errors)[0]
        toast.error(firstField?.[0] ?? data?.message ?? 'Booking failed')
      } else {
        toast.error(data?.message ?? 'Booking failed. Please try again.')
      }
      console.error('[BookingPortal] API error', data)
    },
  })

  const today = new Date().toISOString().split('T')[0]

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (loadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <Droplets className="h-10 w-10 text-blue-500 animate-pulse" />
          <p className="text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm">
          <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
          <p className="text-gray-500 mb-6">This car wash booking page doesn't exist or is unavailable.</p>
          <Button onClick={() => navigate('/')} variant="outline">Go Home</Button>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (step === 'success' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">We'll see you soon at {result.company_name}</p>

          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Booking #</span>
              <span className="font-semibold">#{result.booking_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold">{result.service_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold">{result.booking_date.slice(0, 10)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-semibold">{result.booking_time}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-blue-600 text-base">${parseFloat(result.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">A confirmation will be sent to your email.</p>
        </div>
      </div>
    )
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{company.name}</h1>
            <p className="text-xs text-gray-400">Car Wash Booking</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        {step !== 'success' && (
          <div className="mb-8">
            <StepBar current={step as 1 | 2 | 3} />
          </div>
        )}

        {/* ── Step 1: Service ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Choose a Service</h2>
              <p className="text-sm text-gray-500 mt-1">Select the type of wash you'd like</p>
            </div>

            {loadingServices ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-white animate-pulse border border-gray-200" />
                ))}
              </div>
            ) : (services ?? []).length === 0 ? (
              <div className="text-center py-12 text-gray-400">No services available at the moment.</div>
            ) : (
              <div className="space-y-3">
                {(services ?? []).map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    selected={selectedService?.id === s.id}
                    onClick={() => setSelectedService(s)}
                  />
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedService}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Station + Date/Time ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pick a Location & Time</h2>
              <p className="text-sm text-gray-500 mt-1">Choose where and when you'd like your wash</p>
            </div>

            {/* Summary of selected service */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{selectedService?.name}</span>
              </div>
              <span className="font-bold text-blue-600">${parseFloat(selectedService?.price ?? '0').toFixed(2)}</span>
            </div>

            {/* Station */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" /> Station
              </p>
              {loadingStations ? (
                <div className="h-20 rounded-xl bg-white animate-pulse border border-gray-200" />
              ) : (
                <div className="space-y-2">
                  {(stations ?? []).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={cn(
                        'w-full text-left rounded-xl border-2 p-4 transition-all',
                        selectedStation?.id === st.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      )}
                    >
                      <p className="font-semibold text-gray-900">{st.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {st.address}, {st.city}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Date
              </p>
              <Input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" /> Time
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSelectedTime(t.value)}
                      className={cn(
                        'rounded-lg border py-2 text-xs font-medium transition-all',
                        selectedTime === t.value
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedStation || !selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Personal Info + Vehicle ─────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit((data) => bookMutation.mutate(data as FormData))} className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Information</h2>
              <p className="text-sm text-gray-500 mt-1">Tell us who you are and which car to wash</p>
            </div>

            {/* Booking summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Station</span>
                <span className="font-medium">{selectedStation?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium">{selectedDate} at {selectedTime}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span className="text-blue-600">${parseFloat(selectedService?.price ?? '0').toFixed(2)}</span>
              </div>
            </div>

            {/* Personal info */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" /> Personal Details
              </h3>
              <FormField label="Full Name" error={errors.name?.message} required>
                <Input placeholder="John Doe" {...register('name')} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Email" error={errors.email?.message} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="you@email.com" type="email" {...register('email')} />
                  </div>
                </FormField>
                <FormField label="Phone" error={errors.phone?.message}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="+1 555 0000" {...register('phone')} />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" /> Vehicle Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Brand" error={errors.brand?.message} required>
                  <Input placeholder="Toyota" {...register('brand')} />
                </FormField>
                <FormField label="Model" error={errors.model?.message} required>
                  <Input placeholder="Corolla" {...register('model')} />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Year" error={errors.year?.message} required>
                  <Input type="number" placeholder="2020" {...register('year')} />
                </FormField>
                <FormField label="Color" error={errors.color?.message}>
                  <Input placeholder="White" {...register('color')} />
                </FormField>
                <FormField label="Plate" error={errors.plate_number?.message} required>
                  <Input placeholder="AB-123-CD" className="uppercase" {...register('plate_number')} />
                </FormField>
              </div>
            </div>

            {/* Notes */}
            <FormField label="Special Instructions" error={errors.notes?.message}>
              <Textarea
                placeholder="Any special requests or notes for our team…"
                rows={2}
                {...register('notes')}
              />
            </FormField>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button type="submit" className="flex-1" size="lg" loading={bookMutation.isPending}>
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
