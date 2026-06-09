import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardApi } from '@/api/services'
import { DollarSign, Users, CalendarCheck, CheckCircle } from 'lucide-react'
import type { BookingStatus } from '@/types'

export function AdminReports() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const { data } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.get(period).then((r) => r.data.data),
  })

  const barData = data
    ? Object.entries(data.bookings_by_status).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count: count as number,
      }))
    : []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Business analytics and performance metrics"
        actions={
          <div className="flex rounded-lg border overflow-hidden">
            {(['week', 'month', 'year'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setPeriod(o)}
                className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors
                  ${period === o ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-muted-foreground'}`}
              >
                {o}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={`$${(data?.revenue.total ?? 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} color="green" />
        <StatCard title="Customers" value={data?.total_customers ?? 0} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard title="Employees" value={data?.total_employees ?? 0} icon={<Users className="h-5 w-5" />} color="purple" />
        <StatCard title="Completed" value={data?.bookings_by_status.completed ?? 0} icon={<CheckCircle className="h-5 w-5" />} color="green" />
      </div>

      <Card>
        <CardHeader><CardTitle>Bookings by Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
