import { Check, Loader2, X } from 'lucide-react'
import { describeToolStep } from '@/constants/assistant'

export interface AssistantStepView {
  key: string
  name: string
  status: 'running' | 'completed' | 'failed'
  arguments: Record<string, unknown>
}

/** The tools an answer ran (or is running), one muted line each. */
export function AssistantSteps({ steps }: { steps: AssistantStepView[] }) {
  if (steps.length === 0) return null
  return (
    <ul className='mb-1.5 space-y-1' aria-label='Assistant steps'>
      {steps.map((step) => (
        <li
          key={step.key}
          className='flex items-start gap-1.5 text-xs text-muted-foreground'
        >
          {step.status === 'running' && (
            <Loader2 className='mt-0.5 h-3 w-3 shrink-0 animate-spin' />
          )}
          {step.status === 'completed' && (
            <Check className='mt-0.5 h-3 w-3 shrink-0' />
          )}
          {step.status === 'failed' && (
            <X className='mt-0.5 h-3 w-3 shrink-0 text-destructive' />
          )}
          <span className='min-w-0 break-words'>
            {describeToolStep(
              step.name,
              step.arguments,
              step.status === 'running'
            )}
            {step.status === 'running' && '…'}
          </span>
        </li>
      ))}
    </ul>
  )
}
