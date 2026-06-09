import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Car, CheckCircle, Star, Zap, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { servicesApi } from '@/api/services'
import { useThemeStore } from '@/stores/theme.store'
import { Moon, Sun } from 'lucide-react'

const FEATURES = [
  { icon: <Zap className="h-5 w-5" />, title: 'Fast Booking', desc: 'Schedule in under 60 seconds' },
  { icon: <Shield className="h-5 w-5" />, title: 'Quality Guaranteed', desc: 'Professional quality check on every wash' },
  { icon: <Clock className="h-5 w-5" />, title: 'On-Time Service', desc: 'We respect your time, always' },
  { icon: <Star className="h-5 w-5" />, title: 'Loyalty Rewards', desc: 'Earn points on every wash' },
]

export function HomePage() {
  const { theme, toggle } = useThemeStore()

  const { data: services } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => servicesApi.active().then((r) => r.data.data),
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            Lavoto
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="secondary" className="mb-2">Professional Car Wash Management</Badge>
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            The smarter way to run your{' '}
            <span className="text-primary">car wash</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Multi-tenant SaaS platform for booking, managing employees, payments, and customer loyalty — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="xl" asChild>
              <Link to="/register">Start free trial</Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required · Setup in 2 minutes</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    {f.icon}
                  </div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {services && services.length > 0 && (
        <section id="services" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Our Services</h2>
            <p className="text-center text-muted-foreground mb-12">Professional car care packages for every need</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Card key={s.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg">{s.name}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-2xl font-bold text-primary">${s.price}</p>
                        <p className="text-xs text-muted-foreground">{s.duration_minutes} min</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link to="/register">Book now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Join hundreds of car wash businesses using Lavoto to streamline operations.
          </p>
          <Button size="xl" variant="secondary" asChild>
            <Link to="/register">Create free account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Car className="h-4 w-4 text-primary" />
            Lavoto
          </div>
          <p>© 2026 Lavoto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
