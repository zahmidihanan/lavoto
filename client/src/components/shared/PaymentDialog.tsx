import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DollarSign } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paymentsApi } from '@/api/services'
import type { Booking } from '@/types'

interface Props {
  booking: Booking
  children?: React.ReactNode
}

export function PaymentDialog({ booking, children }: Props) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<string>('cash')
  const [ref, setRef] = useState('')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      paymentsApi.create({
        booking_id: booking.id,
        payment_method: method,
        transaction_reference: ref || undefined,
      }),
    onSuccess: () => {
      toast.success(`Payment recorded for ${booking.service?.name ?? `booking #${booking.id}`}`)
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['employee-bookings'] })
      qc.invalidateQueries({ queryKey: ['employee-bookings-list'] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setOpen(false)
      setRef('')
      setMethod('cash')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Payment failed')
    },
  })

  const hasPayment = booking.payment?.payment_status === 'paid' || booking.payment?.payment_status === 'refunded'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            disabled={hasPayment}
            title={hasPayment ? 'Payment already recorded' : 'Record payment'}
          >
            <DollarSign className="h-3.5 w-3.5" /> Pay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {booking.service?.name ?? 'Booking'} — MAD {booking.total_amount}
          </DialogDescription>
        </DialogHeader>

        {hasPayment ? (
          <p className="text-sm text-muted-foreground">
            A payment has already been recorded for this booking.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference (optional)</Label>
              <Input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. transaction ID"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {!hasPayment && (
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
