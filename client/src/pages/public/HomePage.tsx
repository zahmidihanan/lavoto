import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Menu, X, MapPin, Phone, Mail, Clock, Star, Shield, Zap,
  ChevronRight, Sparkles, Droplets, Wind, CheckCircle, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useAuthStore } from '@/stores/auth.store'
import { publicApi } from '@/api/services'
import type { Service } from '@/types'
import heroCarWash from "../../assets/hero-car-wash.jpg";
import about1 from "../../assets/about-1.jpg";
import about2 from "../../assets/about-2.jpg";
import about3 from "../../assets/about-3.jpg";
import about4 from "../../assets/about-4.jpg";
import serviceFullWash from "../../assets/service-full-wash.jpg";
import servicePremiumWash from "../../assets/service-premium-wash.jpg";
import serviceInteriorWash from "../../assets/service-interior-wash.jpg";
import serviceExteriorWash from "../../assets/service-exterior-wash.jpg";
import gallery1 from "../../assets/gallery-1.jpg";
import gallery2 from "../../assets/gallery-2.jpg";
import gallery3 from "../../assets/gallery-3.jpg";
import gallery4 from "../../assets/gallery-4.jpg";
import gallery5 from "../../assets/gallery-5.jpg";
import gallery6 from "../../assets/gallery-6.jpg";
import gallery7 from "../../assets/gallery-7.jpg";
import gallery8 from "../../assets/gallery-8.jpg";

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
]

const SERVICE_ICONS: Record<string, ReactNode> = {
  full: <Droplets className="h-8 w-8" />,
  interior: <Wind className="h-8 w-8" />,
  exterior: <Sparkles className="h-8 w-8" />,
  premium: <Star className="h-8 w-8" />,
}

const SERVICE_IMAGES: Record<string, string> = {
  full: serviceFullWash,
  interior: serviceInteriorWash,
  exterior: serviceExteriorWash,
  premium: servicePremiumWash,
}

const FEATURES = [
  { icon: <Star className="h-6 w-6" />, title: 'Good Quality', desc: 'Premium products and professional techniques for a spotless finish every time.' },
  { icon: <Zap className="h-6 w-6" />, title: 'Fast Service', desc: 'Express wash options available. We respect your time and deliver quickly.' },
  { icon: <Clock className="h-6 w-6" />, title: 'On Time', desc: 'Scheduled appointments honored within minutes. No waiting, no delays.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Loyalty Program', desc: 'Earn points on every wash. Free wash after every 5 visits. Terms apply.' },
]

