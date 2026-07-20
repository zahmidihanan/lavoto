import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu, X, MapPin, Phone, Mail, Clock, Star, Shield, Zap,
  ChevronRight, Sparkles, CheckCircle, Send, Calendar, Users,
  CreditCard, Bell, LayoutDashboard, Building2, Link2, BarChart3,
  Car, ClipboardCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useAuthStore } from '@/stores/auth.store'
import dashboardScreenshot from '../../assets/dasheboard.png'
import ctaBg from '../../assets/hero-car-wash.jpg'
import gallery1 from '../../assets/gallery-1.jpg'
import gallery2 from '../../assets/gallery-2.jpg'
import gallery3 from '../../assets/gallery-3.jpg'
import gallery4 from '../../assets/gallery-4.jpg'
import gallery5 from '../../assets/gallery-5.jpg'
import gallery6 from '../../assets/gallery-6.jpg'
import gallery7 from '../../assets/gallery-7.jpg'
import gallery8 from '../../assets/gallery-8.jpg'

const GALLERY_IMAGES = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7, gallery8]

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
]

const MODULES = [
  {
    icon: <Calendar className="h-7 w-7" />,
    title: 'Booking & Scheduling',
    desc: 'Manage every reservation from one calendar — availability, time slots, and station capacity handled automatically.',
  },
  {
    icon: <Building2 className="h-7 w-7" />,
    title: 'Multi-Station Management',
    desc: 'Run one location or a whole network. Each station keeps its own schedule, staff, and services.',
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: 'Staff & Employee Assignment',
    desc: 'Assign employees to bookings, track availability, and balance workload across your team.',
  },
  {
    icon: <Star className="h-7 w-7" />,
    title: 'Customer & Loyalty CRM',
    desc: 'Keep a full customer history, vehicle records, and a built-in loyalty points program to drive repeat business.',
  },
  {
    icon: <CreditCard className="h-7 w-7" />,
    title: 'Payments & Invoicing',
    desc: 'Record payments, issue refunds, and export reports — all tied directly to each booking.',
  },
  {
    icon: <Bell className="h-7 w-7" />,
    title: 'Real-Time Notifications',
    desc: 'Live updates on new bookings, status changes, and assignments the moment they happen.',
  },
  {
    icon: <Link2 className="h-7 w-7" />,
    title: 'Public Booking Page',
    desc: 'Give your customers a branded, shareable link where they can book a wash in seconds — no app required.',
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Analytics Dashboard',
    desc: 'Revenue, booking volume, and customer trends at a glance, so you always know how the business is doing.',
  },
]

const STEPS = [
  {
    icon: <Building2 className="h-6 w-6" />,
    title: 'Create your company',
    desc: 'Sign up and set up your car wash business in minutes.',
  },
  {
    icon: <Car className="h-6 w-6" />,
    title: 'Add stations & services',
    desc: 'Configure your locations, wash packages, and pricing.',
  },
  {
    icon: <Link2 className="h-6 w-6" />,
    title: 'Share your booking link',
    desc: 'Send customers your public page so they can book instantly.',
  },
  {
    icon: <LayoutDashboard className="h-6 w-6" />,
    title: 'Manage from your dashboard',
    desc: 'Track bookings, staff, payments, and customers in one place.',
  },
]

const FEATURES = [
  { icon: <Zap className="h-6 w-6" />, title: 'Fast Setup', desc: 'Get your agency up and running in minutes, no technical skills required.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Secure & Reliable', desc: 'Your business data is protected and always accessible when you need it.' },
  { icon: <Bell className="h-6 w-6" />, title: 'Real-Time Sync', desc: 'Every booking, status change, and payment updates instantly across your team.' },
  { icon: <Star className="h-6 w-6" />, title: 'Built-In Loyalty Program', desc: 'Reward repeat customers automatically and keep them coming back.' },
]

