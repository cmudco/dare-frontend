import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  formatRanAt,
  formatTokens,
  roleLabel,
  runStatusBadge,
} from '../../runFormat'
import type { AgentRun } from '../../types'
import StatusDot from './StatusDot'
import RoleIcon from './RoleIcon'

interface RunRowProps {
  run: AgentRun
  onOpen: () => void
}

// A run in the list. Clicking opens its full details.
const RunRow = ({ run, onOpen }: RunRowProps) => {
  const badge = runStatusBadge(run.status)
  return (
    <button
      onClick={onOpen}
      className='flex w-full items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent'
    >
      <StatusDot status={run.status} />
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 text-sm font-medium'>
            <RoleIcon role={run.role} />
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
          <span>{run.toolCalls.length} tool calls</span>
          <span>·</span>
          <span>{formatTokens(run.usage?.totalTokens)}</span>
        </div>
      </div>
      <ChevronRight className='mt-1 h-4 w-4 shrink-0 text-muted-foreground' />
    </button>
  )
}

export default RunRow
