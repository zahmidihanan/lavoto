import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  RotateCcw, Pencil, Trash2, Upload, FileText, Plus,
} from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paymentsApi } from '@/api/services'
import type { Payment } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'secondary',
  failed: 'destructive',
}

const methodVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  cash: 'default',
  card: 'secondary',
  transfer: 'outline',
  wallet: 'secondary',
}

export function AdminPayments() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editPayment, setEditPayment] = useState<Payment | null>(null)
  const [editMethod, setEditMethod] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editRef, setEditRef] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search],
    queryFn: () => paymentsApi.list({ page, search }).then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['payments'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const refundMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.refund(id),
    onSuccess: () => { toast.success('Payment refunded'); invalidate() },
    onError: () => toast.error('Refund failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      paymentsApi.update(id, data),
    onSuccess: () => {
      toast.success('Payment updated')
      invalidate()
      setEditOpen(false)
      setEditPayment(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.delete(id),
    onSuccess: () => {
      toast.success('Payment deleted')
      invalidate()
      setDeleteOpen(false)
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => paymentsApi.import(file),
    onSuccess: (res) => {
      const d = res.data.data
      toast.success(`${d.imported} payment(s) imported`)
      if (d.errors.length > 0) {
        d.errors.forEach((e) => toast.error(e))
      }
      invalidate()
    },
    onError: () => toast.error('Import failed'),
  })

  const openEdit = (p: Payment) => {
    setEditPayment(p)
    setEditMethod(p.payment_method)
    setEditStatus(p.payment_status)
    setEditRef(p.transaction_reference ?? '')
    setEditNotes(p.notes ?? '')
    setEditOpen(true)
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const handleExportWord = async () => {
    try {
      const res = await paymentsApi.exportWord()
      const blob = new Blob([res.data], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments_${new Date().toISOString().slice(0, 10)}.doc`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Payments exported to Word')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file)
      e.target.value = ''
    }
  }

  const columns: Column<Payment>[] = [
    {
      key: 'id', header: '#',
      cell: (p) => <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>,
    },
    {
      key: 'booking', header: 'Booking',
      cell: (p) => <span className="font-mono text-xs">#{p.booking_id}</span>,
    },
    {
      key: 'amount', header: 'Amount',
      cell: (p) => <span className="font-bold">MAD {p.amount}</span>,
    },
    {
      key: 'method', header: 'Method',
      cell: (p) => <Badge variant={methodVariant[p.payment_method] ?? 'secondary'} className="capitalize">{p.payment_method}</Badge>,
    },
    {
      key: 'status', header: 'Status',
      cell: (p) => <Badge variant={statusVariant[p.payment_status] ?? 'secondary'}>{p.payment_status}</Badge>,
    },
    {
      key: 'date', header: 'Paid At',
      cell: (p) => p.paid_at?.slice(0, 10) ?? '—',
    },
    {
      key: 'actions', header: '',
      cell: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(p)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={() => openDelete(p.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          {p.payment_status === 'paid' && (
            <Button variant="ghost" size="icon" title="Refund" onClick={() => refundMutation.mutate(p.id)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${data?.meta.total ?? 0} transactions`} />

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
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              loading={importMutation.isPending}
            >
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportWord}>
              <FileText className="h-4 w-4" /> Export Word
            </Button>
          </>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment #{editPayment?.id}</DialogTitle>
            <DialogDescription>
              Booking #{editPayment?.booking_id} — MAD {editPayment?.amount}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={editMethod} onValueChange={setEditMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input value={editRef} onChange={(e) => setEditRef(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                updateMutation.mutate({
                  id: editPayment!.id,
                  data: {
                    payment_method: editMethod,
                    payment_status: editStatus,
                    transaction_reference: editRef || null,
                    notes: editNotes || null,
                  },
                })
              }
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteId!)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
