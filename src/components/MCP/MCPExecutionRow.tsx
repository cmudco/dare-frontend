import { McpToolExecution } from '@/redux/types/mcp'
import { ExecutionStatus } from '@/utils/constants/mcp'
import MCPStatusBadge from './MCPStatusBadge'
import MCPJsonViewer from './MCPJsonViewer'
import { Wrench, Calendar, Timer, AlertCircle } from 'lucide-react'

interface MCPExecutionRowProps {
  execution: McpToolExecution
}

/**
 * Format execution time in human readable format
 */
const formatExecutionTime = (ms: number | null): string => {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Format date in human readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than a minute
  if (diff < 60000) return 'Just now'
  // Less than an hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  // Less than a day
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  // Older
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Check if status is a failure status
 */
const isFailedStatus = (status: ExecutionStatus): boolean => {
  return status === ExecutionStatus.FAILED || status === ExecutionStatus.ERROR
}

/**
 * MCPExecutionRow - Single execution log entry
 */
const MCPExecutionRow = ({ execution }: MCPExecutionRowProps) => {
  return (
    <div className='rounded-lg border bg-card p-4 transition-colors hover:border-primary/30'>
      {/* Header */}
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted'>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>{execution.toolName}</span>
              <span className='text-xs text-muted-foreground'>on</span>
              <span className='text-sm font-medium text-primary'>
                {execution.serverName}
              </span>
            </div>
            <div className='flex items-center gap-3 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {formatDate(execution.createdAt)}
              </span>
              {execution.executionTimeMs !== null && (
                <span className='flex items-center gap-1'>
                  <Timer className='h-3 w-3' />
                  {formatExecutionTime(execution.executionTimeMs)}
                </span>
              )}
            </div>
          </div>
        </div>
        <MCPStatusBadge status={execution.status} />
      </div>

      {/* Arguments (collapsed by default) */}
      {Object.keys(execution.toolArguments).length > 0 && (
        <div className='mb-3'>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>
            Arguments
          </p>
          <div className='rounded-md bg-muted/50 p-2 text-xs'>
            <code className='text-foreground'>
              {JSON.stringify(execution.toolArguments, null, 2)}
            </code>
          </div>
        </div>
      )}

      {/* Result or Error */}
      {execution.status === ExecutionStatus.SUCCESS && execution.result && (
        <div>
          <p className='mb-1 text-xs font-medium text-muted-foreground'>
            Result
          </p>
          <MCPJsonViewer data={execution.result} />
        </div>
      )}

      {isFailedStatus(execution.status) && execution.errorMessage && (
        <div className='flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300'>
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
          <span>{execution.errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default MCPExecutionRow
