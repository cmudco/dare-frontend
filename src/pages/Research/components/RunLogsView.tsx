import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  RefreshCw,
  TimerReset,
  Wrench,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ResearchAgentRun } from '@/redux/types/research'
import {
  ResearchAgentOutputDestination,
  ResearchAgentRole,
  ResearchAgentRunStatus,
} from '@/utils/constants/research'

interface RunLogsViewProps {
  runs: ResearchAgentRun[]
  isLoading: boolean
  onRefresh?: () => void
}

const roleLabel = (role: ResearchAgentRole): string => {
  switch (role) {
    case ResearchAgentRole.MAIN_ASSISTANT:
      return 'Main Assistant'
    case ResearchAgentRole.SCOUT:
      return 'Scout'
    case ResearchAgentRole.LIBRARIAN:
      return 'Librarian'
    case ResearchAgentRole.PAPER_ASSISTANT:
      return 'Paper Assistant'
    case ResearchAgentRole.CRITIC:
      return 'Critic'
    case ResearchAgentRole.PRESENTATION_ASSISTANT:
      return 'Presentation Assistant'
  }
}

const destinationLabel = (
  destination: ResearchAgentOutputDestination
): string => {
  switch (destination) {
    case ResearchAgentOutputDestination.RUN_LOG:
      return 'Run log'
    case ResearchAgentOutputDestination.STAGING:
      return 'Staging'
    case ResearchAgentOutputDestination.REVIEW_METADATA:
      return 'Review metadata'
    case ResearchAgentOutputDestination.MEMORY_PROPOSALS:
      return 'Memory proposals'
    case ResearchAgentOutputDestination.ARTIFACT_PROPOSALS:
      return 'Artifact proposals'
  }
}

const statusLabel = (status: ResearchAgentRunStatus): string => {
  switch (status) {
    case ResearchAgentRunStatus.QUEUED:
      return 'Queued'
    case ResearchAgentRunStatus.RUNNING:
      return 'Running'
    case ResearchAgentRunStatus.SUCCEEDED:
      return 'Succeeded'
    case ResearchAgentRunStatus.FAILED:
      return 'Failed'
    case ResearchAgentRunStatus.CANCELLED:
      return 'Cancelled'
  }
}

const statusIcon = (status: ResearchAgentRunStatus) => {
  switch (status) {
    case ResearchAgentRunStatus.SUCCEEDED:
      return <CheckCircle2 className='h-4 w-4 text-green-600' />
    case ResearchAgentRunStatus.FAILED:
      return <AlertTriangle className='h-4 w-4 text-red-600' />
    case ResearchAgentRunStatus.CANCELLED:
      return <XCircle className='h-4 w-4 text-muted-foreground' />
    case ResearchAgentRunStatus.RUNNING:
      return <TimerReset className='h-4 w-4 text-blue-600' />
    case ResearchAgentRunStatus.QUEUED:
      return <CircleDashed className='h-4 w-4 text-amber-600' />
  }
}

const statusTone = (status: ResearchAgentRunStatus): string => {
  switch (status) {
    case ResearchAgentRunStatus.SUCCEEDED:
      return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300'
    case ResearchAgentRunStatus.FAILED:
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
    case ResearchAgentRunStatus.RUNNING:
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
    case ResearchAgentRunStatus.CANCELLED:
      return 'border-border bg-muted text-muted-foreground'
    case ResearchAgentRunStatus.QUEUED:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
  }
}

