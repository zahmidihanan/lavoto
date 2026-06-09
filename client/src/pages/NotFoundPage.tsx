import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div className="space-y-4">
        <p className="text-8xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button asChild><Link to="/">Go home</Link></Button>
      </div>
    </div>
  )
}
