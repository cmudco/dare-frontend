import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import type { ProposedAgent } from '@/schemas/assistantSocket'
import { AGENT_TEMPLATES_PATH } from '@/routes/paths'

interface ProposedAgentDetailsProps {
  agent: ProposedAgent
  applied: boolean
}

/** What a proposed agent will be set up with: model, prompt and settings. */
export function ProposedAgentDetails({
  agent,
  applied,
}: ProposedAgentDetailsProps) {
  const settings = [
    agent.enableWebSearch && 'Web search',
    agent.webFetchEnabled && 'Web fetch',
    agent.artifactsEnabled && 'Artifacts',
    agent.memoryEnabled && 'Memory',
    agent.temperature !== null && `Temperature ${agent.temperature}`,
    agent.effort && `Effort ${agent.effort}`,
    agent.historyLimit !== null && `History ${agent.historyLimit}`,
    agent.maxTokens !== null && `Max tokens ${agent.maxTokens}`,
  ].filter((label): label is string => Boolean(label))

  return (
    <div className='space-y-1 pl-5 text-[11px] text-muted-foreground'>
      <p>
        Model: <span className='text-foreground'>{agent.modelName}</span>
      </p>
      <p>
        Prompt: <span className='text-foreground'>{agent.promptTitle}</span>
        {agent.newPrompt && (
          <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
            new
          </Badge>
        )}
      </p>
      {agent.newPrompt && (
        <details>
          <summary className='cursor-pointer'>Show the new prompt</summary>
          <p className='mt-1 max-h-40 overflow-y-auto rounded-md bg-muted p-2 whitespace-pre-wrap text-foreground'>
            {agent.newPrompt.content}
          </p>
        </details>
      )}
      {settings.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {settings.map((label) => (
            <Badge
              key={label}
              variant='outline'
              className='px-1.5 py-0 text-[10px] font-normal'
            >
              {label}
            </Badge>
          ))}
        </div>
      )}
      {applied && (
        <p>
          Find it on{' '}
          <Link to={AGENT_TEMPLATES_PATH} className='text-primary underline'>
            Agents
          </Link>
          , or pick it from a chat's Prompts menu.
        </p>
      )}
    </div>
  )
}
