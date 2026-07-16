import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentRunStatus } from '@/utils/constants/research'

const SPINNING: string[] = [
  AgentRunStatus.RUNNING,
  AgentRunStatus.STARTED,
  AgentRunStatus.STOPPING,
  AgentRunStatus.WAITING_FOR_APPROVAL,
]

// A small run-status indicator: a spinner while in flight, otherwise a colored
// dot (green completed, red failed, amber outcome-unknown, muted for the rest).
const StatusDot = ({ status }: { status: string }) => {
  if (SPINNING.includes(status)) {
    return (
      <Loader2 className='mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-500' />
    )
  }
  return (
    <span
      className={cn(
        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
        status === AgentRunStatus.COMPLETED
          ? 'bg-green-500'
          : status === AgentRunStatus.FAILED
            ? 'bg-red-500'
            : status === AgentRunStatus.OUTCOME_UNKNOWN
              ? 'bg-amber-500'
              : 'bg-muted-foreground'
      )}
    />
  )
}

export default StatusDot
