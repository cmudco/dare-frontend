import { useState, useEffect } from 'react'
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
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Wrench, Plus, Check, Loader2 } from 'lucide-react'

interface MCPToolCallButtonProps {
  onToolSelect: (server: McpServer, tool: McpTool) => void
  onConnectClick: (server: McpServer) => void
}

export const MCPToolCallButton = ({
  onToolSelect,
  onConnectClick,
}: MCPToolCallButtonProps) => {
  const dispatch = useAppDispatch()
  const { servers, connections, toolsByServer, toolsLoading, serversLoading } =
    useAppSelector((state) => state.mcp)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && servers.length === 0) {
      dispatch(getMcpServers())
      dispatch(getMcpConnections())
    }
  }, [isOpen, servers.length, dispatch])

  const isConnected = (serverSlug: string) =>
    connections.some((c) => c.server.slug === serverSlug && c.hasCredentials)

  const handleServerExpand = (serverSlug: string) => {
    if (isConnected(serverSlug) && !toolsByServer[serverSlug]) {
      dispatch(getMcpTools(serverSlug))
    }
  }

  const handleToolClick = (server: McpServer, tool: McpTool) => {
    setIsOpen(false)
    onToolSelect(server, tool)
  }

  const handleConnectClick = (server: McpServer) => {
    setIsOpen(false)
    onConnectClick(server)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' title='Tool Calls'>
          <Wrench className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        {serversLoading ? (
          <DropdownMenuItem disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Loading servers...
          </DropdownMenuItem>
        ) : servers.length === 0 ? (
          <DropdownMenuItem disabled>No MCP servers available</DropdownMenuItem>
        ) : (
          servers.map((server) => (
            <DropdownMenuSub key={server.slug}>
              <DropdownMenuSubTrigger
                onMouseEnter={() => handleServerExpand(server.slug)}
                className='flex items-center justify-between'
              >
                <span>{server.name}</span>
                {isConnected(server.slug) && (
                  <Check className='ml-2 h-3 w-3 text-green-500' />
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className='w-52'>
                {!isConnected(server.slug) ? (
                  <DropdownMenuItem onClick={() => handleConnectClick(server)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Connect to {server.name}
                  </DropdownMenuItem>
                ) : toolsLoading[server.slug] ? (
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
                        onClick={() => handleToolClick(server, tool)}
                      >
                        <div className='flex flex-col'>
                          <span className='font-medium'>{tool.name}</span>
                          {tool.description && (
                            <span className='max-w-[180px] truncate text-xs text-muted-foreground'>
                              {tool.description}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleConnectClick(server)}
                      className='text-muted-foreground'
                    >
                      Manage connection
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
