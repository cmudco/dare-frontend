import {
  BookMarked,
  Brain,
  Cpu,
  FileText,
  ScrollText,
  Shapes,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { MemoryProposal, ProjectMemory, ResearchSource } from '../types'

// Deliberately sparse views — present, but not competing for attention.

const sourceMeta = (source: ResearchSource): string => {
  const size =
    source.sizeLabel || (source.pageCount ? `${source.pageCount} pages` : '')
  return [source.kind, size, `Added ${formatRelativeDate(source.createdAt)}`]
    .filter(Boolean)
    .join(' · ')
}

export const SourcesView = ({ sources }: { sources: ResearchSource[] }) => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Sources</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Files you have brought into the project. Scout can read across these.
      </p>
    </header>
    {sources.length === 0 ? (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
        <div className='mb-4 rounded-full bg-muted p-3'>
          <FileText className='h-6 w-6 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>No sources yet</p>
        <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
          Add sources when creating the project, or bring them in here later.
        </p>
      </div>
    ) : (
      <div className='space-y-2'>
        {sources.map((source) => (
          <div
            key={source.id}
            className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
          >
            <div className='rounded-md bg-muted p-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{source.name}</p>
              <p className='text-xs text-muted-foreground'>
                {sourceMeta(source)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

const STORES = [
  {
    icon: BookMarked,
    title: 'Durable Knowledge',
    owner: 'DARE',
    badge: 'On demand',
    tone: 'green' as const,
    desc: 'Approved sources and claims. Changes only when you approve.',
  },
  {
    icon: ScrollText,
    title: 'Standards & Memory',
    owner: 'DARE',
    badge: 'On demand · versioned',
    tone: 'blue' as const,
    desc: 'Your soul file plus working thesis, decisions and open questions.',
  },
  {
    icon: Cpu,
    title: 'Agent Memory',
    owner: 'Hermes',
    badge: 'Auto',
    tone: 'yellow' as const,
    desc: 'How the agent works for you. Hermes updates this itself — never your record.',
  },
]

interface MemoryViewProps {
  projectMemory: ProjectMemory[]
  memoryProposals: MemoryProposal[]
}

export const MemoryView = ({
  projectMemory,
  memoryProposals,
}: MemoryViewProps) => (
  <div className='space-y-8'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Memory / Context</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        What persists between sessions — and who is allowed to change it.
      </p>
    </header>

    {/* The three stores, and who controls each */}
    <div className='grid gap-3 md:grid-cols-3'>
      {STORES.map((store) => {
        const Icon = store.icon
        return (
          <div
            key={store.title}
            className='rounded-xl border border-border bg-card p-4'
          >
            <div className='mb-2 flex items-center justify-between'>
              <div className='rounded-lg bg-muted p-2'>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </div>
              <Badge variant={store.tone}>{store.badge}</Badge>
            </div>
            <p className='text-sm font-medium'>{store.title}</p>
            <p className='text-xs text-muted-foreground'>{store.owner}</p>
            <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
              {store.desc}
            </p>
          </div>
        )
      })}
    </div>

    {/* Current project memory (lives in the DARE-owned store) */}
    <section>
      <h3 className='mb-3 text-sm font-medium'>Project memory</h3>
      {projectMemory.length === 0 ? (
        <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
          No project memory yet.
        </p>
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
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Pending proposals — the agent proposes, the scholar decides */}
    <section>
      <h3 className='mb-1 text-sm font-medium'>
        Pending from the agent · {memoryProposals.length}
      </h3>
      <p className='mb-3 text-xs text-muted-foreground'>
        Hermes proposes; you decide. Nothing here is remembered until you accept
        it.
      </p>
      {memoryProposals.length === 0 ? (
        <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
          No pending proposals.
        </p>
      ) : (
        <div className='space-y-2'>
          {memoryProposals.map((p) => (
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

export const ArtifactsView = () => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Artifacts</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Figures, tables and slides built from approved knowledge — drafted by
        the Presentation Assistant, finished by you.
      </p>
    </header>
    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
      <div className='mb-4 rounded-full bg-muted p-3'>
        <Shapes className='h-6 w-6 text-muted-foreground' />
      </div>
      <p className='text-sm font-medium'>No artifacts yet</p>
      <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
        Once you have approved enough sources, ask the Presentation Assistant to
        draft a figure or slide here.
      </p>
    </div>
  </div>
)
