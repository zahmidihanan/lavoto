import React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, disabledDates = [], minDate, placeholder = 'Pick a date', className }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const fromDate = minDate ?? today

  const disabledDays = [
    { before: fromDate },
    ...disabledDates,
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover border rounded-md shadow-md z-50" align="start" sideOffset={4}>
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabledDays}
          fromDate={fromDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
