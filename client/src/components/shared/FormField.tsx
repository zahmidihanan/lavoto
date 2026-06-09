import React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, error, required, className, children, hint }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
