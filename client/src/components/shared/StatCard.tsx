import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  className?: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose'
}

const colorMap = {
  blue:   'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  rose:   'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
}

export function StatCard({ title, value, icon, trend, className, color = 'blue' }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-emerald-600' : 'text-destructive'
              )}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('rounded-xl p-3', colorMap[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
