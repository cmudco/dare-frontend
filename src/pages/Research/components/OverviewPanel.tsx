import {
  Activity,
  ArrowRight,
  BookMarked,
  Check,
  FileText,
  Inbox,
  MessagesSquare,
  Telescope,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRanAt, roleLabel, runStatusBadge } from '../runFormat'
import type { AgentRun } from '../types'

interface Props {
  question: string
  sourceCount: number
  runs: AgentRun[]
  pendingCount: number
  approvedCount: number
  onGoToScout: () => void
  onGoToChat: () => void
  onGoToReview: () => void
  onGoToRuns: () => void
}

type StepState = 'done' | 'active' | 'todo'

const OverviewPanel = ({
  question,
  sourceCount,
  runs,
  pendingCount,
  approvedCount,
  onGoToScout,
  onGoToChat,
  onGoToReview,
  onGoToRuns,
}: Props) => {
  const askState: StepState =
    pendingCount > 0 || approvedCount > 0 ? 'done' : 'active'
  const reviewState: StepState = pendingCount > 0 ? 'active' : 'todo'
  const approveState: StepState = approvedCount > 0 ? 'done' : 'todo'

  const recentRuns = runs.slice(0, 3)

  return (
    <div className='space-y-8'>
      <header>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          Research question
        </p>
        <h2 className='mt-2 max-w-2xl text-2xl font-semibold leading-snug tracking-tight'>
          {question}
        </h2>
      </header>

      {/* Quiet status — at a glance, not a metrics wall */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatTile
          icon={Inbox}
          label='To review'
          value={pendingCount}
          tone={pendingCount > 0 ? 'attention' : 'muted'}
          onClick={onGoToReview}
        />
        <StatTile
          icon={BookMarked}
          label='Approved'
          value={approvedCount}
          tone='good'
          onClick={onGoToReview}
        />
        <StatTile
          icon={FileText}
          label='Sources'
          value={sourceCount}
          tone='muted'
        />
        <StatTile
          icon={Activity}
          label='Runs'
          value={runs.length}
          tone='muted'
          onClick={onGoToRuns}
        />
      </div>

      {/* The loop + the two ways to work */}
      <div className='rounded-2xl border border-border bg-card p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <Step
            index={1}
            label='Ask Scout'
            desc='Gather candidate sources'
            state={askState}
          />
          <Connector />
          <Step
            index={2}
            label='Review results'
            desc='Weigh each finding'
            state={reviewState}
          />
          <Connector />
          <Step
            index={3}
            label='Approve knowledge'
            desc='Keep what holds up'
            state={approveState}
          />
        </div>

        <div className='mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center'>
          {pendingCount > 0 && (
            <Button onClick={onGoToReview} className='shrink-0'>
              Review {pendingCount} finding{pendingCount > 1 ? 's' : ''}
              <ArrowRight className='h-4 w-4' />
            </Button>
          )}
          <Button
            variant={pendingCount > 0 ? 'outline' : 'default'}
            onClick={onGoToScout}
            className='shrink-0'
          >
            <Telescope className='h-4 w-4' /> Ask Scout
          </Button>
          <Button variant='outline' onClick={onGoToChat} className='shrink-0'>
            <MessagesSquare className='h-4 w-4' /> Open chat
          </Button>
          <p className='text-xs text-muted-foreground sm:ml-auto'>
            Delegate a task, or think live — same agent, same standards.
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-medium'>Recent activity</h3>
          <button
            onClick={onGoToRuns}
            className='text-xs text-primary hover:underline'
          >
            View all runs
          </button>
        </div>
        <div className='space-y-2'>
          {recentRuns.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              No runs yet — ask Scout to gather sources.
            </p>
          )}
          {recentRuns.map((run) => {
            const badge = runStatusBadge(run.status)
            return (
              <div
                key={run.id}
                className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
              >
                <span className='shrink-0 text-xs font-medium text-muted-foreground'>
                  {roleLabel(run.role)}
                </span>
                <p className='min-w-0 flex-1 truncate text-sm'>{run.task}</p>
                <span className='shrink-0 text-xs text-muted-foreground'>
                  {formatRanAt(run.ranAt)}
                </span>
                <Badge variant={badge.variant} className='shrink-0'>
                  {badge.label}
                </Badge>
              </div>
            )
          })}
        </div>
      </section>

      <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
        This workspace keeps orchestration with you. AI helpers do bounded work
        and stage their results; you decide what becomes durable project
        knowledge. The seams between your judgement and the system stay visible
        by design.
      </p>
    </div>
  )
}

const StatTile = ({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value: number
  tone: 'muted' | 'attention' | 'good'
  onClick?: () => void
}) => {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-4 text-left transition-colors',
        onClick && 'hover:border-foreground/20'
      )}
    >
      <Icon className='h-4 w-4 text-muted-foreground' />
      <div
        className={cn(
          'mt-2 text-2xl font-semibold tabular-nums leading-none',
          tone === 'attention' && 'text-amber-600 dark:text-amber-400',
          tone === 'good' && 'text-green-600 dark:text-green-400'
        )}
      >
        {value}
      </div>
      <div className='mt-1 text-xs text-muted-foreground'>{label}</div>
    </Comp>
  )
}

const Step = ({
  index,
  label,
  desc,
  state,
}: {
  index: number
  label: string
  desc: string
  state: StepState
}) => (
  <div className='flex flex-1 items-center gap-3'>
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
        state === 'done' &&
          'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        state === 'active' && 'border-transparent bg-dare-gradient text-white',
        state === 'todo' && 'border-border text-muted-foreground'
      )}
    >
      {state === 'done' ? <Check className='h-4 w-4' /> : index}
    </div>
    <div>
      <p
        className={cn(
          'text-sm font-medium',
          state === 'todo' && 'text-muted-foreground'
        )}
      >
        {label}
      </p>
      <p className='text-xs text-muted-foreground'>{desc}</p>
    </div>
  </div>
)

const Connector = () => (
  <div className='hidden h-px flex-1 bg-border sm:block' />
)

export default OverviewPanel
