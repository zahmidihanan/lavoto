import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { customersApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/utils/cn'

export function CustomerLoyalty() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [redeemPoints, setRedeemPoints] = useState('')
  const qc = useQueryClient()

  const customerId = user?.customer_id

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty', customerId, page],
    queryFn: () => customersApi.loyalty(customerId!, { page }).then((r) => r.data),
    enabled: !!customerId,
  })

  const redeemMutation = useMutation({
    mutationFn: (points: number) => customersApi.redeem(customerId!, points),
    onSuccess: () => {
      toast.success('Points redeemed successfully!')
      setRedeemPoints('')
      qc.invalidateQueries({ queryKey: ['loyalty'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Redemption failed')
    },
  })

  const earned = data?.data.filter((t) => t.type === 'earned').reduce((s, t) => s + t.points, 0) ?? 0
  const redeemed = data?.data.filter((t) => t.type === 'redeemed').reduce((s, t) => s + Math.abs(t.points), 0) ?? 0
  const balance = earned - redeemed

  return (
    <div className="space-y-6">
      <PageHeader title="Loyalty Points" description="Earn points on every wash, redeem for discounts" />

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Balance" value={`${balance} pts`} icon={<Star className="h-5 w-5" />} color="amber" />
        <StatCard title="Total Earned" value={`${earned} pts`} icon={<TrendingUp className="h-5 w-5" />} color="green" />
        <StatCard title="Total Redeemed" value={`${redeemed} pts`} icon={<TrendingDown className="h-5 w-5" />} color="purple" />
      </div>

      {/* Redeem */}
      <Card>
        <CardHeader><CardTitle>Redeem Points</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-sm">
            <Input
              type="number"
              min="1"
              max={balance}
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              placeholder="Enter points to redeem"
            />
            <Button
              onClick={() => redeemMutation.mutate(Number(redeemPoints))}
              disabled={!redeemPoints || Number(redeemPoints) < 1 || Number(redeemPoints) > balance}
              loading={redeemMutation.isPending}
            >
              Redeem
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">1 point = MAD 0.01 discount on your next booking</p>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 h-14 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No transactions yet</div>
          ) : (
            <div className="divide-y">
              {data?.data.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    t.type === 'earned' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  )}>
                    {t.type === 'earned' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className={cn(
                    'font-bold',
                    t.type === 'earned' ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {t.type === 'earned' ? '+' : ''}{t.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
