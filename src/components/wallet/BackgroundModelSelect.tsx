import React from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface BackgroundModelSelectProps {
  id: string
  models: string[]
  recommendedModels: string[]
  value: string
  onChange: (model: string) => void
}

/** Presentation only. LiteLLM model ranking is backend-owned policy. */
export const BackgroundModelSelect: React.FC<BackgroundModelSelectProps> = ({
  id,
  models,
  recommendedModels,
  value,
  onChange,
}) => {
  const isRecommended = recommendedModels.includes(value)

  return (
    <div
      className={cn(
        'space-y-2 rounded-lg border p-3 transition-colors',
        isRecommended
          ? 'border-primary/35 bg-primary/5'
          : 'border-border bg-background'
      )}
    >
      <div className='flex items-center justify-between gap-3'>
        <Label htmlFor={id}>Background model</Label>
        {isRecommended && (
          <span className='text-xs font-medium text-primary'>Recommended</span>
        )}
      </div>
      {recommendedModels.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-muted-foreground'>
            Top recommendations
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {recommendedModels.map((model, index) => {
              const isSelected = value === model
              return (
                <button
                  key={model}
                  type='button'
                  aria-pressed={isSelected}
                  title={model}
                  onClick={() => onChange(model)}
                  className={cn(
                    'max-w-full rounded-md border px-2 py-1 text-left text-xs transition-colors',
                    isSelected
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/35 hover:text-foreground'
                  )}
                >
                  <span className='break-all'>
                    {index + 1}. {model}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
      >
        <option value=''>Use the DARE default</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
            {recommendedModels.includes(model) ? ' — Recommended' : ''}
          </option>
        ))}
      </select>
      <p className='text-xs text-muted-foreground'>
        Used for titles, summaries, memory extraction, and retrieval query
        analysis. This usage is billed by your LiteLLM proxy.
      </p>
    </div>
  )
}
