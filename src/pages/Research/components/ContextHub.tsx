import { useEffect, useState } from 'react'
import { BookMarked, Brain, Cpu, FileText, ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import { getAgentMemoryAPI, type AgentMemory } from '@/api/research'
import type {
  KnowledgeItem,
  MemoryProposal,
  ProjectMemory,
  ResearchSource,
  SoulFile,
} from '../types'
import ProjectKnowledge from './ProjectKnowledge'
import { SourcesView } from './SecondaryViews'
import ThesisSourceLinks from './ThesisSourceLinks'

type ContextCard = 'durable' | 'sources' | 'standards' | 'agent'

interface Props {
  projectId?: number
  knowledgeItems: KnowledgeItem[]
  sources: ResearchSource[]
  soulFile: SoulFile | null
  projectMemory: ProjectMemory[]
  memoryProposals: MemoryProposal[]
}

// The project's context hub: one place for everything it holds — approved
// knowledge, raw sources, the standards that govern it, and what the agent
// learned — each owned by a clear party. Pick a card to reveal that layer.
const ContextHub = ({
  projectId,
  knowledgeItems,
  sources,
  soulFile,
  projectMemory,
  memoryProposals,
}: Props) => {
  const [card, setCard] = useState<ContextCard>('durable')
  const [agentMemory, setAgentMemory] = useState<AgentMemory | null>(null)

  useEffect(() => {
    if (!projectId) return
    getAgentMemoryAPI(projectId)
      .then(setAgentMemory)
      .catch(() => setAgentMemory(null))
  }, [projectId])

  const cards = [
    {
      key: 'durable' as const,
      icon: BookMarked,
      title: 'Durable Knowledge',
      owner: 'DARE',
      badge: 'On demand',
      tone: 'green' as const,
      desc: 'Approved sources and claims. Changes only when you approve.',
      count: knowledgeItems.length,
    },
    {
      key: 'sources' as const,
      icon: FileText,
      title: 'Sources',
      owner: 'DARE',
      badge: 'Inputs',
      tone: 'gray' as const,
      desc: 'Files you brought in. Scout can read across these.',
      count: sources.length,
    },
    {
      key: 'standards' as const,
      icon: ScrollText,
      title: 'Standards & Memory',
      owner: 'DARE',
      badge: 'Versioned',
      tone: 'blue' as const,
      desc: 'Your soul file plus working thesis, decisions and open questions.',
      count: projectMemory.length,
    },
    {
      key: 'agent' as const,
      icon: Cpu,
      title: 'Agent Memory',
      owner: 'Hermes',
      badge: 'Auto',
      tone: 'yellow' as const,
      desc: 'How the agent works for you — Hermes updates this, never your record.',
      count: memoryProposals.length,
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

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {cards.map((c) => {
          const Icon = c.icon
          const selected = card === c.key
          return (
            <button
              key={c.key}
              onClick={() => setCard(c.key)}
              aria-pressed={selected}
              className={cn(
                'rounded-xl border p-4 text-left transition-colors',
                selected
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border bg-card hover:border-foreground/30'
              )}
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='rounded-lg bg-muted p-2'>
                  <Icon className='h-4 w-4 text-muted-foreground' />
                </div>
                <Badge variant={c.tone}>{c.badge}</Badge>
              </div>
              <p className='text-sm font-medium'>
                {c.title}
                {c.count > 0 && (
                  <span className='text-muted-foreground'> · {c.count}</span>
                )}
              </p>
              <p className='text-xs text-muted-foreground'>{c.owner}</p>
              <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
                {c.desc}
              </p>
            </button>
          )
        })}
      </div>

      <div>
        {card === 'durable' && <ProjectKnowledge items={knowledgeItems} />}
        {card === 'sources' && <SourcesView sources={sources} />}
        {card === 'standards' && (
          <StandardsSection
            soulFile={soulFile}
            projectMemory={projectMemory}
            knowledgeItems={knowledgeItems}
          />
        )}
        {card === 'agent' && (
          <AgentMemorySection files={agentMemory} proposals={memoryProposals} />
        )}
      </div>
    </div>
  )
}

const EmptyLine = ({ children }: { children: React.ReactNode }) => (
  <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
    {children}
  </p>
)

const StandardsSection = ({
  soulFile,
  projectMemory,
  knowledgeItems,
}: {
  soulFile: SoulFile | null
  projectMemory: ProjectMemory[]
  knowledgeItems: KnowledgeItem[]
}) => (
  <div className='space-y-6'>
    <section>
      <h3 className='mb-3 text-sm font-medium'>
        Soul file{soulFile ? ` · v${soulFile.version}` : ''}
      </h3>
      {soulFile ? (
        <pre className='rounded-xl border border-border bg-card p-5 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90'>
          {soulFile.content}
        </pre>
      ) : (
        <EmptyLine>No soul file yet.</EmptyLine>
      )}
    </section>
    <section>
      <h3 className='mb-3 text-sm font-medium'>Project memory</h3>
      {projectMemory.length === 0 ? (
        <EmptyLine>No project memory yet.</EmptyLine>
      ) : (
        <div className='space-y-3'>
          {projectMemory.map((m) => (
            <div
              key={m.id}
              className='rounded-xl border border-border bg-card p-5'
            >
              <div className='flex items-center gap-2'>
                <Brain className='h-4 w-4 text-muted-foreground' />
                <p className='text-sm font-medium'>{m.label}</p>
              </div>
              <p className='mt-2 text-sm text-foreground/80'>{m.detail}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Captured {formatRelativeDate(m.capturedAt)}
              </p>
              <ThesisSourceLinks thesisId={m.id} sources={knowledgeItems} />
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
)

const FileBlock = ({
  name,
  note,
  content,
}: {
  name: string
  note: string
  content: string
}) => (
  <div>
    <p className='mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
      {name} <span className='font-normal normal-case'>· {note}</span>
    </p>
    {content.trim() ? (
      <pre className='max-h-72 overflow-auto rounded-lg border border-border bg-card p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90'>
        {content}
      </pre>
    ) : (
      <EmptyLine>Hermes hasn’t written this yet.</EmptyLine>
    )}
  </div>
)

const AgentMemorySection = ({
  files,
  proposals,
}: {
  files: AgentMemory | null
  proposals: MemoryProposal[]
}) => (
  <div className='space-y-6'>
    <p className='text-sm text-muted-foreground'>
      Hermes's own files on disk — the live agent state behind every run.
      {files?.isolated ? (
        <>
          {' '}
          They belong to this project's own agent profile (
          <span className='font-mono text-xs'>{files.profile}</span>), so no
          other project or scholar can read them.
        </>
      ) : (
        ' They live in the shared default profile, so every project on this instance sees the same files.'
      )}
    </p>
    <FileBlock
      name='SOUL.md'
      note='the anchor Hermes obeys — DARE keeps it in sync with your standards'
      content={files?.soul ?? ''}
    />
    <FileBlock
      name='MEMORY.md'
      note='project facts the agent kept — written by Hermes, not yet reviewed by you'
      content={files?.memory ?? ''}
    />
    <FileBlock
      name='USER.md'
      note='what the agent knows about you — written by Hermes, not yet reviewed by you'
      content={files?.user ?? ''}
    />

    <section>
      <h3 className='mb-1 text-sm font-medium'>
        Pending from the agent · {proposals.length}
      </h3>
      <p className='mb-3 text-xs text-muted-foreground'>
        Proposals you accept here become project memory, which you own. The two
        files above are different: Hermes writes those itself as it works, and
        they are not gated by this queue.
      </p>
      {proposals.length === 0 ? (
        <EmptyLine>No pending proposals.</EmptyLine>
      ) : (
        <div className='space-y-2'>
          {proposals.map((p) => (
            <div
              key={p.id}
              className='flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3'
            >
              <Badge variant='gray' className='mt-0.5 shrink-0'>
                {p.role}
              </Badge>
              <div className='min-w-0 flex-1'>
                <p className='text-sm'>{p.content}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Proposed {formatRelativeDate(p.proposedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
)

export default ContextHub
