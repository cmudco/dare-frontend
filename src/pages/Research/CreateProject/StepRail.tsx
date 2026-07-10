import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStepDef {
  key: string
  label: string
  optional?: boolean
}

interface Props {
  steps: WizardStepDef[]
  activeIndex: number
  furthestIndex: number
  onJump: (index: number) => void
}

const StepRail = ({ steps, activeIndex, furthestIndex, onJump }: Props) => (
  <ol className='space-y-1'>
    {steps.map((step, i) => {
      const isDone = i < furthestIndex
      const isActive = i === activeIndex
      const isReachable = i <= furthestIndex

      return (
        <li key={step.key}>
          <button
            type='button'
            disabled={!isReachable}
            onClick={() => onJump(i)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-muted font-medium text-foreground'
                : isReachable
                  ? 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  : 'cursor-not-allowed text-muted-foreground/50'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                isDone
                  ? 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : isActive
                    ? 'border-transparent bg-dare-gradient text-white'
                    : 'border-border'
              )}
            >
              {isDone ? <Check className='h-3.5 w-3.5' /> : i + 1}
            </span>
            <span>
              {step.label}
              {step.optional && (
                <span className='ml-1 text-xs text-muted-foreground/70'>
                  · optional
                </span>
              )}
            </span>
          </button>
        </li>
      )
    })}
  </ol>
)

export default StepRail
