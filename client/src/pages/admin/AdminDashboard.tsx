import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, Users, CalendarCheck, CheckCircle, TrendingUp,
  Link2, Copy, CheckCheck,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dashboardApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'
import type { BookingStatus } from '@/types'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  assigned: '#8b5cf6',
  in_progress: '#06b6d4',
  quality_check: '#f97316',
  completed: '#10b981',
  cancelled: '#ef4444',
}

function ShareableLinkCard() {
  const { user } = useAuthStore()
  const slug = user?.company?.slug
  const [copied, setCopied] = useState(false)

  if (!slug) return null

  const bookingUrl = `${window.location.origin}/book/${slug}`

  const copy = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50">
      <CardContent className="py-4 px-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-blue-700 mb-0.5">Your Customer Booking Link</p>
              <p className="text-sm font-mono text-blue-900 truncate">{bookingUrl}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" onClick={copy}>
              {copied ? <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(bookingUrl, '_blank')}>
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.get(period).then((r) => r.data.data),
  })

  const pieData = data
    ? Object.entries(data.bookings_by_status)
        .filter(([, count]) => (count as number) > 0)
        .map(([status, count]) => ({
          name: status.replace('_', ' '),
          value: count as number,
          color: STATUS_COLORS[status as BookingStatus],
        }))
    : []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your car wash operations"
        actions={
          <div className="flex rounded-lg border overflow-hidden">
            {PERIOD_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setPeriod(o.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors
                  ${period === o.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        }
      />

      <ShareableLinkCard />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={isLoading ? '—' : `$${(data?.revenue.total ?? 0).toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          trend={{ value: 12, label: 'vs last period' }}
        />
        <StatCard
          title="Total Customers"
          value={isLoading ? '—' : data?.total_customers ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Employees"
          value={isLoading ? '—' : data?.total_employees ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Completed Bookings"
          value={isLoading ? '—' : data?.bookings_by_status.completed ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bookings by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    strokeWidth={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Bookings']} />
                  <Legend iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-3 flex items-center gap-3">
                      <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
                    </div>
                  ))
                : (data?.recent_bookings ?? []).slice(0, 6).map((b) => (
                    <div key={b.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {b.customer?.user?.name ?? `Customer #${b.customer_id}`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {b.service?.name} · {b.booking_date}
                        </p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                      <span className="font-semibold text-sm">${b.total_amount}</span>
                    </div>
                  ))}
              {!isLoading && !data?.recent_bookings?.length && (
                <p className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No bookings yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
