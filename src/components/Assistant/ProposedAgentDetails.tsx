import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AGENT_TEMPLATES_PATH } from '@/routes/paths'
import type { ProposedAgent } from '@/schemas/assistantSocket'
import { AgentModelRole } from '@/utils/constants/assistant'

const ROLE_LABELS: Record<AgentModelRole, string> = {
  [AgentModelRole.QUALITY]: 'Best quality',
  [AgentModelRole.BALANCED]: 'Balanced',
  [AgentModelRole.BUDGET]: 'Budget',
}

interface ProposedAgentDetailsProps {
  agent: ProposedAgent
  applied: boolean
  /** The option the agent was or will be created with. */
  chosenModelRef: string
  onChoose: (modelRef: string) => void
  disabled: boolean
}

/** The models offered for a proposed agent; the user picks one before applying. */
export function ProposedAgentDetails({
  agent,
  applied,
  chosenModelRef,
  onChoose,
  disabled,
}: ProposedAgentDetailsProps) {
  return (
    <div className='space-y-1.5 pl-5 text-[11px] text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <span>{applied ? 'Model' : 'Pick a model'}</span>
        {agent.enableWebSearch && (
          <Badge
            variant='outline'
            className='px-1.5 py-0 text-[10px] font-normal'
          >
            Web search
          </Badge>
        )}
      </div>
      <div
        role='radiogroup'
        aria-label='Model for this agent'
        className='flex flex-col gap-1'
      >
        {agent.options
          .filter((option) => !applied || option.modelRef === chosenModelRef)
          .map((option) => {
            const chosen = option.modelRef === chosenModelRef
            return (
              <button
                key={option.modelRef}
                type='button'
                role='radio'
                aria-checked={chosen}
                disabled={disabled || applied}
                onClick={() => onChoose(option.modelRef)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors disabled:cursor-default',
                  chosen
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-xs text-foreground'>
                    {option.modelName}
                  </span>
                  <span className='block'>
                    {[
                      option.role && ROLE_LABELS[option.role],
                      option.outputUsdPerMillionTokens &&
                        `$${option.outputUsdPerMillionTokens} / 1M output tokens`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                {chosen && (
                  <Check className='h-3.5 w-3.5 shrink-0 text-primary' />
                )}
              </button>
            )
          })}
      </div>
      <p>
        {applied ? 'Next, open ' : 'After applying, open '}
        <Link to={AGENT_TEMPLATES_PATH} className='text-primary underline'>
          Agents
        </Link>{' '}
        and set this agent's prompt, such as the one you cloned from your
        professor.
      </p>
    </div>
  )
}
