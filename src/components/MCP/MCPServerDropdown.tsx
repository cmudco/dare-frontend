import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getMcpServers,
  getMcpConnections,
  getMcpTools,
} from '@/redux/asyncThunks/mcp'
import { McpServer, McpTool } from '@/redux/types/mcp'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Check, Plus, Loader2, Settings } from 'lucide-react'

interface MCPServerDropdownProps {
  trigger: React.ReactNode
  onToolSelect: (server: McpServer, tool: McpTool) => void
  onConnectClick: (server: McpServer) => void
  onManageClick?: () => void
  align?: 'start' | 'center' | 'end'
}

export const MCPServerDropdown = ({
  trigger,
  onToolSelect,
  onConnectClick,
  onManageClick,
  align = 'start',
}: MCPServerDropdownProps) => {
  const dispatch = useAppDispatch()
  const { servers, connections, toolsByServer, toolsLoading, serversLoading } =
    useAppSelector((state) => state.mcp)

  useEffect(() => {
    if (servers.length === 0) {
      dispatch(getMcpServers())
    }
    if (connections.length === 0) {
      dispatch(getMcpConnections())
    }
  }, [servers.length, connections.length, dispatch])

  const isConnected = (serverSlug: string) =>
    connections.some((c) => c.server.slug === serverSlug && c.hasCredentials)

  const handleServerExpand = (serverSlug: string) => {
    if (isConnected(serverSlug) && !toolsByServer[serverSlug]) {
      dispatch(getMcpTools(serverSlug))
    }
  }

  const connectedServers = servers.filter((s) => isConnected(s.slug))
  const unconnectedServers = servers.filter((s) => !isConnected(s.slug))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className='w-64'>
        {serversLoading ? (
          <DropdownMenuItem disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Loading servers...
          </DropdownMenuItem>
        ) : servers.length === 0 ? (
          <DropdownMenuItem disabled>No MCP servers available</DropdownMenuItem>
        ) : (
          <>
            {/* Connected servers section */}
            {connectedServers.length > 0 && (
              <>
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  Connected
                </DropdownMenuLabel>
                {connectedServers.map((server) => (
                  <DropdownMenuSub key={server.slug}>
                    <DropdownMenuSubTrigger
                      onMouseEnter={() => handleServerExpand(server.slug)}
                      className='flex items-center gap-2'
                    >
                      <Check className='h-3 w-3 text-green-500' />
                      <span>{server.name}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className='w-56'>
                      {toolsLoading[server.slug] ? (
                        <DropdownMenuItem disabled>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Loading tools...
                        </DropdownMenuItem>
                      ) : toolsByServer[server.slug]?.length === 0 ? (
                        <DropdownMenuItem disabled>
                          No tools available
                        </DropdownMenuItem>
                      ) : (
                        <>
                          {toolsByServer[server.slug]?.map((tool) => (
                            <DropdownMenuItem
                              key={tool.name}
                              onClick={() => onToolSelect(server, tool)}
                            >
                              <div className='flex flex-col'>
                                <span className='font-medium'>{tool.name}</span>
                                {tool.description && (
                                  <span className='max-w-[200px] truncate text-xs text-muted-foreground'>
                                    {tool.description}
                                  </span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onConnectClick(server)}
                            className='text-muted-foreground'
                          >
                            <Settings className='mr-2 h-4 w-4' />
                            Manage connection
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                {unconnectedServers.length > 0 && <DropdownMenuSeparator />}
              </>
            )}

            {/* Unconnected servers section */}
            {unconnectedServers.length > 0 && (
              <>
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  Available
                </DropdownMenuLabel>
                {unconnectedServers.map((server) => (
                  <DropdownMenuItem
                    key={server.slug}
                    onClick={() => onConnectClick(server)}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    <div className='flex flex-col'>
                      <span>{server.name}</span>
                      {server.description && (
                        <span className='max-w-[180px] truncate text-xs text-muted-foreground'>
                          {server.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {/* Manage all connections */}
            {onManageClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onManageClick}>
                  <Settings className='mr-2 h-4 w-4' />
                  Manage connections
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
