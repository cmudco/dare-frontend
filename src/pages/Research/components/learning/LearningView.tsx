import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getLearningAPI } from '@/api/research'
import { MEMORY_LAYERS } from '@/utils/constants/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import type {
  LearnedProcedure,
  LearningOverview,
  LearningTimelineRow,
} from '@/redux/types/research'
import CorrectionChart from './CorrectionChart'
import ProposalCard from './ProposalCard'

interface Props {
  projectId: number
  /** A proposal was decided — badges elsewhere moved. */
  onChanged: () => void
}

const Section = ({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) => (
  <section className='rounded-xl border border-border bg-card p-5'>
    <h3 className='text-sm font-semibold'>{title}</h3>
    {hint && <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p>}
    <div className='mt-3'>{children}</div>
  </section>
)

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className='text-sm text-muted-foreground'>{children}</p>
)

const ProcedureRow = ({ procedure }: { procedure: LearnedProcedure }) => {
  const [open, setOpen] = useState(false)
  return (
    <li className='py-2'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className='flex w-full items-center gap-2 text-left'
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className='text-sm font-medium'>{procedure.name}</span>
        <Badge variant='secondary'>v{procedure.version}</Badge>
        <span className='text-xs text-muted-foreground'>
          {procedure.scope === 'researcher' ? 'Every project' : 'This project'}
        </span>
      </button>
      {procedure.description && (
        <p className='mt-0.5 pl-6 text-xs text-muted-foreground'>
          {procedure.description}
        </p>
      )}
      {open && (
        <pre className='mt-2 ml-6 overflow-x-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap'>
          {procedure.content}
        </pre>
      )}
    </li>
  )
}

const TimelineRow = ({ row }: { row: LearningTimelineRow }) => (
  <li className='relative pb-4 pl-5 last:pb-0'>
    <span
      className={`absolute top-1.5 -left-1 h-2 w-2 rounded-full ${row.status === 'accepted' ? 'bg-primary' : 'bg-border'}`}
    />
    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
      <span>{formatRelativeDate(row.decidedAt ?? row.proposedAt)}</span>
      <Badge variant={row.status === 'accepted' ? 'secondary' : 'outline'}>
        {row.status === 'accepted'
          ? `Learned · ${MEMORY_LAYERS[row.layer].label}`
          : 'Rejected'}
      </Badge>
    </div>
    <p
      className={`mt-1 text-sm ${row.status === 'accepted' ? '' : 'text-muted-foreground line-through'}`}
    >
      {row.content}
    </p>
    {row.evidence.length > 0 ? (
      <p className='mt-0.5 text-xs text-muted-foreground'>
        From your note
        {row.evidence.length > 1 ? 's' : ''}:{' '}
        {row.evidence
          .map((e) => (e.note ? `“${e.note}”` : e.tags.join(', ')))
          .join(' · ')}
      </p>
    ) : (
      row.why && (
        <p className='mt-0.5 text-xs text-muted-foreground'>{row.why}</p>
      )
    )}
  </li>
)

/**
 * What the agent has learned about the scholar and this project, and the
 * evidence that it is learning: corrections per run should fall over time.
 */
const LearningView = ({ projectId, onChanged }: Props) => {
  const [data, setData] = useState<LearningOverview | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setData(await getLearningAPI(projectId))
      setError('')
    } catch {
      setError('Could not load what the agent has learned.')
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <p className='text-sm text-destructive'>{error}</p>
  if (!data)
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )

  const decided = () => {
    void load()
    onChanged()
  }

  return (
    <div className='space-y-5'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Learning</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          What the agent is learning from your reviews, and the proof it is
          getting better. Nothing is saved without your approval.
        </p>
      </header>

      {data.pending.length > 0 && (
        <Section
          title={`Waiting for you · ${data.pending.length}`}
          hint='Approve, move to another layer, or reject.'
        >
          <div className='space-y-2'>
            {data.pending.map((p) => (
              <ProposalCard key={p.id} proposal={p} onDecided={decided} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title='Corrections per Scout run'
        hint='Falling lines mean the agent needs less correcting.'
      >
        <CorrectionChart points={data.corrections} />
      </Section>

      <Section
        title='Skills'
        hint='Methods the agent proposed after repeated corrections and you approved. Hermes loads them as skills on every run. Your standards and project memory live in Edit project and in Context.'
      >
        {data.procedures.length ? (
          <ul className='divide-y divide-border'>
            {data.procedures.map((p) => (
              <ProcedureRow key={p.id} procedure={p} />
            ))}
          </ul>
        ) : (
          <Empty>No skills yet.</Empty>
        )}
      </Section>

      <Section title='Timeline' hint='Every decision, newest first.'>
        {data.timeline.length ? (
          <ol className='border-l border-border pl-0'>
            {data.timeline.map((row) => (
              <TimelineRow key={row.id} row={row} />
            ))}
          </ol>
        ) : (
          <Empty>No decisions yet.</Empty>
        )}
      </Section>
    </div>
  )
}

export default LearningView
