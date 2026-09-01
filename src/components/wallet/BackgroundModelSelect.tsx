import React from 'react'
import { Sparkles } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface BackgroundModelSelectProps {
  id: string
  models: string[]
  suggestedModel: string | null
  value: string
  onChange: (model: string) => void
}

/** Presentation only. LiteLLM model ranking is backend-owned policy. */
export const BackgroundModelSelect: React.FC<BackgroundModelSelectProps> = ({
  id,
  models,
  suggestedModel,
  value,
  onChange,
}) => {
  const isRecommended = Boolean(suggestedModel && value === suggestedModel)

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
          <span className='inline-flex items-center gap-1 text-xs font-medium text-primary'>
            <Sparkles className='h-3.5 w-3.5' />
            Recommended
          </span>
        )}
      </div>
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
            {model === suggestedModel ? ' — Recommended' : ''}
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
