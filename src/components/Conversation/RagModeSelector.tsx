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
    description: 'Quick source lookup',
    recommended: false,
    icon: <Database className='h-4 w-4' />,
  },
  {
    value: RagMode.ADVANCED,
    label: 'Thorough',
    description: 'Analyzes and reranks',
    recommended: true,
    icon: <Route className='h-4 w-4' />,
  },
  {
    value: RagMode.AGENTIC,
    label: 'Autonomous',
    description: 'Searches and refines',
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
          className={`flex min-h-20 flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors ${
            selected
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:bg-accent'
          }`}
          onClick={() => onChange(option.value)}
          aria-pressed={selected}
        >
          <span className='flex w-full min-w-0 items-center gap-1.5'>
            <span
              className={selected ? 'text-primary' : 'text-muted-foreground'}
            >
              {option.icon}
            </span>
            <span className='min-w-0 truncate font-medium text-foreground'>
              {option.label}
            </span>
            {selected && (
              <Check className='ml-auto h-3.5 w-3.5 shrink-0 text-primary' />
            )}
          </span>
          <span className='text-xs text-muted-foreground'>
            {option.description}
          </span>
          {option.recommended && (
            <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
              Recommended
            </span>
          )}
        </button>
      )
    })}
  </div>
)

export default RagModeSelector
