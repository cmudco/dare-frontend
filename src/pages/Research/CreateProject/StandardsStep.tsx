import { Check, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  STANDARDS_PRESETS,
  StandardsTemplate,
} from '@/utils/constants/research'
import type { ProjectDraft } from '@/redux/types/research'
import StepHeading from './StepHeading'

interface Props {
  standardsTemplate: StandardsTemplate
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const StandardsStep = ({ standardsTemplate, onPatch }: Props) => {
  const selected = STANDARDS_PRESETS.find((p) => p.key === standardsTemplate)

  return (
    <div className='space-y-6'>
      <StepHeading
        title='Set your research standards'
        subtitle='These become the project soul file — the rules Scout and Critic carry on your behalf, even when you are not watching.'
      />

      <div className='grid max-w-3xl gap-3 sm:grid-cols-3'>
        {STANDARDS_PRESETS.map((preset) => {
          const isOn = preset.key === standardsTemplate
          return (
            <button
              key={preset.key}
              type='button'
              onClick={() => onPatch({ standardsTemplate: preset.key })}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                isOn
                  ? 'border-foreground/30 bg-muted/40 ring-1 ring-foreground/10'
                  : 'border-border hover:border-foreground/20'
              )}
            >
              <div className='flex items-center justify-between'>
                <ScrollText className='h-4 w-4 text-muted-foreground' />
                {isOn && (
                  <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                )}
              </div>
              <p className='mt-2 text-sm font-medium'>{preset.name}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {preset.summary}
              </p>
            </button>
          )
        })}
      </div>

      {selected && selected.virtues.length > 0 && (
        <div className='max-w-2xl rounded-xl border border-border bg-muted/30 p-4'>
          <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Included standards
          </p>
          <ul className='space-y-1.5'>
            {selected.virtues.map((virtue) => (
              <li key={virtue} className='flex gap-2 text-sm'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <span>{virtue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default StandardsStep
