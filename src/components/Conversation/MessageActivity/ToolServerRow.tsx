import React from 'react'
import type { ToolServerReport } from '@/redux/types/conversation'
import { McpHealthStatus } from '@/utils/constants/mcp'
import { formatMs } from './activitySummary'

const SERVER_STATUS_LABELS: Partial<Record<McpHealthStatus, string>> = {
  [McpHealthStatus.NEEDS_REAUTH]: 'connection expired',
  [McpHealthStatus.UNREACHABLE]: 'not responding',
}

/** One MCP server's discovery outcome: name, result, elapsed time. */
export const ToolServerRow: React.FC<{ server: ToolServerReport }> = ({
  server,
}) => {
  const failed = server.status !== McpHealthStatus.HEALTHY
  return (
    <div className='flex items-center justify-between gap-2 text-xs text-muted-foreground'>
      <span className='min-w-0 truncate'>
        {server.name}
        <span className={failed ? 'text-destructive' : ''}>
          {' · '}
          {failed
            ? SERVER_STATUS_LABELS[server.status]
            : `${server.tools} tool${server.tools === 1 ? '' : 's'}`}
        </span>
      </span>
      <span className='shrink-0 tabular-nums'>{formatMs(server.ms)}</span>
    </div>
  )
}
