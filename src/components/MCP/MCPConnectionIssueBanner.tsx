import { AlertTriangle, PlugZap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMcpReconnect } from '@/hooks/useMcpReconnect'
import { McpConnectionIssue } from '@/redux/types/mcp'
import { McpHealthStatus } from '@/utils/constants/mcp'

interface MCPConnectionIssueBannerProps {
  issues: McpConnectionIssue[]
}

/** Tells the user a selected integration was skipped this turn, with a one-click reconnect. */
export const MCPConnectionIssueBanner = ({
  issues,
}: MCPConnectionIssueBannerProps) => {
  const { reconnect, reconnecting } = useMcpReconnect()

  return (
    <div className='flex flex-col gap-2'>
      {issues.map((issue) => {
        const needsReauth = issue.status === McpHealthStatus.NEEDS_REAUTH
        return (
          <div
            key={issue.serverSlug}
            role='alert'
            className='flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='flex items-start gap-2'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' />
              <span className='text-foreground'>{issue.message}</span>
            </div>
            {needsReauth && (
              <Button
                size='sm'
                variant='outline'
                className='shrink-0'
                disabled={reconnecting}
                onClick={() => reconnect(issue.serverSlug, issue.authType)}
              >
                <PlugZap className='mr-1.5 h-3.5 w-3.5' />
                Reconnect {issue.serverName}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
