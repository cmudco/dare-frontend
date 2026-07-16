import { useState } from 'react'
import { ArrowLeft, Ban, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatCost,
  formatRanAt,
  formatRunDuration,
  formatTokens,
  roleLabel,
  runStatusBadge,
} from '../../runFormat'
import { AgentRunStatus, isRunInFlight } from '@/utils/constants/research'
import type { AgentRun, AgentRunToolCall } from '../../types'
import RoleIcon from './RoleIcon'
import RunSection from './RunSection'
import MetaItem from './MetaItem'
import CancellationPanel from './CancellationPanel'
import ToolCallList from './ToolCallList'
import ToolCallModal from './ToolCallModal'

interface RunDetailProps {
  run: AgentRun
  cancelling: boolean
  onBack: () => void
  onCancel: () => void
}

// Full audit of one run: metadata, the exact final response, cancellation, and
// every tool call. Presentational — its owner fetches/polls the run and owns
// the cancel action.
const RunDetail = ({ run, cancelling, onBack, onCancel }: RunDetailProps) => {
  const [openCall, setOpenCall] = useState<AgentRunToolCall | null>(null)

  const inFlight = isRunInFlight(run.status)
  const stopRequested =
    run.status === AgentRunStatus.STOPPING || !!run.cancellation
  const badge = runStatusBadge(run.status)
  const usage = run.usage || {}

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <button
          onClick={onBack}
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' /> Back to runs
        </button>
        {inFlight && (
          <Button
            variant='destructive'
            size='sm'
            disabled={cancelling || stopRequested}
            onClick={onCancel}
          >
            {cancelling || stopRequested ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' /> Stopping…
              </>
            ) : (
              <>
                <Ban className='h-4 w-4' /> Cancel run
              </>
            )}
          </Button>
        )}
      </div>

      <header className='space-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 text-sm font-medium'>
            <RoleIcon role={run.role} />
            {roleLabel(run.role)}
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className='text-xs text-muted-foreground'>
            {formatRanAt(run.ranAt)}
          </span>
        </div>
        <p className='text-sm text-foreground'>{run.task}</p>
        {run.statusDetail && (
          <p className='text-sm text-muted-foreground'>{run.statusDetail}</p>
        )}
      </header>

      <RunSection title='Run details'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          <MetaItem
            label='Input tokens'
            value={formatTokens(usage.inputTokens)}
          />
          <MetaItem
            label='Output tokens'
            value={formatTokens(usage.outputTokens)}
          />
          <MetaItem
            label='Total tokens'
            value={formatTokens(usage.totalTokens)}
          />
          <MetaItem label='Cost' value={formatCost(run.cost)} />
          <MetaItem
            label='Duration'
            value={formatRunDuration(run.startedAt, run.completedAt)}
          />
          <MetaItem label='Staged' value={String(run.stagedCount)} />
          <MetaItem label='Tools' value={run.tools.join(', ') || '—'} />
          <MetaItem label='Standards' value={run.soulFileVersion || '—'} />
          <MetaItem label='Tool calls' value={String(run.toolCalls.length)} />
        </div>
        {run.hermesRunId && (
          <p className='mt-3 font-mono text-xs break-all text-muted-foreground'>
            {run.hermesRunId}
          </p>
        )}
      </RunSection>

      {run.cancellation && (
        <CancellationPanel cancellation={run.cancellation} />
      )}

      <RunSection title='Final response'>
        {run.rawOutput ? (
          <pre className='max-h-[32rem] overflow-auto rounded-lg bg-muted/40 p-3 text-xs break-words whitespace-pre-wrap'>
            {run.rawOutput}
          </pre>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {inFlight
              ? 'The agent is still working — its final response will appear here.'
              : 'No final response captured. The runtime may no longer retain this run’s record.'}
          </p>
        )}
      </RunSection>

      {run.toolCalls.length > 0 && (
        <RunSection title={`Tool calls (${run.toolCalls.length})`}>
          <ToolCallList calls={run.toolCalls} onOpen={setOpenCall} />
        </RunSection>
      )}

      <ToolCallModal call={openCall} onClose={() => setOpenCall(null)} />
    </div>
  )
}

export default RunDetail