export function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, role, clearAuth } = useAuthStore()

  const dashboardUrl = role === 'admin' || role === 'manager' ? '/admin'
    : role === 'employee' ? '/employee'
    : '/customer'

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-blue-700">
            <img src="/lavotoLogo.jpeg" alt="Lavoto" className="h-9 w-9 rounded-xl object-cover" />
            Lavoto
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  Sign out
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" asChild>
                  <Link to={dashboardUrl}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-blue-100 bg-white px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-600 hover:text-blue-600 font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
                    Sign out
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link to={dashboardUrl}>Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-16 overflow-hidden">
        <div className="relative min-h-[90vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white" />
          <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <ScrollReveal>
                <Badge className="bg-blue-100 text-blue-700 border-0 mb-6 text-sm px-4 py-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
                  Booking & Management Platform for Car Wash Businesses
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Run Your Car Wash jkqckjqchqskjc<br />
                  <span className="text-blue-600">Like Clockwork</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                  Lavoto is the all-in-one SaaS platform for car wash agencies. Manage
                  bookings, stations, staff, payments, and customers from a single
                  dashboard — and give your customers a branded booking page of their own.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="xl" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25" asChild>
                    <Link to="/register">Start Free <ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                  <Button size="xl" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400" asChild>
                    <a href="#features">See Features</a>
                  </Button>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">Multi-station</p>
                      <p className="text-sm text-gray-500 mt-1">One dashboard for every location</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">Real-time</p>
                      <p className="text-sm text-gray-500 mt-1">Live booking & staff sync</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right: dashboard mockup */}
              <ScrollReveal>
                <div className="relative lg:block">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-blue-400/10 to-transparent rounded-3xl blur-2xl" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                    <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                      <span className="ml-3 text-xs text-gray-400">app.lavoto.com/dashboard</span>
                    </div>
                    <img
                      src={dashboardScreenshot}
                      alt="Lavoto admin dashboard showing bookings, revenue, and customer stats"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">One dashboard</p>
                      <p className="text-xs text-gray-500">Every station, in sync</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">About Lavoto</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Car Wash<br />Agencies, Not Cars
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lavoto isn't a car wash — it's the software car wash businesses run on.
                We help agency owners replace spreadsheets, phone calls, and paper
                schedules with one connected system.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                From a single station to a network of locations, Lavoto keeps your
                bookings, staff, customers, and payments organized so you can focus on
                growing the business instead of managing the chaos.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-blue-600">1</p>
                  <p className="text-sm text-gray-500">Dashboard for everything</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">∞</p>
                  <p className="text-sm text-gray-500">Stations & staff supported</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm text-gray-500">Customer booking access</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Building2 className="h-7 w-7" />, label: 'Multi-Station' },
                  { icon: <Users className="h-7 w-7" />, label: 'Staff Management' },
                  { icon: <Calendar className="h-7 w-7" />, label: 'Smart Scheduling' },
                  { icon: <ClipboardCheck className="h-7 w-7" />, label: 'Quality Checks' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-blue-50 p-8 flex flex-col items-center justify-center text-center gap-3 aspect-square">
                    <div className="h-14 w-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Modules / Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Everything In One Platform</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Every Tool Your Agency Needs
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From the first booking to the final payment, Lavoto covers the full
                lifecycle of running a car wash business.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODULES.map((mod) => (
                <div key={mod.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                    {mod.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{mod.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Getting Started</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Up and Running in Four Steps
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                No installation, no training required. Your agency can be live the same day.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-5 relative z-10">
                    {step.icon}
                  </div>
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-6xl font-bold text-blue-50 select-none">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Why Lavoto</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built for Reliability & Growth
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We built Lavoto around what car wash agencies actually need day to day.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Powered by Lavoto</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Real Washes, Managed on Lavoto
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every one of these visits was booked, assigned, and tracked from a Lavoto dashboard.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GALLERY_IMAGES.map((img, i) => (
                <div key={i} className="relative group rounded-2xl overflow-hidden shadow-md aspect-square">
                  <img
                    src={img}
                    alt={`Car wash managed on Lavoto ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Talk to Us</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Have Questions?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Whether you run one station or a whole network, we're happy to help you get set up.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-5 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Address</p>
                    <p className="text-sm text-gray-500">123 Clean Street, NY 10001</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">info@lavoto.com</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Support Hours</p>
                    <p className="text-sm text-gray-500">Mon-Sat 8AM-7PM</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <Input placeholder="Your car wash agency" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <Textarea rows={4} placeholder="Tell us about your business..." />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="h-4 w-4 mr-2" /> Send message
                  </Button>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-6 overflow-hidden">
        <img
          src={ctaBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/85" />
        <ScrollReveal>
          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-white">Ready to Streamline Your Car Wash Business?</h2>
            <p className="text-blue-100 text-lg">
              Create your account and start managing bookings, staff, and customers today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
                <Link to="/register">Start Free</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
                <a href="#contact">Contact us</a>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-xl text-white">
                <img src="/lavotoLogo.jpeg" alt="Lavoto" className="h-9 w-9 rounded-xl object-cover" />
                Lavoto
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                The booking & management platform built for car wash agencies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-blue-400 transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                {['Booking & Scheduling', 'Multi-Station Management', 'Customer & Loyalty CRM', 'Payments & Invoicing'].map((item) => (
                  <li key={item}>
                    <a href="#features" className="hover:text-blue-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> 123 Clean Street, NY 10001</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-400" /> +1 (555) 123-4567</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-400" /> info@lavoto.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 Lavoto. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
