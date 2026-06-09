import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRanAt, runStatusBadge } from '../runFormat'
import type { AgentRun } from '../types'
import ScoutComposer from './ScoutComposer'

interface Props {
  tools: string[]
  runs: AgentRun[]
  scoutRunning: boolean
  pendingCount: number
  onRunScout: (query: string) => void
  onGoToReview: () => void
}

const AskScoutView = ({
  tools,
  runs,
  scoutRunning,
  pendingCount,
  onRunScout,
  onGoToReview,
}: Props) => {
  const recentRuns = runs.filter((r) => r.role === 'scout')

  return (
    <div className='space-y-6'>
      <header>
        <h2 className='text-xl font-semibold tracking-tight'>Ask Scout</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Pose a focused query, choose where Scout looks, and send it off.
          Findings land in your Review Inbox — never straight into the record.
        </p>
      </header>

      {pendingCount > 0 && (
        <div className='flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3'>
          <p className='text-sm text-muted-foreground'>
            {pendingCount} finding{pendingCount > 1 ? 's' : ''} waiting in your
            Review Inbox.
          </p>
          <Button size='sm' variant='outline' onClick={onGoToReview}>
            Review <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      )}

      <div className='rounded-2xl border border-border bg-card p-6'>
        <ScoutComposer
          tools={tools}
          running={scoutRunning}
          onRun={onRunScout}
        />
      </div>

      <section>
        <h3 className='mb-3 text-sm font-medium'>Recent Scout runs</h3>
        <div className='space-y-2'>
          {recentRuns.length === 0 && (
            <p className='text-sm text-muted-foreground'>No Scout runs yet.</p>
          )}
          {recentRuns.map((run) => {
            const badge = runStatusBadge(run.status)
            return (
              <div
                key={run.id}
                className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm'>{run.task}</p>
                  <p className='text-xs text-muted-foreground'>
                    {run.tools.join(' · ')} · {run.stagedCount} staged ·{' '}
                    {formatRanAt(run.ranAt)}
                  </p>
                </div>
                <Badge variant={badge.variant} className='shrink-0'>
                  {badge.label}
                </Badge>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AskScoutView
