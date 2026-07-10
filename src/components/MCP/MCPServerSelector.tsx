/**
 * MCPServerSelector Component
 *
 * Allows users to select which MCP servers are enabled for a conversation.
 * Styled consistently with DareToolSelector.
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpServers, getMcpConnections } from '@/redux/asyncThunks/mcp'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ChevronDown, Loader2, Plug, AlertCircle, Check } from 'lucide-react'
import { MCPServerLogo } from './MCPServerLogo'

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
  const [open, setOpen] = useState(false)

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

  /**
   * Get display label for the server selector button
   */
  const getDisplayLabel = (): string => {
    if (selectedCount === 0) return 'Servers'
    if (selectedCount === 1) {
      const server = connectedServers.find((s) => s.id === selectedIds[0])
      return server?.name || 'Server'
    }
    return `${selectedCount} Servers`
  }

  const displayLabel = getDisplayLabel()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-tour='mcp-servers'
          variant='ghost'
          size='sm'
          disabled={disabled}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-all ${
            selectedCount > 0
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          title='MCP Servers'
        >
          <Plug className='h-4 w-4' />
          <span>{displayLabel}</span>
          <ChevronDown className='h-3 w-3 opacity-60' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 rounded-xl border border-border bg-popover p-3 shadow-2xl'
        align='start'
      >
        <div className='mb-1.5 flex items-center gap-2'>
          <Plug className='h-[18px] w-[18px] text-primary' />
          <span className='text-sm font-semibold text-foreground'>
            MCP Servers
          </span>
        </div>
        <div className='mb-3 text-xs text-muted-foreground'>
          Enable servers for this conversation
        </div>

        {serversLoading ? (
          <div className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Loading servers...</span>
          </div>
        ) : connectedServers.length === 0 ? (
          <div className='flex flex-col gap-2 py-4'>
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
          <div className='flex flex-col gap-1'>
            {connectedServers.map((server) => {
              const isSelected = selectedIds.includes(server.id)
              return (
                <button
                  key={server.id}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-transparent hover:border-border hover:bg-accent'
                  }`}
                  onClick={() => handleToggle(server.id)}
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
                    <MCPServerLogo slug={server.slug} size={20} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-0.5 text-[13px] font-medium text-foreground'>
                      {server.name}
                    </div>
                    {server.description && (
                      <div className='line-clamp-2 text-[11px] leading-relaxed text-muted-foreground'>
                        {server.description}
                      </div>
                    )}
                  </div>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                    {isSelected && <Check className='h-4 w-4 text-primary' />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default MCPServerSelector
