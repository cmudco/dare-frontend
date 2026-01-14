import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createMcpConnection, testMcpConnection } from '@/redux/asyncThunks/mcp'
import { clearTestResult } from '@/redux/mcpSlice'
import { McpServer, CredentialSchema } from '@/redux/types/mcp'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface MCPConnectionModalProps {
  server: McpServer | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const MCPConnectionModal = ({
  server,
  isOpen,
  onClose,
  onSuccess,
}: MCPConnectionModalProps) => {
  const dispatch = useAppDispatch()
  const { connectionsLoading, testingConnection, testResult, connections } =
    useAppSelector((state) => state.mcp)

  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // Get existing connection if any
  const existingConnection = connections.find(
    (c) => c.server.slug === server?.slug
  )

  // Initialize credentials with empty values on server change
  useEffect(() => {
    if (server) {
      const initialCredentials: Record<string, string> = {}
      server.requiredCredentials.forEach((cred: CredentialSchema) => {
        initialCredentials[cred.key] = ''
      })
      setCredentials(initialCredentials)
      dispatch(clearTestResult())
    }
  }, [server, dispatch])

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!server) return

    // First save the credentials temporarily
    await dispatch(
      createMcpConnection({
        serverSlug: server.slug,
        credentials,
      })
    )

    // Then test the connection
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
      onSuccess?.()
      onClose()
    }
  }

  const handleClose = () => {
    dispatch(clearTestResult())
    onClose()
  }

  // Check if all required credentials are filled
  const allRequiredFilled = server?.requiredCredentials
    .filter((cred: CredentialSchema) => cred.required)
    .every((cred: CredentialSchema) => credentials[cred.key]?.trim())

  if (!server) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Connect to {server.name}</DialogTitle>
          <DialogDescription>{server.description}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Help URL */}
          {server.credentialsHelpUrl && (
            <a
              href={server.credentialsHelpUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline'
            >
              <ExternalLink className='h-4 w-4' />
              How to get your {server.name} credentials
            </a>
          )}

          {/* Setup Guide - Collapsible markdown section */}
          {server.setupGuide && (
            <div className='overflow-hidden rounded-lg border'>
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

          {/* Credential fields */}
          {server.requiredCredentials.map((cred: CredentialSchema) => (
            <div key={cred.key} className='space-y-2'>
              <Label htmlFor={cred.key}>
                {cred.label}
                {cred.required && <span className='ml-1 text-red-500'>*</span>}
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
                <p className='text-xs text-muted-foreground'>{cred.helpText}</p>
              )}
            </div>
          ))}

          {/* Test result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
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

          {/* Existing connection info */}
          {existingConnection && existingConnection.hasCredentials && (
            <p className='text-xs text-muted-foreground'>
              You already have credentials saved. Enter new values to update
              them.
            </p>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
