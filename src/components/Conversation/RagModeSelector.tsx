import React from 'react'

import { Bot, Check, Database, Route } from 'lucide-react'

import { RagMode } from '@/utils/constants/conversation'

interface RagModeSelectorProps {
  value: RagMode
  onChange: (value: RagMode) => void
}

interface RagModeOption {
  value: RagMode
  label: string
  description: string
  recommended: boolean
  icon: React.ReactNode
}

const options: RagModeOption[] = [
  {
    value: RagMode.NAIVE,
    label: 'Fast',
    description: 'Direct vector lookup',
    recommended: false,
    icon: <Database className='h-4 w-4' />,
  },
  {
    value: RagMode.ADVANCED,
    label: 'Thorough',
    description: 'Analyzes, blends, and reranks',
    recommended: true,
    icon: <Route className='h-4 w-4' />,
  },
  {
    value: RagMode.AGENTIC,
    label: 'Autonomous',
    description: 'Searches in multiple steps',
    recommended: false,
    icon: <Bot className='h-4 w-4' />,
  },
]

export const RagModeSelector: React.FC<RagModeSelectorProps> = ({
  value,
  onChange,
}) => (
  <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
    {options.map((option) => {
      const selected = option.value === value
      return (
        <button
          key={option.value}
          type='button'
          className={`relative flex min-h-28 min-w-0 flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
            selected
              ? 'border-primary bg-primary/10 shadow-sm'
              : 'border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-accent/60 hover:shadow-sm'
          }`}
          onClick={() => onChange(option.value)}
          aria-pressed={selected}
        >
          {selected && (
            <span className='absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <Check className='h-2.5 w-2.5' />
            </span>
          )}
          <span
            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md ${
              selected
                ? 'bg-primary/15 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {option.icon}
          </span>
          <span className='text-sm font-semibold whitespace-nowrap text-foreground'>
            {option.label}
          </span>
          <span className='text-[11px] leading-4 text-muted-foreground'>
            {option.description}
          </span>
          {option.recommended && (
            <span className='mt-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] leading-4 font-medium text-primary'>
              Recommended
            </span>
          )}
        </button>
      )
    })}
  </div>
)

export default RagModeSelector
