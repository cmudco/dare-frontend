import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getMcpServers,
  getMcpConnections,
  getMcpTools,
  createMcpConnection,
  testMcpConnection,
} from '@/redux/asyncThunks/mcp'
import { clearTestResult } from '@/redux/mcpSlice'
import { CredentialSchema } from '@/redux/types/mcp'
import { MCPToolCard, MCPServerLogo } from '@/components/MCP'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react'

/**
 * MCPServerDetail - Server detail page with connection management and tools list
 */
const MCPServerDetail = () => {
  const { serverSlug } = useParams<{ serverSlug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    servers,
    connections,
    toolsByServer,
    toolsLoading,
    connectionsLoading,
    testingConnection,
    testResult,
  } = useAppSelector((state) => state.mcp)

  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const server = servers.find((s) => s.slug === serverSlug)
  const connection = connections.find((c) => c.server.slug === serverSlug)
  const isConnected = connection?.hasCredentials
  const tools = serverSlug ? toolsByServer[serverSlug] || [] : []
  const isLoadingTools = serverSlug ? toolsLoading[serverSlug] : false

  // Fetch data on mount
  useEffect(() => {
    dispatch(getMcpServers())
    dispatch(getMcpConnections())
  }, [dispatch])

  // Fetch tools when server is connected
  useEffect(() => {
    if (serverSlug && isConnected) {
      dispatch(getMcpTools(serverSlug))
    }
  }, [dispatch, serverSlug, isConnected])

  // Initialize credentials when server changes
  useEffect(() => {
    if (server) {
      const initial: Record<string, string> = {}
      server.requiredCredentials.forEach((cred: CredentialSchema) => {
        initial[cred.key] = ''
      })
      setCredentials(initial)
      dispatch(clearTestResult())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, server?.slug])

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!server) return
    await dispatch(
      createMcpConnection({
        serverSlug: server.slug,
        credentials,
      })
    )
    dispatch(testMcpConnection(server.slug))
  }

  const handleConnect = async () => {
    if (!server) return
    const result = await dispatch(
      createMcpConnection({
        serverSlug: server.slug,
        credentials,
      })
    )
    if (createMcpConnection.fulfilled.match(result)) {
      dispatch(getMcpConnections())
    }
  }

  const allRequiredFilled = server?.requiredCredentials
    .filter((cred: CredentialSchema) => cred.required)
    .every((cred: CredentialSchema) => credentials[cred.key]?.trim())

  if (!server) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-muted-foreground'>Server not found</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Back Button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/mcp')}
        className='mb-2'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to Servers
      </Button>

      {/* Server Header */}
      <div className='flex items-start gap-4'>
        <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-muted'>
          <MCPServerLogo slug={server.slug} size={40} />
        </div>
        <div className='flex-1'>
          <h2 className='text-2xl font-semibold'>{server.name}</h2>
          <p className='text-muted-foreground'>{server.description}</p>
        </div>
        {isConnected && (
          <span className='flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300'>
            <CheckCircle2 className='h-4 w-4' />
            Connected
          </span>
        )}
      </div>

      {/* Connection Section */}
      {!isConnected && (
        <div className='rounded-lg border bg-card p-6'>
          <h3 className='mb-4 text-lg font-medium'>Connect to {server.name}</h3>

          {/* Help URL */}
          {server.credentialsHelpUrl && (
            <a
              href={server.credentialsHelpUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='mb-4 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline'
            >
              <ExternalLink className='h-4 w-4' />
              How to get your {server.name} credentials
            </a>
          )}

          {/* Setup Guide */}
          {server.setupGuide && (
            <div className='mb-4 overflow-hidden rounded-lg border'>
              <button
                type='button'
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className='flex w-full items-center justify-between bg-muted/50 p-3 text-left transition-colors hover:bg-muted'
              >
                <div className='flex items-center gap-2'>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Setup Guide</span>
                </div>
                {showSetupGuide ? (
                  <ChevronUp className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                )}
              </button>
              {showSetupGuide && (
                <div className='max-h-64 overflow-y-auto bg-background p-4'>
                  <div className='prose prose-sm max-w-none dark:prose-invert'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {server.setupGuide}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credential Form */}
          <div className='space-y-4'>
            {server.requiredCredentials.map((cred: CredentialSchema) => (
              <div key={cred.key} className='space-y-2'>
                <Label htmlFor={cred.key}>
                  {cred.label}
                  {cred.required && (
                    <span className='ml-1 text-red-500'>*</span>
                  )}
                </Label>
                <Input
                  id={cred.key}
                  type={cred.type === 'password' ? 'password' : 'text'}
                  placeholder={cred.placeholder}
                  value={credentials[cred.key] || ''}
                  onChange={(e) =>
                    handleCredentialChange(cred.key, e.target.value)
                  }
                />
                {cred.helpText && (
                  <p className='text-xs text-muted-foreground'>
                    {cred.helpText}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-md p-3 text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className='h-4 w-4' />
              ) : (
                <XCircle className='h-4 w-4' />
              )}
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className='mt-6 flex gap-3'>
            <Button
              variant='secondary'
              onClick={handleTestConnection}
              disabled={
                !allRequiredFilled || testingConnection || connectionsLoading
              }
            >
              {testingConnection ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!allRequiredFilled || connectionsLoading}
            >
              {connectionsLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Tools Section */}
      {isConnected && (
        <div className='rounded-lg border bg-card p-6'>
          <h3 className='mb-4 text-lg font-medium'>Available Tools</h3>

          {isLoadingTools ? (
            <div className='flex h-32 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : tools.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground'>
              No tools available for this server
            </p>
          ) : (
            <div className='grid gap-3 sm:grid-cols-2'>
              {tools.map((tool) => (
                <MCPToolCard
                  key={tool.name}
                  tool={tool}
                  serverSlug={serverSlug!}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MCPServerDetail
