import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const ISO_DATE = 'yyyy-MM-dd'

interface DatePickerProps {
  id?: string
  /** ISO calendar date (yyyy-MM-dd) or '' when unset. */
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  size?: 'default' | 'sm'
  className?: string
  'aria-label'?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
  size = 'default',
  className,
  'aria-label': ariaLabel,
}) => {
  const [open, setOpen] = React.useState(false)
  const selected = value ? parseISO(value) : undefined
  const disabled = [
    ...(min ? [{ before: parseISO(min) }] : []),
    ...(max ? [{ after: parseISO(max) }] : []),
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('relative', className)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            size={size}
            aria-label={ariaLabel}
            className={cn(
              'w-full justify-start font-normal',
              size === 'sm' && 'h-8 text-xs',
              selected ? 'pr-8' : 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='opacity-60' />
            {selected ? format(selected, 'PP') : placeholder}
          </Button>
        </PopoverTrigger>
        {selected && (
          <button
            type='button'
            aria-label='Clear date'
            onClick={() => onChange('')}
            className='absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <X className='size-3.5' />
          </button>
        )}
      </div>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selected}
          defaultMonth={selected}
          disabled={disabled}
          onSelect={(date) => {
            onChange(date ? format(date, ISO_DATE) : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
