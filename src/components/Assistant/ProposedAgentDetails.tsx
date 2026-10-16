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

type ModelOption = ProposedAgent['options'][number]

const priceLabel = (option: ModelOption) =>
  option.inputUsdPerMillionTokens && option.outputUsdPerMillionTokens
    ? `$${option.inputUsdPerMillionTokens} in · $${option.outputUsdPerMillionTokens} out per 1M tokens`
    : null

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
      {agent.prompt ? (
        <p>
          Prompt: <span className='text-foreground'>{agent.prompt.title}</span>{' '}
          — {agent.prompt.why}
        </p>
      ) : (
        <p>
          {applied ? 'Next, open ' : 'After applying, open '}
          <Link to={AGENT_TEMPLATES_PATH} className='text-primary underline'>
            Agents
          </Link>{' '}
          and set this agent's prompt, such as the one you cloned from your
          professor.
        </p>
      )}
      {agent.enableWebSearch && (
        <p className='flex items-start gap-1.5'>
          <Badge
            variant='outline'
            className='shrink-0 px-1.5 py-0 text-[10px] font-normal'
          >
            Web search
          </Badge>
          {agent.webSearchWhy && <span>{agent.webSearchWhy}</span>}
        </p>
      )}
      <p>{applied ? 'Model' : 'Pick a model'}</p>
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
                  'flex items-start gap-2 rounded-md border px-2 py-1.5 text-left transition-colors disabled:cursor-default',
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
                      priceLabel(option),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <span className='mt-0.5 block text-foreground/80'>
                    {option.why}
                  </span>
                </span>
                {chosen && (
                  <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary' />
                )}
              </button>
            )
          })}
      </div>
    </div>
  )
}
