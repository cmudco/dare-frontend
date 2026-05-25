import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createMcpServer,
  getMcpServers,
  getMcpConnections,
} from '@/redux/asyncThunks/mcp'
import { MCPServerCard } from '@/components/MCP'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { McpAuthType, McpTransport } from '@/utils/constants/mcp'
import { toast } from '@/utils/toast'

const DEFAULT_REMOTE_FORM = {
  name: '',
  slug: '',
  description: '',
  icon: 'mcp',
  remoteUrl: '',
  authType: McpAuthType.NONE,
  oauthAuthorizeUrl: '',
  oauthTokenUrl: '',
  oauthRegistrationUrl: '',
  oauthScope: '',
  oauthClientId: '',
  credentialsHelpUrl: '',
  setupGuide: '',
}

const MCP_SERVER_MANAGER_ROLES = new Set([
  'SUPERADMIN',
  'SUPERVISOR',
  'RESEARCHER',
])

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * MCPServerList - Grid of all available MCP servers
 */
const MCPServerList = () => {
  const dispatch = useAppDispatch()
  const { servers, serversLoading, connections } = useAppSelector(
    (state) => state.mcp
  )
  const user = useAppSelector((state) => state.user.user)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_REMOTE_FORM)

  const canManageServers = Boolean(
    user?.platformRole && MCP_SERVER_MANAGER_ROLES.has(user.platformRole)
  )
  const isCreating = serversLoading && isCreateOpen
  const requiresOAuthDetails = form.authType === McpAuthType.OAUTH2
  const canSubmit = useMemo(
    () =>
      Boolean(form.name.trim()) &&
      Boolean(form.slug.trim()) &&
      Boolean(form.remoteUrl.trim()),
    [form.name, form.remoteUrl, form.slug]
  )

  // Fetch data on mount
  useEffect(() => {
    dispatch(getMcpServers())
    dispatch(getMcpConnections())
  }, [dispatch])

  const connectedCount = connections.filter((c) => c.hasCredentials).length

  const updateForm = (key: keyof typeof DEFAULT_REMOTE_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || slugify(value),
    }))
  }

  const handleCreateServer = async () => {
    if (!canSubmit) return

    const result = await dispatch(
      createMcpServer({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        icon: form.icon.trim(),
        transport: McpTransport.STREAMABLE_HTTP,
        authType: form.authType,
        remoteUrl: form.remoteUrl.trim(),
        remoteHeaders: {},
        oauthAuthorizeUrl: form.oauthAuthorizeUrl.trim(),
        oauthTokenUrl: form.oauthTokenUrl.trim(),
        oauthRegistrationUrl: form.oauthRegistrationUrl.trim(),
        oauthScope: form.oauthScope.trim(),
        oauthClientId: form.oauthClientId.trim(),
        requiredCredentials:
          form.authType === McpAuthType.BEARER
            ? [
                {
                  key: 'api_key',
                  label: 'API Key / Bearer Token',
                  type: 'password',
                  required: true,
                  placeholder: 'Paste provider token',
                },
              ]
            : [],
        credentialsHelpUrl: form.credentialsHelpUrl.trim(),
        setupGuide: form.setupGuide.trim(),
        isActive: true,
      })
    )

    if (createMcpServer.fulfilled.match(result)) {
      setIsCreateOpen(false)
      setForm(DEFAULT_REMOTE_FORM)
      dispatch(getMcpServers())
      toast.success(`${result.payload.name} added to MCP servers`)
      return
    }

    toast.error(
      typeof result.payload === 'string'
        ? result.payload
        : 'Failed to add MCP server'
    )
  }

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
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-6 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground'>Available:</span>
            <span className='font-semibold'>{servers.length}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground'>Connected:</span>
            <span className='font-semibold text-green-600'>
              {connectedCount}
            </span>
          </div>
        </div>

        {canManageServers && (
          <Button size='sm' onClick={() => setIsCreateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Remote MCP
          </Button>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add Remote MCP Server</DialogTitle>
            <DialogDescription>
              Add a hosted Streamable HTTP MCP server to the curated catalog.
              Users will connect to it with the configured auth model.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='mcp-name'>Name</Label>
              <Input
                id='mcp-name'
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder='Example Research MCP'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='mcp-slug'>Slug</Label>
              <Input
                id='mcp-slug'
                value={form.slug}
                onChange={(event) =>
                  updateForm('slug', slugify(event.target.value))
                }
                placeholder='example-research'
              />
            </div>
            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='mcp-remote-url'>Remote MCP URL</Label>
              <Input
                id='mcp-remote-url'
                value={form.remoteUrl}
                onChange={(event) =>
                  updateForm('remoteUrl', event.target.value)
                }
                placeholder='https://example.com/mcp'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='mcp-auth-type'>Auth Type</Label>
              <Select
                value={form.authType}
                onValueChange={(value) =>
                  updateForm('authType', value as McpAuthType)
                }
              >
                <SelectTrigger id='mcp-auth-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={McpAuthType.NONE}>No auth</SelectItem>
                  <SelectItem value={McpAuthType.OAUTH2}>OAuth 2.0</SelectItem>
                  <SelectItem value={McpAuthType.BEARER}>
                    User bearer token
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='mcp-help-url'>Help URL</Label>
              <Input
                id='mcp-help-url'
                value={form.credentialsHelpUrl}
                onChange={(event) =>
                  updateForm('credentialsHelpUrl', event.target.value)
                }
                placeholder='https://docs.example.com/mcp'
              />
            </div>

            {requiresOAuthDetails && (
              <>
                <div className='space-y-2 sm:col-span-2'>
                  <Label htmlFor='mcp-oauth-registration'>
                    OAuth Registration URL
                  </Label>
                  <Input
                    id='mcp-oauth-registration'
                    value={form.oauthRegistrationUrl}
                    onChange={(event) =>
                      updateForm('oauthRegistrationUrl', event.target.value)
                    }
                    placeholder='https://example.com/oauth/register'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mcp-oauth-authorize'>
                    OAuth Authorize URL
                  </Label>
                  <Input
                    id='mcp-oauth-authorize'
                    value={form.oauthAuthorizeUrl}
                    onChange={(event) =>
                      updateForm('oauthAuthorizeUrl', event.target.value)
                    }
                    placeholder='https://example.com/oauth/authorize'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mcp-oauth-token'>OAuth Token URL</Label>
                  <Input
                    id='mcp-oauth-token'
                    value={form.oauthTokenUrl}
                    onChange={(event) =>
                      updateForm('oauthTokenUrl', event.target.value)
                    }
                    placeholder='https://example.com/oauth/token'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mcp-oauth-client-id'>OAuth Client ID</Label>
                  <Input
                    id='mcp-oauth-client-id'
                    value={form.oauthClientId}
                    onChange={(event) =>
                      updateForm('oauthClientId', event.target.value)
                    }
                    placeholder='Optional when dynamic registration exists'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mcp-oauth-scope'>OAuth Scope</Label>
                  <Input
                    id='mcp-oauth-scope'
                    value={form.oauthScope}
                    onChange={(event) =>
                      updateForm('oauthScope', event.target.value)
                    }
                    placeholder='mcp'
                  />
                </div>
              </>
            )}

            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='mcp-description'>Description</Label>
              <Textarea
                id='mcp-description'
                value={form.description}
                onChange={(event) =>
                  updateForm('description', event.target.value)
                }
                placeholder='What this MCP server lets users do'
              />
            </div>
            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='mcp-setup-guide'>Setup Guide</Label>
              <Textarea
                id='mcp-setup-guide'
                value={form.setupGuide}
                onChange={(event) =>
                  updateForm('setupGuide', event.target.value)
                }
                placeholder='Markdown instructions shown on the connection page'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateServer}
              disabled={!canSubmit || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Server
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
