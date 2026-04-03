import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/redux/hooks'
import { McpServer } from '@/redux/types/mcp'
import { McpCatalogSlug } from '@/utils/constants/mcp'
import { MCPServerLogo } from './MCPServerLogo'

interface MCPServerCardProps {
  server: McpServer
}

/**
 * MCPServerCard - Display a single MCP server as a card
 */
const MCPServerCard = ({ server }: MCPServerCardProps) => {
  const navigate = useNavigate()
  const connections = useAppSelector((state) => state.mcp.connections)
  const user = useAppSelector((state) => state.user.user)

  const connection = connections.find((c) => c.server.slug === server.slug)
  const isSyftboxCard = server.slug === McpCatalogSlug.SYFTBOX
  const isConnected =
    Boolean(connection?.hasCredentials) ||
    (isSyftboxCard && Boolean(user?.isSyftboxFileStorage))

  return (
    <div
      onClick={() => navigate(`/mcp/${server.slug}`)}
      className='group cursor-pointer rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md'
    >
      {/* Header */}
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          {/* Server Logo */}
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
            <MCPServerLogo slug={server.slug} size={28} />
          </div>
          <div>
            <h3 className='font-semibold group-hover:text-primary'>
              {server.name}
            </h3>
            <span className='text-xs text-muted-foreground'>{server.slug}</span>
          </div>
        </div>

        {/* Connection Status Badge */}
        {isConnected ? (
          <span className='flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300'>
            <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
            Connected
          </span>
        ) : (
          <span className='rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
            Not connected
          </span>
        )}
      </div>

      {/* Description */}
      <p className='line-clamp-2 text-sm text-muted-foreground'>
        {server.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className='mt-4 flex items-center justify-between text-xs text-muted-foreground'>
        <span>
          {server.requiredCredentials?.length || 0} credentials required
        </span>
        <span className='text-primary opacity-0 transition-opacity group-hover:opacity-100'>
          View →
        </span>
      </div>
    </div>
  )
}

export default MCPServerCard
