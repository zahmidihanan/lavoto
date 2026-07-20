import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, Car, Star, Plus } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingStatusBadge } from '@/components/shared/BookingStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bookingsApi, vehiclesApi, customersApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'

export function CustomerDashboard() {
  const { user } = useAuthStore()

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.list({ per_page: 5 }).then((r) => r.data),
  })

  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.list().then((r) => r.data),
  })

  const { data: customer } = useQuery({
    queryKey: ['my-customer', user?.customer_id],
    queryFn: () => customersApi.get(user!.customer_id!).then((r) => r.data.data),
    enabled: !!user?.customer_id,
  })

  const completed = bookings?.data.filter((b) => b.status === 'completed').length ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        description="Here's what's happening with your account"
        actions={
          <Button asChild>
            <Link to="/customer/bookings/new">
              <Plus className="h-4 w-4 mr-1" />
              Book a Wash
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="My Vehicles"
          value={vehicles?.meta.total ?? 0}
          icon={<Car className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Bookings"
          value={bookings?.meta.total ?? 0}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Completed Washes"
          value={completed}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Loyalty Points"
          value={customer ? `${customer.loyalty_points} pts` : '—'}
          icon={<Star className="h-5 w-5" />}
          color="amber"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/bookings">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingBookings ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : bookings?.data.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Button asChild size="sm">
                <Link to="/customer/bookings/new">Book your first wash</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {bookings?.data.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{b.service?.name ?? 'Car Wash'}</p>
                    <p className="text-xs text-muted-foreground">{b.booking_date} · {b.station?.name}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                  <span className="font-semibold">MAD {b.total_amount}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
