import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Loader2,
  MessageCircleQuestion,
  Search,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  formatCost,
  formatRanAt,
  formatRunDuration,
  formatToolCallDuration,
  roleLabel,
  runStatusBadge,
} from '../runFormat'
import type { AgentRun } from '../types'

const RunsView = ({ runs }: { runs: AgentRun[] }) => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Runs</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Every delegated task sent to the agent harness — what it ran, which
        tools it used, and what it staged. Nothing here changed your record.
      </p>
    </header>

    {runs.length === 0 ? (
      <div className='rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground'>
        No runs yet. Delegated tasks you send to Scout will appear here.
      </div>
    ) : (
      <div className='space-y-3'>
        {runs.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
    )}
  </div>
)

const RunCard = ({ run }: { run: AgentRun }) => {
  const [expanded, setExpanded] = useState(false)
  const badge = runStatusBadge(run.status)

  return (
    <div className='rounded-xl border border-border bg-card'>
      <button
        onClick={() => setExpanded((v) => !v)}
        className='flex w-full items-start gap-3 p-5 text-left'
      >
        <StatusDot status={run.status} />
        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-1.5 text-sm font-medium'>
              {run.role === 'critic' ? (
                <MessageCircleQuestion className='h-4 w-4 text-muted-foreground' />
              ) : (
                <Search className='h-4 w-4 text-muted-foreground' />
              )}
              {roleLabel(run.role)}
            </span>
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <span className='text-xs text-muted-foreground'>
              {formatRanAt(run.ranAt)}
            </span>
          </div>
          <p className='truncate text-sm text-foreground/80'>{run.task}</p>
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
            <span>{run.tools.join(' · ') || 'no tools'}</span>
            <span>·</span>
            <span>{run.stagedCount} staged</span>
            <span>·</span>
            <span>{formatRunDuration(run.startedAt, run.completedAt)}</span>
            <span>·</span>
            <span>{formatCost(run.cost)}</span>
            <span>·</span>
            <span>Standards: {run.soulFileVersion || '—'}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && run.toolCalls.length > 0 && (
        <div className='border-t border-border px-5 py-4'>
          <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Tool calls
          </p>
          <div className='space-y-2'>
            {run.toolCalls.map((call, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm'
              >
                {call.status === 'success' ? (
                  <Check className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                ) : (
                  <X className='h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                )}
                <Badge variant='gray' className='shrink-0'>
                  {call.tool}
                </Badge>
                <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                  {call.query}
                </span>
                <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                  {formatToolCallDuration(call.durationMs)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const StatusDot = ({ status }: { status: string }) => {
  if (status === 'running' || status === 'started') {
    return (
      <Loader2 className='mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-500' />
    )
  }
  return (
    <span
      className={cn(
        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
        status === 'completed'
          ? 'bg-green-500'
          : status === 'failed'
            ? 'bg-red-500'
            : 'bg-muted-foreground'
      )}
    />
  )
}

export default RunsView
