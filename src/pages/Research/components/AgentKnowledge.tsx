import type { ReactNode } from 'react'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { AgentMemory } from '@/api/research'
import type { KnowledgeItem, MemoryProposal, ProjectMemory } from '../types'
import EmptyLine from './EmptyLine'
import MemoryProposalQueue from './MemoryProposalQueue'
import ThesisSourceLinks from './ThesisSourceLinks'

interface Props {
  files: AgentMemory | null
  proposals: MemoryProposal[]
  projectMemory: ProjectMemory[]
  knowledgeItems: KnowledgeItem[]
  onDecided: () => void
}

/** Entries of a memory file; the runtime separates them with `§`. */
const entriesOf = (text: string) =>
  text
    .split('§')
    .map((entry) => entry.trim())
    .filter(Boolean)

const Group = ({
  title,
  file,
  reach,
  children,
}: {
  title: string
  file: string
  reach: string
  children: ReactNode
}) => (
  <section>
    <div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-3'>
      <h3 className='text-sm font-medium'>{title}</h3>
      <span className='font-mono text-[11px] text-muted-foreground'>
        {file}
      </span>
    </div>
    <p className='mb-3 text-xs text-muted-foreground'>{reach}</p>
    {children}
  </section>
)

const Row = ({
  children,
  aside,
}: {
  children: ReactNode
  aside?: ReactNode
}) => (
  <li className='rounded-lg border border-border bg-card px-4 py-3'>
    <div className='flex items-baseline gap-3'>
      <p className='flex-1 text-sm leading-relaxed whitespace-pre-line text-foreground/90'>
        {children}
      </p>
      {aside}
    </div>
  </li>
)

// Exactly what the project's agent loads at the start of every run, rendered
// by DARE from what the user approved. Nothing here is a separate copy.
const AgentKnowledge = ({
  files,
  proposals,
  projectMemory,
  knowledgeItems,
  onDecided,
}: Props) => {
  if (!files) return <EmptyLine>Loading what the agent knows…</EmptyLine>

  const [projectSection] = entriesOf(files.memory)
  const userEntries = entriesOf(files.user)
  const memoryRows = [...projectMemory].sort((a, b) =>
    a.capturedAt.localeCompare(b.capturedAt)
  )

  return (
    <div className='space-y-6'>
      <MemoryProposalQueue
        proposals={proposals}
        onDecided={onDecided}
        title='Waiting on you'
        note='The agent asked to remember these. Approve one and it is added below; reject it and nothing is saved.'
      />

      <Group
        title='Standards'
        file='SOUL.md'
        reach='Who the agent is and the standards it holds to, in this project.'
      >
        {files.soul.trim() ? (
          <pre className='rounded-xl border border-border bg-card p-5 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90'>
            {files.soul}
          </pre>
        ) : (
          <EmptyLine>
            No standards yet. Add them from the project's Edit page.
          </EmptyLine>
        )}
      </Group>

      <Group
        title={`This project · ${memoryRows.length + 1}`}
        file='MEMORY.md'
        reach='Only this project sees these.'
      >
        <ul className='space-y-2'>
          <Row
            aside={
              <span className='shrink-0 text-[11px] text-muted-foreground'>
                from the project's settings
              </span>
            }
          >
            {projectSection}
          </Row>
          {memoryRows.map((m) => (
            <li
              key={m.id}
              className='rounded-lg border border-border bg-card px-4 py-3'
            >
              <div className='flex items-baseline gap-3'>
                <p className='flex-1 text-sm leading-relaxed text-foreground/90'>
                  {m.detail}
                </p>
                <span className='shrink-0 text-[11px] text-muted-foreground'>
                  {m.source === 'proposal'
                    ? 'approved from the agent'
                    : 'added by you'}
                  {' · '}
                  {formatRelativeDate(m.capturedAt)}
                </span>
              </div>
              <ThesisSourceLinks thesisId={m.id} sources={knowledgeItems} />
            </li>
          ))}
        </ul>
      </Group>

      <Group
        title={`About you · ${userEntries.length}`}
        file='USER.md'
        reach='Travels with you: the agent knows these in every project you own.'
      >
        {userEntries.length ? (
          <ul className='space-y-2'>
            {userEntries.map((entry) => (
              <Row key={entry}>{entry}</Row>
            ))}
          </ul>
        ) : (
          <EmptyLine>Nothing about you yet.</EmptyLine>
        )}
      </Group>

      <Group
        title={`Skills · ${files.skills.length}`}
        file='skills/'
        reach='Methods you approved for the agent to reuse.'
      >
        {files.skills.length ? (
          <ul className='space-y-2'>
            {files.skills.map((skill) => (
              <Row
                key={skill.name}
                aside={
                  <span className='shrink-0 text-[11px] text-muted-foreground'>
                    {skill.scope === 'project'
                      ? 'this project'
                      : 'every project'}
                  </span>
                }
              >
                <span className='font-mono text-xs'>{skill.name}</span>
                {skill.description ? ` · ${skill.description}` : ''}
              </Row>
            ))}
          </ul>
        ) : (
          <EmptyLine>No skills yet.</EmptyLine>
        )}
      </Group>
    </div>
  )
}

export default AgentKnowledge