export function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, role, clearAuth } = useAuthStore()

  const { data: company } = useQuery({
    queryKey: ['public-company'],
    queryFn: () => publicApi.companyDefault().then((r) => r.data.data),
    staleTime: 300_000,
  })

  const slug = company?.slug
  const { data: serviceData } = useQuery({
    queryKey: ['public-services', slug],
    queryFn: () => publicApi.services(slug!).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 300_000,
  })

  const bookingUrl = company?.booking_url || (slug ? `/book/${slug}` : '#services')

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
                  Professional Car Wash & Detailing
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Your Car Deserves the{' '}
                  <span className="text-blue-600">Premium Treatment</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                  Experience top-quality car washing and detailing services. We treat 
                  every vehicle with precision and care, using premium products for a 
                  spotless finish every time.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="xl" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25" asChild>
                    <a href={bookingUrl}>Book Now <ChevronRight className="ml-1 h-4 w-4" /></a>
                  </Button>
                  <Button size="xl" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400" asChild>
                    <a href="#contact">Contact Us</a>
                  </Button>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">500+</p>
                      <p className="text-sm text-gray-500 mt-1">Cars Washed</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">98%</p>
                      <p className="text-sm text-gray-500 mt-1">Happy Clients</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">5+</p>
                      <p className="text-sm text-gray-500 mt-1">Years Exp.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              {/* Right Image */}
              <ScrollReveal>
              <div className="relative lg:block">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-blue-400/10 to-transparent rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={heroCarWash}
                    alt="Professional car wash service"
                    className="w-full h-[520px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-5 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 text-blue-600 fill-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">4.9 / 5.0</p>
                    <p className="text-xs text-gray-500">From 200+ reviews</p>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us ─────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">About Us</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                We Keep Your Car<br />Looking Its Best
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Lavoto, we are passionate about cars and dedicated to providing 
                the highest quality cleaning and detailing services. With years of 
                experience in the automotive care industry, our team uses only 
                premium products and advanced techniques to protect and enhance 
                your vehicle's appearance.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Beyond washing, we offer convenient car rental services so you can 
                go about your day while we pamper your car. Whether you need a 
                quick exterior wash or a full premium detail, Lavoto is your 
                trusted partner for automotive care.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '500+', label: 'Cars Washed' },
                  { value: '98%', label: 'Happy Clients' },
                  { value: '5+', label: 'Years Experience' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about1}
                  alt="Car wash service"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about2}
                  alt="Car detailing"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about3}
                  alt="Car cleaning"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about4}
                  alt="Professional car wash"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-4 bg-blue-600 rounded-xl p-5 text-white shadow-lg hidden md:block">
                <Droplets className="h-7 w-7 mb-1" />
                <p className="text-2xl font-bold">10+</p>
                <p className="text-xs text-blue-200">Service Points</p>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Our Services</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Car Wash Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect cleaning package for your vehicle. Every service includes 
              a quality check and satisfaction guarantee.
            </p>
          </div>
          </ScrollReveal>
          <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {(serviceData ?? []).map((service) => {
              const cat = service.category ?? ''
              return (
              <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
                <div className="h-52 relative overflow-hidden">
                  <img
                    src={SERVICE_IMAGES[cat] || serviceFullWash}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <span className="text-lg font-bold bg-white/20 backdrop-blur px-3 py-1 rounded-lg">{service.price} MAD</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1">{service.duration_minutes} min</p>
                  </div>
                </div>
                <CardContent className="p-5 space-y-3">
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  {service.options && service.options.length > 0 && (
                  <ul className="space-y-1.5">
                    {service.options.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  )}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2" asChild>
                    <a href={bookingUrl}>Book Now</a>
                  </Button>
                </CardContent>
              </Card>
              )
            })}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Our Work</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See the Results
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every car that comes through our doors leaves spotless. Here are some of our recent washes.
            </p>
          </div>
          </ScrollReveal>
          <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7, gallery8].map((img, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden shadow-md aspect-square">
                <img
                  src={img}
                  alt={`Car wash ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-110 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-sm font-semibold drop-shadow-lg">Car Wash {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Quality & Reliability
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We pride ourselves on delivering exceptional service every time.
            </p>
          </div>
          </ScrollReveal>
          <ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-0 mb-4">Get In Touch</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have a question or want to book a service? Reach out to us.
            </p>
          </div>
          </ScrollReveal>
          <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-md h-72 bg-gray-200 flex items-center justify-center text-gray-400">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.279915167!2d-74.259866!3d40.697149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lavoto Location"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Address</p>
                    <p className="text-xs text-gray-500">123 Clean Street, NY 10001</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Phone</p>
                    <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Hours</p>
                    <p className="text-xs text-gray-500">Mon-Sat 8AM-7PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea rows={4} placeholder="Tell us more about your request..." />
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
      <section className="py-20 px-6 bg-blue-600">
        <ScrollReveal>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">Ready to Make Your Car Shine?</h2>
          <p className="text-blue-100 text-lg">
            Book your appointment today and experience the Lavoto difference.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
              <a href={bookingUrl}>Book an appointment</a>
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
                Premium car wash and detailing services. We treat your car like it's our own.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                {['Home', 'About Us', 'Services', 'Features', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '')}`} className="hover:text-blue-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-3 text-sm">
                {['Full Wash', 'Premium Wash', 'Exterior & Interior', 'Car Rental'].map((item) => (
                  <li key={item}>
                    <a href="#services" className="hover:text-blue-400 transition-colors">{item}</a>
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
