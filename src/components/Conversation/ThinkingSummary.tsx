import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ThinkingSummaryProps {
  summary: string
  streaming?: boolean
}

const ThinkingSummary: React.FC<ThinkingSummaryProps> = ({
  summary,
  streaming = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!summary.trim()) return null

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='not-prose mb-3'
    >
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className='flex w-full min-w-0 items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted'
          aria-label={
            isOpen ? 'Hide thinking summary' : 'Show thinking summary'
          }
        >
          <span className='min-w-0 flex-1 font-medium'>
            {streaming ? 'Thinking…' : 'Thinking summary'}
          </span>
          {streaming && (
            <span className='h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary' />
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='mt-1 max-h-64 max-w-full overflow-x-hidden overflow-y-auto rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap text-muted-foreground'>
          {summary}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default ThinkingSummary
