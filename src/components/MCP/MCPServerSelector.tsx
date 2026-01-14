import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpServers, getMcpConnections } from '@/redux/asyncThunks/mcp'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Loader2, Plug, AlertCircle } from 'lucide-react'

interface MCPServerSelectorProps {
  selectedIds: number[]
  onChange: (serverIds: number[]) => void
  disabled?: boolean
}

/**
 * MCP Server Selector for conversation settings.
 *
 * Allows users to select which MCP servers should be enabled
 * for a conversation, making their tools available to the LLM.
 */
export const MCPServerSelector = ({
  selectedIds,
  onChange,
  disabled = false,
}: MCPServerSelectorProps) => {
  const dispatch = useAppDispatch()
  const { servers, connections, serversLoading } = useAppSelector(
    (state) => state.mcp
  )
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (servers.length === 0) {
      dispatch(getMcpServers())
    }
    if (connections.length === 0) {
      dispatch(getMcpConnections())
    }
  }, [servers.length, connections.length, dispatch])

  // Get connection status for a server
  const isConnected = (serverSlug: string) =>
    connections.some((c) => c.server.slug === serverSlug && c.hasCredentials)

  // Filter to only show connected servers
  const connectedServers = servers.filter((s) => isConnected(s.slug))

  // Toggle server selection
  const handleToggle = (serverId: number) => {
    if (selectedIds.includes(serverId)) {
      onChange(selectedIds.filter((id) => id !== serverId))
    } else {
      onChange([...selectedIds, serverId])
    }
  }

  // Get selected count for button label
  const selectedCount = selectedIds.length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant='outline'
          size='sm'
          className='h-8 gap-1 text-xs font-normal'
        >
          <Plug className='h-3.5 w-3.5' />
          {selectedCount > 0 ? (
            <span className='text-primary'>
              {selectedCount} server{selectedCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className='text-muted-foreground'>None</span>
          )}
          <ChevronDown className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {serversLoading ? (
          <DropdownMenuItem disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Loading servers...
          </DropdownMenuItem>
        ) : connectedServers.length === 0 ? (
          <div className='flex flex-col gap-2 p-3'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <AlertCircle className='h-4 w-4' />
              No connected servers
            </div>
            <p className='text-xs text-muted-foreground'>
              Connect to MCP servers in Settings &gt; MCP to enable tools for
              this conversation.
            </p>
          </div>
        ) : (
          <>
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Enable servers for this conversation
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {connectedServers.map((server) => (
              <DropdownMenuCheckboxItem
                key={server.id}
                checked={selectedIds.includes(server.id)}
                onCheckedChange={() => handleToggle(server.id)}
              >
                <div className='flex flex-col'>
                  <span className='font-medium'>{server.name}</span>
                  {server.description && (
                    <span className='max-w-[180px] truncate text-xs text-muted-foreground'>
                      {server.description}
                    </span>
                  )}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            {selectedCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onChange([])}
                  className='text-muted-foreground'
                >
                  Clear all
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MCPServerSelector
