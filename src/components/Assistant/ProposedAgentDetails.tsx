import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { AGENT_TEMPLATES_PATH } from '@/routes/paths'
import type { ProposedAgent } from '@/schemas/assistantSocket'

interface ProposedAgentDetailsProps {
  agent: ProposedAgent
  applied: boolean
}

/** The model a proposed agent will use, and what the user still sets up. */
export function ProposedAgentDetails({
  agent,
  applied,
}: ProposedAgentDetailsProps) {
  return (
    <div className='space-y-1 pl-5 text-[11px] text-muted-foreground'>
      <p className='flex flex-wrap items-center gap-1'>
        Model: <span className='text-foreground'>{agent.modelName}</span>
        {agent.enableWebSearch && (
          <Badge
            variant='outline'
            className='px-1.5 py-0 text-[10px] font-normal'
          >
            Web search
          </Badge>
        )}
      </p>
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
