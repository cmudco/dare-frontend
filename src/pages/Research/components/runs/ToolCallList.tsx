import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatToolCallDuration } from '../../runFormat'
import { ToolCallStatus } from '@/utils/constants/research'
import type { AgentRunToolCall } from '../../types'

interface ToolCallListProps {
  calls: AgentRunToolCall[]
  onOpen: (call: AgentRunToolCall) => void
}

// The audit list of a run's tool calls; each row opens its full detail modal.
const ToolCallList = ({ calls, onOpen }: ToolCallListProps) => (
  <div className='space-y-2'>
    {calls.map((call, i) => (
      <button
        key={i}
        type='button'
        onClick={() => onOpen(call)}
        title='View full input and result'
        className='w-full rounded-lg bg-muted/40 px-3 py-2 text-left text-sm transition-colors hover:bg-muted'
      >
        <div className='flex items-center gap-3'>
          {call.status === ToolCallStatus.SUCCESS ? (
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
          <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
            {formatToolCallDuration(call.durationMs)}
          </span>
        </div>
        {(call.error || call.resultSummary) && (
          <p
            className={cn(
              'mt-1 ml-7 line-clamp-2 text-xs break-all',
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
)

export default ToolCallList
