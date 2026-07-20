import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types'

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' }> = {
  pending:       { label: 'Pending',       variant: 'warning' },
  confirmed:     { label: 'Confirmed',     variant: 'default' },
  assigned:      { label: 'Assigned',      variant: 'secondary' },
  in_progress:   { label: 'In Progress',   variant: 'default' },
  quality_check: { label: 'Quality Check', variant: 'warning' },
  completed:     { label: 'Completed',     variant: 'success' },
  cancelled:     { label: 'Cancelled',     variant: 'destructive' },
}

interface Props { status: BookingStatus }

export function BookingStatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
