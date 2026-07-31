import { useCallback, useEffect, useState } from 'react'
import { BookMarked, Cpu, FileText, ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import {
  getAgentMemoryAPI,
  type AgentMemory,
  type AgentMemoryChange,
} from '@/api/research'
import type {
  KnowledgeItem,
  MemoryProposal,
  ProjectMemory,
  ResearchSource,
  SoulFile,
} from '../types'
import MemoryProposalQueue from './MemoryProposalQueue'
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
  /** Refetch the project after a memory decision moves something. */
  onMemoryDecided?: () => void
}

/** The runtime writes one fact per `§`-delimited block; that separator is ours. */
const splitEntries = (text: string) =>
  (text ?? '')
    .split('§')
    .map((entry) => entry.trim())
    .filter(Boolean)

/**
 * When each fact was first written, keyed by its text.
 *
 * The files only say what the agent believes now. Walking the snapshots oldest
 * first gives every current fact its own date, which is what the timeline was
 * really being read for — and is why the timeline no longer has to be open.
 */
const firstSeenByEntry = (history: AgentMemoryChange[]) => {
  const seen: Record<string, string> = {}
  for (const change of [...history].reverse()) {
    for (const file of ['memory', 'user'] as const) {
      for (const text of change[file].added) {
        if (!(text in seen)) seen[text] = change.takenAt
      }
    }
  }
  return seen
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

  const agentFactCount =
    splitEntries(agentMemory?.memory ?? '').length +
    splitEntries(agentMemory?.user ?? '').length

  const cards = [
    {
      key: 'durable' as const,
      icon: BookMarked,
      title: 'Durable knowledge',
      // The count means the same thing on every card: how many things are in
      // this layer. It used to mean approved items on one and open decisions on
      // another, so the row of numbers could not be read across.
      count: knowledgeItems.length,
      waiting: 0,
      desc: 'Approved sources and claims. Nothing lands here without you.',
    },
    {
      key: 'sources' as const,
      icon: FileText,
      title: 'Sources',
      count: sources.length,
      waiting: 0,
      desc: 'Files you brought in. Scout can read across these.',
    },
    {
      key: 'standards' as const,
      icon: ScrollText,
      title: 'Standards & memory',
      count: projectMemory.length,
      waiting: 0,
      desc: 'Your soul file, plus the record of this project that DARE keeps.',
    },
    {
      key: 'agent' as const,
      icon: Cpu,
      title: 'Agent memory',
      count: agentFactCount,
      waiting: memoryProposals.length,
      desc: 'What Hermes picked up while working. You decide what it keeps.',
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
          <AgentMemorySection
            files={agentMemory}
            proposals={memoryProposals}
            projectMemory={projectMemory}
            onDecided={afterDecision}
          />
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
      <h3 className='mb-1 text-sm font-medium'>Project memory</h3>
      <p className='mb-3 text-xs text-muted-foreground'>
        DARE's own record of this project — a database row, not a file the agent
        can edit. Mostly the same facts as the agent's{' '}
        <span className='font-mono'>MEMORY.md</span>, on purpose: keeping one
        copies it here. The difference is what happens next — this copy survives
        the agent being reset or replaced, gets fed back into every run, and can
        carry linked sources.
      </p>
      {projectMemory.length === 0 ? (
        <EmptyLine>
          Nothing yet. Keep a fact from the agent and it lands here.
        </EmptyLine>
      ) : (
        // Same row shape as the agent's fact list, deliberately: these hold
        // near-identical content, and rendering one as cards and the other as
        // rows made them look like different kinds of thing.
        <ul className='space-y-2'>
          {projectMemory.map((m) => {
            // The label is derived, not authored — it is the detail's leading
            // clause ("Method decision: …"), or a truncation when there is no
            // such clause. So use it as a heading only when the detail actually
            // carries that clause, and show the rest as the body; otherwise the
            // card printed the same words twice with an ellipsis in between.
            const label = m.label?.trim() ?? ''
            const prefix = `${label}:`
            const hasClause = !!label && m.detail.trim().startsWith(prefix)
            const body = hasClause
              ? m.detail.trim().slice(prefix.length).trim()
              : m.detail
            return (
              <li
                key={m.id}
                className='rounded-lg border border-border bg-card px-4 py-3'
              >
                <div className='flex items-baseline gap-3'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50' />
                  <div className='min-w-0 flex-1'>
                    {hasClause && (
                      <p className='text-sm font-medium'>{label}</p>
                    )}
                    <p className='text-sm leading-relaxed text-foreground/90'>
                      {body}
                    </p>
                  </div>
                  <span className='shrink-0 text-[11px] text-muted-foreground'>
                    {m.source === 'proposal'
                      ? 'kept from the agent'
                      : 'added by you'}
                  </span>
                  <span className='shrink-0 text-[11px] text-muted-foreground'>
                    {formatRelativeDate(m.capturedAt)}
                  </span>
                </div>
                <ThesisSourceLinks thesisId={m.id} sources={knowledgeItems} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  </div>
)

/**
 * One group of the agent's memory, grouped by how far it reaches.
 *
 * Reach is the thing a scholar actually needs to know — that the agent knows
 * their name in every project but the working thesis only here — and it is a
 * property of the file, so the file name stays on the heading rather than
 * being the heading.
 */
const FactGroup = ({
  title,
  file,
  scope,
  entries,
  firstSeen,
  kept,
}: {
  title: string
  file: string
  scope: string
  entries: string[]
  firstSeen: Record<string, string>
  /** Entries DARE has also written into its own record. */
  kept?: Set<string>
}) => (
  <section>
    <div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-3'>
      <h3 className='text-sm font-medium'>
        {title} · {entries.length}
      </h3>
      <span className='font-mono text-[11px] text-muted-foreground'>
        {file}
      </span>
    </div>
    <p className='mb-3 text-xs text-muted-foreground'>{scope}</p>
    {entries.length === 0 ? (
      <EmptyLine>Hermes hasn't written anything here yet.</EmptyLine>
    ) : (
      <ul className='space-y-2'>
        {entries.map((entry) => (
          <li
            key={entry}
            className='flex items-baseline gap-3 rounded-lg border border-border bg-card px-4 py-3'
          >
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50' />
            <p className='flex-1 text-sm leading-relaxed text-foreground/90'>
              {entry}
            </p>
            {/* Names the overlap with project memory rather than leaving the
                same sentence sitting in two tabs with no relationship. */}
            {kept?.has(entry) && (
              <span className='shrink-0 text-[11px] text-green-700 dark:text-green-400'>
                in your record
              </span>
            )}
            {firstSeen[entry] && (
              <span className='shrink-0 text-[11px] text-muted-foreground'>
                {formatRelativeDate(firstSeen[entry])}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
)

/**
 * How the agent's memory got to its current state.
 *
 * Collapsed, because every current fact now carries its own date above — what
 * is left in here is the part the files genuinely cannot show: what the agent
 * dropped or replaced, and why it went.
 */
const MemoryTimeline = ({
  history,
  discarded,
}: {
  history: AgentMemoryChange[]
  discarded: string[]
}) => {
  const changes = history.filter(
    (h) =>
      h.memory.added.length ||
      h.memory.removed.length ||
      h.user.added.length ||
      h.user.removed.length
  )

  if (changes.length === 0) return null

  const wasDiscarded = (text: string) => discarded.includes(text)

  return (
    <details className='rounded-xl border border-border bg-card px-4 py-3'>
      <summary className='cursor-pointer text-sm font-medium'>
        How this memory grew · {changes.length}{' '}
        {changes.length === 1 ? 'change' : 'changes'}
      </summary>
      <p className='mt-2 mb-3 text-xs text-muted-foreground'>
        Recorded each time the files changed. Green is what the agent learned;
        struck through is what left. Entries marked{' '}
        <span className='font-mono'>you</span> are about you rather than this
        project, so they show up in every project you own.
      </p>
      <ol className='space-y-3'>
        {changes.map((h) => (
          <li key={h.id} className='rounded-lg border border-border p-3'>
            <div className='mb-2 flex items-baseline justify-between gap-3'>
              <span className='text-xs font-medium'>
                {h.isFirst ? 'First recorded' : 'Updated'}
              </span>
              <span className='text-xs text-muted-foreground'>
                {new Date(h.takenAt).toLocaleString()}
              </span>
            </div>
            <ul className='space-y-1'>
              {(['memory', 'user'] as const).flatMap((file) => [
                ...h[file].added.map((text) => (
                  <li
                    key={`${file}-a-${text}`}
                    className='flex gap-2 text-xs leading-relaxed'
                  >
                    <span className='shrink-0 font-mono text-emerald-600 dark:text-emerald-400'>
                      +
                    </span>
                    <span className='text-foreground/90'>{text}</span>
                    <span className='ml-auto shrink-0 font-mono text-[11px] text-muted-foreground'>
                      {file === 'memory' ? 'project' : 'you'}
                    </span>
                  </li>
                )),
                ...h[file].removed.map((text) => (
                  <li
                    key={`${file}-r-${text}`}
                    className='flex gap-2 text-xs leading-relaxed'
                  >
                    <span className='shrink-0 font-mono text-muted-foreground'>
                      −
                    </span>
                    <span className='text-muted-foreground line-through'>
                      {text}
                    </span>
                    {/* Without this a removal reads as the agent forgetting on
                        its own, when the usual cause is the scholar. */}
                    <span className='ml-auto shrink-0 font-mono text-[11px] text-muted-foreground'>
                      {wasDiscarded(text) ? 'you discarded this' : 'replaced'}
                    </span>
                  </li>
                )),
              ])}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  )
}

const AgentMemorySection = ({
  files,
  proposals,
  projectMemory,
  onDecided,
}: {
  files: AgentMemory | null
  proposals: MemoryProposal[]
  projectMemory: ProjectMemory[]
  onDecided: () => void
}) => {
  const history = files?.history ?? []
  const firstSeen = firstSeenByEntry(history)
  const kept = new Set(projectMemory.map((m) => m.detail.trim()))

  return (
    <div className='space-y-6'>
      <p className='flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border pb-4 text-sm text-muted-foreground'>
        {files?.isolated ? (
          <>
            <span>Private to this project ·</span>
            <span className='rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground/80'>
              {files.profile}
            </span>
            <span>No other project or scholar can read it.</span>
          </>
        ) : (
          <span>
            These live in the shared default profile, so every project on this
            instance sees the same files.
          </span>
        )}
      </p>

      {/* First, because it is the only thing here that needs you. */}
      <MemoryProposalQueue
        proposals={proposals}
        onDecided={onDecided}
        title='Waiting on you'
        note="Keep it and it becomes project memory you own. Discard it and it leaves the agent's memory too, so it stops acting on it."
      />

      <FactGroup
        title='About this project'
        file='MEMORY.md'
        scope="Stays here. No other project of yours can see these. Anything you keep is copied into DARE's own record under Standards & memory."
        entries={splitEntries(files?.memory ?? '')}
        firstSeen={firstSeen}
        kept={kept}
      />

      <FactGroup
        title='About you'
        file='USER.md'
        scope='Travels with you — the agent knows these in every project you own.'
        entries={splitEntries(files?.user ?? '')}
        firstSeen={firstSeen}
      />

      <MemoryTimeline history={history} discarded={files?.discarded ?? []} />

      <p className='border-t border-border pt-4 text-xs text-muted-foreground'>
        {files?.soul?.trim()
          ? 'Standards come from your soul file, which DARE writes and versions — open Standards & memory to read or change it.'
          : 'No soul file yet. Set your standards under Standards & memory and the agent picks them up on its next run.'}
      </p>
    </div>
  )
}

export default ContextHub
