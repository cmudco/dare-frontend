import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpServers, getMcpConnections } from '@/redux/asyncThunks/mcp'
import { MCPServerCard } from '@/components/MCP'
import { Loader2 } from 'lucide-react'

/**
 * MCPServerList - Grid of all available MCP servers
 */
const MCPServerList = () => {
  const dispatch = useAppDispatch()
  const { servers, serversLoading, connections } = useAppSelector(
    (state) => state.mcp
  )

  // Fetch data on mount
  useEffect(() => {
    dispatch(getMcpServers())
    dispatch(getMcpConnections())
  }, [dispatch])

  const connectedCount = connections.filter((c) => c.hasCredentials).length

  if (serversLoading && servers.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Stats Summary */}
      <div className='flex items-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Available:</span>
          <span className='font-semibold'>{servers.length}</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground'>Connected:</span>
          <span className='font-semibold text-green-600'>{connectedCount}</span>
        </div>
      </div>

      {/* Server Grid */}
      {servers.length === 0 ? (
        <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed'>
          <p className='text-muted-foreground'>No integrations available</p>
          <p className='text-sm text-muted-foreground'>
            Contact your admin to add MCP servers
          </p>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {servers.map((server) => (
            <MCPServerCard key={server.slug} server={server} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MCPServerList
