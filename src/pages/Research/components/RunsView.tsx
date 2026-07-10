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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  formatRanAt,
  formatRunDuration,
  formatTokens,
  formatToolCallDuration,
  roleLabel,
  runStatusBadge,
} from '../runFormat'
import type { AgentRun, AgentRunToolCall } from '../types'

/** Pretty-print a tool result when it's JSON; otherwise return it as-is. */
const prettify = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

// Full input/output of one tool call — what was actually searched and what
// actually came back, so a scholar can audit a run without trusting summaries.
const ToolCallModal = ({
  call,
  onClose,
}: {
  call: AgentRunToolCall | null
  onClose: () => void
}) => (
  <Dialog open={!!call} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className='flex h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0'>
      {call && (
        <>
          <DialogHeader className='shrink-0 space-y-0.5 border-b border-border px-5 py-3 pr-12 text-left'>
            <DialogTitle className='text-sm'>{call.tool}</DialogTitle>
            <p className='text-xs text-muted-foreground'>
              {call.status} · {formatToolCallDuration(call.durationMs)}
              {call.resultTokens != null &&
                ` · ${formatTokens(call.resultTokens)} added to context`}
            </p>
          </DialogHeader>
          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'>
            <div>
              <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Input
              </p>
              <pre className='whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3 text-xs'>
                {call.url || call.query || '—'}
              </pre>
            </div>
            {call.error && (
              <div>
                <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400'>
                  Error
                </p>
                <pre className='whitespace-pre-wrap break-all rounded-lg bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300'>
                  {call.error}
                </pre>
              </div>
            )}
            <div>
              <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Result
              </p>
              <pre className='whitespace-pre-wrap break-all rounded-lg bg-muted/40 p-3 text-xs'>
                {call.resultSummary
                  ? prettify(call.resultSummary)
                  : call.error
                    ? 'The call failed — see the error above.'
                    : 'No result captured — this is a native agent tool (e.g. web_search) that runs inside the agent loop and never passes through DARE’s gateway. Gateway tools (fetch_page, Scite, Consensus) record their full result here.'}
              </pre>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
)

const RunStats = ({ runs }: { runs: AgentRun[] }) => {
  const totalTokens = runs.reduce(
    (sum, r) => sum + (r.usage?.totalTokens ?? 0),
    0
  )
  const totalCalls = runs.reduce((sum, r) => sum + r.toolCalls.length, 0)
  const measured = runs.filter((r) => (r.usage?.totalTokens ?? 0) > 0)
  const avgTokens = measured.length
    ? Math.round(totalTokens / measured.length)
    : 0
  const stats = [
    { label: 'Runs', value: String(runs.length) },
    { label: 'Total tokens', value: formatTokens(totalTokens) },
    { label: 'Tool calls', value: String(totalCalls) },
    { label: 'Avg tokens / run', value: formatTokens(avgTokens) },
  ]
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {stats.map((s) => (
        <div
          key={s.label}
          className='rounded-xl border border-border bg-card px-4 py-3'
        >
          <p className='text-lg font-semibold tabular-nums tracking-tight'>
            {s.value}
          </p>
          <p className='text-xs text-muted-foreground'>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

const RunsView = ({ runs }: { runs: AgentRun[] }) => (
  <div className='space-y-6'>
    <header>
      <h2 className='text-xl font-semibold tracking-tight'>Runs</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Every delegated task sent to the agent harness — what it ran, which
        tools it used, and what it staged. Nothing here changed your record.
      </p>
    </header>

    {runs.length > 0 && <RunStats runs={runs} />}

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
  const [openCall, setOpenCall] = useState<AgentRunToolCall | null>(null)
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
            <span>{formatTokens(run.usage?.totalTokens)}</span>
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
              <button
                key={i}
                type='button'
                onClick={() => setOpenCall(call)}
                title='View full input and result'
                className='w-full rounded-lg bg-muted/40 px-3 py-2 text-left text-sm transition-colors hover:bg-muted'
              >
                <div className='flex items-center gap-3'>
                  {call.status === 'success' ? (
                    <Check className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                  ) : (
                    <X className='h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
                  )}
                  <Badge variant='gray' className='shrink-0'>
                    {call.tool}
                  </Badge>
                  <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                    {call.url || call.query}
                  </span>
                  {call.resultTokens != null && call.resultTokens > 0 && (
                    <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                      {formatTokens(call.resultTokens)}
                    </span>
                  )}
                  <span className='shrink-0 text-xs tabular-nums text-muted-foreground'>
                    {formatToolCallDuration(call.durationMs)}
                  </span>
                </div>
                {(call.error || call.resultSummary) && (
                  <p
                    className={cn(
                      'ml-7 mt-1 line-clamp-2 break-all text-xs',
                      call.error
                        ? 'text-red-600/90 dark:text-red-400/90'
                        : 'text-muted-foreground/80'
                    )}
                  >
                    {call.error || call.resultSummary}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <ToolCallModal call={openCall} onClose={() => setOpenCall(null)} />
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
