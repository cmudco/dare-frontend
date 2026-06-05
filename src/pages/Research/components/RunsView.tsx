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
import { AGENT_RUNS } from '../mockData'
import type { AgentRun } from '../types'

const RunsView = () => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Runs</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Every delegated task sent to the agent harness — what it ran, which
        tools it used, and what it staged. Nothing here changed your record.
      </p>
    </header>

    <div className='space-y-3'>
      {AGENT_RUNS.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  </div>
)

const RunCard = ({ run }: { run: AgentRun }) => {
  const [expanded, setExpanded] = useState(false)

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
              {run.role === 'Critic' ? (
                <MessageCircleQuestion className='h-4 w-4 text-muted-foreground' />
              ) : (
                <Search className='h-4 w-4 text-muted-foreground' />
              )}
              {run.role}
            </span>
            <StatusBadge status={run.status} />
            <span className='text-xs text-muted-foreground'>{run.ranAt}</span>
          </div>
          <p className='truncate text-sm text-foreground/80'>{run.task}</p>
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
            <span>{run.tools.join(' · ')}</span>
            <span>·</span>
            <span>{run.stagedCount} staged</span>
            <span>·</span>
            <span>{run.durationLabel}</span>
            <span>·</span>
            <span>{run.costLabel}</span>
            <span>·</span>
            <span>Standards: {run.soulFileVersion}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
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
                  {call.durationLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const StatusDot = ({ status }: { status: AgentRun['status'] }) => {
  if (status === 'running') {
    return (
      <Loader2 className='mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-500' />
    )
  }
  return (
    <span
      className={cn(
        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
        status === 'completed' ? 'bg-green-500' : 'bg-red-500'
      )}
    />
  )
}

const StatusBadge = ({ status }: { status: AgentRun['status'] }) => {
  const map = {
    completed: { variant: 'green' as const, label: 'Completed' },
    running: { variant: 'yellow' as const, label: 'Running' },
    failed: { variant: 'red' as const, label: 'Failed' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export default RunsView