const formatDate = (value: string | null): string => {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const formatCost = (costUsd: string): string => {
  const parsed = Number(costUsd)
  if (!Number.isFinite(parsed) || parsed === 0) return '$0.000000'
  return `$${parsed.toFixed(6)}`
}

const RunLogsView = ({ runs, isLoading, onRefresh }: RunLogsViewProps) => {
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const selectedRun = useMemo(() => {
    if (runs.length === 0) return undefined
    return runs.find((run) => run.id === selectedRunId) ?? runs[0]
  }, [runs, selectedRunId])

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Run Logs</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Hermes audit records for delegated research roles.
          </p>
        </div>
        {onRefresh && (
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </header>

      <div className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
        Live role execution is not enabled yet. This view shows persisted run
        requests, Hermes callback status, tool calls, cost, errors, and the soul
        file version attached to each run.
      </div>

      {runs.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <Activity className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>No Hermes runs recorded</p>
          <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
            Run records will appear here once a role request is created or a
            Hermes callback arrives.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)]'>
          <div className='space-y-2'>
            {runs.map((run) => {
              const isSelected = selectedRun?.id === run.id
              return (
                <button
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-2'>
                      {statusIcon(run.status)}
                      <span className='truncate text-sm font-medium'>
                        {roleLabel(run.role)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        statusTone(run.status)
                      )}
                    >
                      {statusLabel(run.status)}
                    </span>
                  </div>
                  <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                    {run.task}
                  </p>
                  <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
                    <Clock3 className='h-3.5 w-3.5' />
                    <span>{formatDate(run.createdAt)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedRun && (
            <section className='rounded-lg border border-border bg-card p-5'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    {statusIcon(selectedRun.status)}
                    <span>{roleLabel(selectedRun.role)}</span>
                  </div>
                  <h3 className='mt-2 text-lg font-semibold tracking-tight'>
                    {selectedRun.task}
                  </h3>
                </div>
                <span
                  className={cn(
                    'w-fit rounded-full border px-2.5 py-1 text-xs font-medium',
                    statusTone(selectedRun.status)
                  )}
                >
                  {statusLabel(selectedRun.status)}
                </span>
              </div>

              <dl className='mt-5 grid gap-3 text-sm sm:grid-cols-2'>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Run ID
                  </dt>
                  <dd className='mt-1 break-all font-mono text-xs'>
                    {selectedRun.runId}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    External ID
                  </dt>
                  <dd className='mt-1 break-all font-mono text-xs'>
                    {selectedRun.externalRunId || 'Not assigned'}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Output
                  </dt>
                  <dd className='mt-1'>
                    {destinationLabel(selectedRun.outputDestination)}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Cost
                  </dt>
                  <dd className='mt-1 tabular-nums'>
                    {formatCost(selectedRun.costUsd)}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Queued
                  </dt>
                  <dd className='mt-1'>{formatDate(selectedRun.queuedAt)}</dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Completed
                  </dt>
                  <dd className='mt-1'>
                    {formatDate(selectedRun.completedAt)}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Tools
                  </dt>
                  <dd className='mt-1'>
                    {selectedRun.allowedTools.length > 0
                      ? selectedRun.allowedTools.join(', ')
                      : 'None selected'}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs uppercase text-muted-foreground'>
                    Soul File
                  </dt>
                  <dd className='mt-1'>
                    {selectedRun.soulFileTitle
                      ? `${selectedRun.soulFileTitle} v${selectedRun.soulFileVersionNumber ?? '-'}`
                      : 'Not attached'}
                  </dd>
                </div>
              </dl>

              {(selectedRun.statusMessage || selectedRun.errorMessage) && (
                <div className='mt-5 rounded-lg border border-border bg-muted/40 p-4 text-sm'>
                  {selectedRun.statusMessage && (
                    <p className='text-foreground'>
                      {selectedRun.statusMessage}
                    </p>
                  )}
                  {selectedRun.errorMessage && (
                    <p className='mt-2 text-red-600 dark:text-red-400'>
                      {selectedRun.errorMessage}
                    </p>
                  )}
                </div>
              )}

              <div className='mt-5'>
                <h4 className='text-sm font-medium'>Capability Policy</h4>
                <div className='mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2'>
                  <span>
                    Create staging:{' '}
                    {selectedRun.capabilityPolicy.canCreateStaging
                      ? 'yes'
                      : 'no'}
                  </span>
                  <span>
                    Review metadata:{' '}
                    {selectedRun.capabilityPolicy.canUpdateReviewMetadata
                      ? 'yes'
                      : 'no'}
                  </span>
                  <span>
                    Memory proposals:{' '}
                    {selectedRun.capabilityPolicy.canProposeMemory
                      ? 'yes'
                      : 'no'}
                  </span>
                  <span>
                    Artifact proposals:{' '}
                    {selectedRun.capabilityPolicy.canProposeArtifacts
                      ? 'yes'
                      : 'no'}
                  </span>
                  <span className='font-medium text-foreground'>
                    Approve knowledge:{' '}
                    {selectedRun.capabilityPolicy.canApproveKnowledge
                      ? 'yes'
                      : 'no'}
                  </span>
                </div>
              </div>

              <div className='mt-5'>
                <h4 className='text-sm font-medium'>Tool Calls</h4>
                {selectedRun.toolCalls.length === 0 ? (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    No tool calls recorded for this run.
                  </p>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {selectedRun.toolCalls.map((toolCall) => (
                      <div
                        key={toolCall.id}
                        className='rounded-lg border border-border bg-muted/30 p-3'
                      >
                        <div className='flex items-center justify-between gap-3 text-sm'>
                          <span className='flex min-w-0 items-center gap-2 font-medium'>
                            <Wrench className='h-4 w-4 shrink-0 text-muted-foreground' />
                            <span className='truncate'>
                              {toolCall.toolName}
                            </span>
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {toolCall.status}
                          </span>
                        </div>
                        {toolCall.inputSummary && (
                          <p className='mt-2 text-xs text-muted-foreground'>
                            {toolCall.inputSummary}
                          </p>
                        )}
                        {toolCall.outputSummary && (
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {toolCall.outputSummary}
                          </p>
                        )}
                        {toolCall.errorMessage && (
                          <p className='mt-1 text-xs text-red-600 dark:text-red-400'>
                            {toolCall.errorMessage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default RunLogsView
