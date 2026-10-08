import { Check, Loader2, X } from 'lucide-react'
import { describeToolStep } from '@/constants/assistant'
import { AssistantStepStatus } from '@/utils/constants/assistant'

export interface AssistantStepView {
  key: string
  name: string
  status: AssistantStepStatus
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
          {step.status === AssistantStepStatus.RUNNING && (
            <Loader2 className='mt-0.5 h-3 w-3 shrink-0 animate-spin' />
          )}
          {step.status === AssistantStepStatus.COMPLETED && (
            <Check className='mt-0.5 h-3 w-3 shrink-0' />
          )}
          {step.status === AssistantStepStatus.FAILED && (
            <X className='mt-0.5 h-3 w-3 shrink-0 text-destructive' />
          )}
          <span className='min-w-0 break-words'>
            {describeToolStep(
              step.name,
              step.arguments,
              step.status === AssistantStepStatus.RUNNING
            )}
            {step.status === AssistantStepStatus.RUNNING && '…'}
          </span>
        </li>
      ))}
    </ul>
  )
}
