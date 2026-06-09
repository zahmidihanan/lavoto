import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Car } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Car className="h-6 w-6" />
          Lavoto
        </Link>
        <div className="space-y-4">
          <blockquote className="text-2xl font-semibold leading-snug">
            "The smartest way to manage your car wash business."
          </blockquote>
          <p className="text-primary-foreground/70 text-sm">
            Lavoto — Multi-tenant car wash SaaS
          </p>
        </div>
        <div className="flex gap-8 text-sm text-primary-foreground/70">
          <span>© 2026 Lavoto</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Car className="h-6 w-6" />
              Lavoto
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
