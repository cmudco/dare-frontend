import { useCallback, useEffect, useState } from 'react'
import { BookMarked, Cpu, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAgentMemoryAPI, type AgentMemory } from '@/api/research'
import type {
  KnowledgeItem,
  MemoryProposal,
  ProjectMemory,
  ResearchSource,
  ReviewItem,
} from '../types'
import AgentKnowledge from './AgentKnowledge'
import ProjectKnowledge from './ProjectKnowledge'
import { SourcesView } from './SecondaryViews'

type ContextCard = 'durable' | 'sources' | 'agent'

interface Props {
  projectId?: number
  knowledgeItems: KnowledgeItem[]
  /** Rejected review items, shown with the user's reason. */
  rejectedItems: ReviewItem[]
  sources: ResearchSource[]
  projectMemory: ProjectMemory[]
  memoryProposals: MemoryProposal[]
  /** Refetch the project after a memory decision moves something. */
  onMemoryDecided?: () => void
}

// Everything the project holds, each with a clear owner: approved findings,
// the user's sources, and what the agent loads on every run.
const ContextHub = ({
  projectId,
  knowledgeItems,
  rejectedItems,
  sources,
  projectMemory,
  memoryProposals,
  onMemoryDecided,
}: Props) => {
  const [card, setCard] = useState<ContextCard>('durable')
  const [agentMemory, setAgentMemory] = useState<AgentMemory | null>(null)

  const loadAgentMemory = useCallback(() => {
    if (!projectId) return
    getAgentMemoryAPI(projectId)
      .then(setAgentMemory)
      .catch(() => setAgentMemory(null))
  }, [projectId])

  useEffect(loadAgentMemory, [loadAgentMemory])

  const afterDecision = useCallback(() => {
    loadAgentMemory()
    onMemoryDecided?.()
  }, [loadAgentMemory, onMemoryDecided])

  const agentFactCount = agentMemory
    ? [agentMemory.memory, agentMemory.user]
        .flatMap((text) => text.split('§'))
        .filter((entry) => entry.trim()).length + agentMemory.skills.length
    : 0

  const cards = [
    {
      key: 'durable' as const,
      icon: BookMarked,
      title: 'Durable knowledge',
      count: knowledgeItems.length,
      waiting: 0,
      desc: `Approved sources and claims${rejectedItems.length ? `, plus ${rejectedItems.length} rejected with reasons` : ''}. Nothing lands here without you.`,
    },
    {
      key: 'sources' as const,
      icon: FileText,
      title: 'Sources',
      count: sources.length,
      waiting: 0,
      desc: 'Files you added to the project. Agents cannot read their contents yet.',
    },
    {
      key: 'agent' as const,
      icon: Cpu,
      title: 'What the agent knows',
      count: agentFactCount,
      waiting: memoryProposals.length,
      desc: 'Its standards, memory and skills: exactly what it loads on every run.',
    },
  ]

  return (
    <div className='space-y-8'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Context</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Everything this project holds — and who is allowed to change it. Pick
          a layer to see it.
        </p>
      </header>

      <div className='grid gap-3 sm:grid-cols-3'>
        {cards.map((c) => {
          const Icon = c.icon
          const selected = card === c.key
          return (
            <button
              key={c.key}
              onClick={() => setCard(c.key)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col rounded-xl border p-4 text-left transition-colors',
                selected
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border bg-card hover:border-foreground/30'
              )}
            >
              {/* Fixed-height header row so a two-word badge can never push one
                  card's title a line below its neighbours'. */}
              <div className='mb-2 flex h-8 items-center justify-between gap-2'>
                <span className='rounded-lg bg-muted p-2'>
                  <Icon className='h-4 w-4 text-muted-foreground' />
                </span>
                {c.waiting > 0 && (
                  <Badge variant='yellow'>{c.waiting} to review</Badge>
                )}
              </div>
              {/* Two lines' worth, so a title that wraps on one card cannot
                  drop that card's description below its neighbours'. */}
              <p className='min-h-10 text-sm font-medium'>
                {c.title}
                <span className='font-normal text-muted-foreground tabular-nums'>
                  {' '}
                  · {c.count}
                </span>
              </p>
              <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
                {c.desc}
              </p>
            </button>
          )
        })}
      </div>

      <div>
        {card === 'durable' && (
          <ProjectKnowledge items={knowledgeItems} rejected={rejectedItems} />
        )}
        {card === 'sources' && <SourcesView sources={sources} />}
        {card === 'agent' && projectId && (
          <AgentKnowledge
            projectId={projectId}
            files={agentMemory}
            proposals={memoryProposals}
            projectMemory={projectMemory}
            knowledgeItems={knowledgeItems}
            onDecided={afterDecision}
          />
        )}
      </div>
    </div>
  )
}

export default ContextHub
