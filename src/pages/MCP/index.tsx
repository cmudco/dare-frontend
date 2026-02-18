import { useState, useEffect } from 'react'
import {
  MCPToolCallButton,
  MCPConnectionModal,
  MCPToolForm,
  MCPExecutionResult,
} from '@/components/MCP'
import { MCPServerDropdown } from '@/components/MCP/MCPServerDropdown'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getMcpServers, getMcpConnections } from '@/redux/asyncThunks/mcp'
import { McpServer, McpTool } from '@/redux/types/mcp'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Wrench, Plug, History } from 'lucide-react'

/**
 * MCP Playground - A page to explore and test MCP integrations
 */
const MCPPlayground = () => {
  const dispatch = useAppDispatch()
  const [selectedServer, setSelectedServer] = useState<McpServer | null>(null)
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showToolForm, setShowToolForm] = useState(false)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const mcpState = useAppSelector((state) => state.mcp)
  const servers = mcpState?.servers || []
  const connections = mcpState?.connections || []
  const executionHistory = mcpState?.executionHistory || []
  const executing = mcpState?.executing || false

  // Fetch servers and connections on mount
  useEffect(() => {
    dispatch(getMcpServers())
    dispatch(getMcpConnections())
  }, [dispatch])

  const handleToolSelect = (server: McpServer, tool: McpTool) => {
    setSelectedServer(server)
    setSelectedTool(tool)
    setShowToolForm(true)
  }

  const handleConnectClick = (server: McpServer) => {
    setSelectedServer(server)
    setShowConnectionModal(true)
  }

  const handleExecute = (result: unknown) => {
    setLastResult(result)
  }

  const connectedCount = connections.filter((c) => c.hasCredentials).length

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>MCP Playground</h1>
        <p className='text-muted-foreground'>
          Explore and test MCP (Model Context Protocol) integrations
        </p>
      </div>

      {/* Quick stats */}
      <div className='mb-8 grid grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Available Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{servers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-500'>
              {connectedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{executionHistory.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main action area */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Tool Call Button Demo */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wrench className='h-5 w-5' />
              Tool Call Button
            </CardTitle>
            <CardDescription>
              Click the button below to open the server/tool dropdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <MCPToolCallButton
                onToolSelect={handleToolSelect}
                onConnectClick={handleConnectClick}
              />
              <span className='text-sm text-muted-foreground'>
                ← Click the wrench icon
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Server Dropdown Demo */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plug className='h-5 w-5' />
              Server Dropdown
            </CardTitle>
            <CardDescription>
              A styled dropdown showing connected and available servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MCPServerDropdown
              trigger={
                <Button variant='outline'>
                  <Plug className='mr-2 h-4 w-4' />
                  Browse Servers
                </Button>
              }
              onToolSelect={handleToolSelect}
              onConnectClick={handleConnectClick}
            />
          </CardContent>
        </Card>
      </div>

      {/* Last execution result */}
      {lastResult !== null && (
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Last Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MCPExecutionResult result={lastResult} isLoading={executing} />
          </CardContent>
        </Card>
      )}

      {/* Servers list */}
      <Card>
        <CardHeader>
          <CardTitle>Available MCP Servers</CardTitle>
          <CardDescription>
            Click on a server to connect or view available tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground'>
              No MCP servers configured. Add servers in the admin panel.
            </p>
          ) : (
            <div className='space-y-3'>
              {servers.map((server) => {
                const connection = connections.find(
                  (c) => c.server.slug === server.slug
                )
                const isConnected = connection?.hasCredentials

                return (
                  <div
                    key={server.slug}
                    className='flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50'
                  >
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{server.name}</span>
                        {isConnected && (
                          <span className='rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300'>
                            Connected
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {server.description}
                      </p>
                    </div>
                    <Button
                      variant={isConnected ? 'outline' : 'default'}
                      size='sm'
                      onClick={() => handleConnectClick(server)}
                    >
                      {isConnected ? 'Manage' : 'Connect'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <MCPConnectionModal
        server={selectedServer}
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onSuccess={() => {
          // Optionally refresh or show success
        }}
      />

      <MCPToolForm
        server={selectedServer}
        tool={selectedTool}
        isOpen={showToolForm}
        onClose={() => setShowToolForm(false)}
        onExecute={handleExecute}
      />
    </div>
  )
}

export default MCPPlayground
