import React, { useState, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Checkbox } from './checkbox'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select items...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleToggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0])
      return option ? option.label : placeholder
    }
    return `${selectedValues.length} items selected`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant='outline'
          role='combobox'
          aria-expanded={isOpen}
          className={cn(
            'w-full justify-between text-left font-normal',
            selectedValues.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <span className='truncate'>{getDisplayText()}</span>
          <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-full p-0'
        style={{ width: triggerRef.current?.offsetWidth }}
      >
        <div className='max-h-60 overflow-y-auto'>
          {options.length === 0 ? (
            <div className='py-3 text-center text-sm text-muted-foreground'>
              No options available
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className='flex cursor-pointer items-center space-x-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground'
                onClick={() => handleToggleOption(option.value)}
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleToggleOption(option.value)}
                />
                <span className='text-sm'>{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <Check className='ml-auto h-4 w-4' />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
