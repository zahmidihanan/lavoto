import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, UserCheck, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { FormField } from '@/components/shared/FormField'
import { bookingsApi, employeesApi } from '@/api/services'
import type { BookingStatus } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  pending:       ['confirmed', 'cancelled'],
  confirmed:     ['assigned', 'cancelled'],
  assigned:      ['in_progress', 'cancelled'],
  in_progress:   ['quality_check', 'cancelled'],
  quality_check: ['completed', 'cancelled'],
  completed:     [],
  cancelled:     [],
}

export function AdminBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [assignDialog, setAssignDialog] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.get(Number(id)).then((r) => r.data.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-available'],
    queryFn: () => employeesApi.available().then((r) => r.data.data),
    enabled: assignDialog,
  })

  const updateStatus = useMutation({
    mutationFn: (status: BookingStatus) =>
      bookingsApi.updateStatus(Number(id), { status }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['booking', id] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Invalid transition')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(Number(id), cancelReason),
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['booking', id] })
      setCancelDialog(false)
    },
  })

  const assignMutation = useMutation({
    mutationFn: () => bookingsApi.assignEmployees(Number(id), selectedEmployees),
    onSuccess: () => {
      toast.success('Employees assigned')
      qc.invalidateQueries({ queryKey: ['booking', id] })
      setAssignDialog(false)
    },
  })

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted" />)}</div>
  }

  if (!booking) return <div className="text-center py-20 text-muted-foreground">Booking not found</div>

  const nextStatuses = NEXT_STATUSES[booking.status] ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
          <p className="text-muted-foreground text-sm">Created {booking.created_at?.slice(0, 10)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive"
              onClick={() => setCancelDialog(true)}
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <Button size="sm" onClick={() => setAssignDialog(true)}>
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              Assign Employees
            </Button>
          )}
          {nextStatuses.filter((s) => s !== 'cancelled').map((s) => (
            <Button
              key={s}
              size="sm"
              onClick={() => updateStatus.mutate(s)}
              loading={updateStatus.isPending}
            >
              Move to {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Customer & Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{booking.customer?.user?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{booking.customer?.user?.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">
                {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.year})` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plate</span>
              <span className="font-mono">{booking.vehicle?.plate_number ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Service & Payment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{booking.service?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Station</span>
              <span>{booking.station?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-base">${booking.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-emerald-600">-${booking.discount_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant={booking.payment?.payment_status === 'paid' ? 'success' : 'warning'}>
                {booking.payment?.payment_status ?? 'Unpaid'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {booking.employees && booking.employees.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Assigned Employees</CardTitle></CardHeader>
            <CardContent>
              {booking.employees.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="font-medium">{e.user?.name}</span>
                  <span className="text-muted-foreground">({e.employee_code})</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {booking.notes && (
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{booking.notes}</p></CardContent>
          </Card>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
          <FormField label="Reason (optional)">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation…"
            />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>Keep Booking</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign employees dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Employees</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(employees ?? []).map((e) => (
              <label key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(e.id)}
                  onChange={(ev) =>
                    setSelectedEmployees(
                      ev.target.checked
                        ? [...selectedEmployees, e.id]
                        : selectedEmployees.filter((x) => x !== e.id)
                    )
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">{e.user?.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{e.employee_code}</span>
              </label>
            ))}
            {!employees?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">No available employees</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button
              onClick={() => assignMutation.mutate()}
              loading={assignMutation.isPending}
              disabled={selectedEmployees.length === 0}
            >
              Assign {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
