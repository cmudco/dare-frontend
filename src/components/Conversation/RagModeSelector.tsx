import React from 'react'

import { Bot, Database, Route } from 'lucide-react'

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
          className={`flex min-h-20 flex-col items-start justify-between rounded-md border p-3 text-left transition-colors ${
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-card-foreground hover:bg-accent'
          }`}
          onClick={() => onChange(option.value)}
          aria-pressed={selected}
        >
          <span className='flex w-full items-center justify-between gap-2'>
            <span className='flex items-center gap-2 font-medium'>
              {option.icon}
              {option.label}
            </span>
            {option.recommended && (
              <span
                className={`text-xs ${
                  selected
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                }`}
              >
                Recommended
              </span>
            )}
          </span>
          <span
            className={`text-xs ${
              selected ? 'text-primary-foreground/80' : 'text-muted-foreground'
            }`}
          >
            {option.description}
          </span>
        </button>
      )
    })}
  </div>
)

export default RagModeSelector
