import { ArrowRight } from 'lucide-react'

import type { GraphWalkStep } from '@/redux/types/conversation'

import { chunkStepLabel, relationPhrase } from './graphPathText'

const stepLabel = (step: GraphWalkStep) =>
  step.kind === 'chunk' ? chunkStepLabel(step) : step.label

/** A walk path: passage -> entity -> passage, with stated relationships on the arrows. */
const GraphPath = ({ path }: { path: GraphWalkStep[] }) => {
  const alias = path.find((step) => step.mentionedAs)
  return (
    <div className='min-w-0 rounded-md border border-border bg-muted/30 px-2 py-1.5'>
      <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs'>
        {path.map((step, index) => (
          <span
            key={`${step.kind}-${index}`}
            className='flex min-w-0 items-center gap-1.5'
          >
            {index > 0 && (
              <span className='flex items-center gap-1 text-muted-foreground'>
                {relationPhrase(step) && (
                  <span className='text-[11px] italic'>
                    {relationPhrase(step)}
                  </span>
                )}
                <ArrowRight className='h-3 w-3 shrink-0' />
              </span>
            )}
            <span
              className={
                step.kind === 'entity'
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {stepLabel(step)}
            </span>
          </span>
        ))}
      </div>
      {alias && (
        <div className='mt-0.5 text-[11px] text-muted-foreground'>
          Written here as “{alias.mentionedAs}”
        </div>
      )}
    </div>
  )
}

export default GraphPath
