import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getMcpServers,
  getMcpTools,
  executeMcpTool,
} from '@/redux/asyncThunks/mcp'
import { JsonSchemaProperty } from '@/redux/types/mcp'
import { MCPJsonViewer } from '@/components/MCP'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Play, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

/**
 * MCPToolExecute - Execute a tool with auto-generated form
 */
const MCPToolExecute = () => {
  const { serverSlug, toolName } = useParams<{
    serverSlug: string
    toolName: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { servers, toolsByServer, executing } = useAppSelector(
    (state) => state.mcp
  )

  const [args, setArgs] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const server = servers.find((s) => s.slug === serverSlug)
  const tools = serverSlug ? toolsByServer[serverSlug] || [] : []
  const tool = tools.find((t) => t.name === toolName)

  // Fetch data on mount
  useEffect(() => {
    dispatch(getMcpServers())
    if (serverSlug) {
      dispatch(getMcpTools(serverSlug))
    }
  }, [dispatch, serverSlug])

  // Initialize args from schema when tool changes
  useEffect(() => {
    if (tool?.inputSchema?.properties) {
      const initial: Record<string, unknown> = {}
      Object.entries(tool.inputSchema.properties).forEach(
        ([key, prop]: [string, JsonSchemaProperty]) => {
          if (prop.default !== undefined) {
            initial[key] = prop.default
          } else if (prop.type === 'boolean') {
            initial[key] = false
          } else {
            initial[key] = ''
          }
        }
      )
      setArgs(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.name])

  const handleArgChange = (key: string, value: unknown) => {
    setArgs((prev) => ({ ...prev, [key]: value }))
  }

  const handleExecute = async () => {
    if (!serverSlug || !toolName) return

    setResult(null)
    setError(null)

    const startTime = Date.now()

    try {
      const response = await dispatch(
        executeMcpTool({
          serverSlug,
          toolName,
          args,
        })
      ).unwrap()

      setExecutionTime(Date.now() - startTime)
      setResult(response)
    } catch (err) {
      setExecutionTime(Date.now() - startTime)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  if (!server || !tool) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const properties = tool.inputSchema?.properties || {}
  const required = tool.inputSchema?.required || []

  return (
    <div className='mx-auto max-w-3xl space-y-6'>
      {/* Back Button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate(`/mcp/${serverSlug}`)}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to {server.name}
      </Button>

      {/* Tool Header */}
      <div className='rounded-lg border bg-card p-6'>
        <div className='mb-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>{server.name}</span>
            <span>→</span>
          </div>
          <h2 className='text-2xl font-semibold'>{tool.name}</h2>
          <p className='text-muted-foreground'>{tool.description}</p>
        </div>

        {/* Arguments Form */}
        {Object.keys(properties).length > 0 && (
          <div className='space-y-4'>
            <h3 className='font-medium'>Arguments</h3>
            {Object.entries(properties).map(
              ([key, prop]: [string, JsonSchemaProperty]) => {
                const isRequired = required.includes(key)

                return (
                  <div key={key} className='space-y-2'>
                    <Label htmlFor={key}>
                      {key}
                      {isRequired && (
                        <span className='ml-1 text-red-500'>*</span>
                      )}
                    </Label>

                    {prop.enum ? (
                      <Select
                        value={String(args[key] || '')}
                        onValueChange={(value) => handleArgChange(key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {prop.enum.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : prop.type === 'boolean' ? (
                      <Select
                        value={String(args[key] || 'false')}
                        onValueChange={(value) =>
                          handleArgChange(key, value === 'true')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='true'>true</SelectItem>
                          <SelectItem value='false'>false</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : prop.type === 'object' || prop.type === 'array' ? (
                      <Textarea
                        id={key}
                        placeholder={`Enter JSON for ${key}`}
                        value={
                          typeof args[key] === 'string'
                            ? (args[key] as string)
                            : JSON.stringify(args[key], null, 2)
                        }
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            handleArgChange(key, parsed)
                          } catch {
                            handleArgChange(key, e.target.value)
                          }
                        }}
                        rows={4}
                      />
                    ) : (
                      <Input
                        id={key}
                        type={prop.type === 'number' ? 'number' : 'text'}
                        placeholder={prop.description || `Enter ${key}`}
                        value={String(args[key] || '')}
                        onChange={(e) =>
                          handleArgChange(
                            key,
                            prop.type === 'number'
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                      />
                    )}

                    {prop.description && (
                      <p className='text-xs text-muted-foreground'>
                        {prop.description}
                      </p>
                    )}
                  </div>
                )
              }
            )}
          </div>
        )}

        {/* Execute Button */}
        <div className='mt-6'>
          <Button
            onClick={handleExecute}
            disabled={executing}
            className='gap-2'
          >
            {executing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Executing...
              </>
            ) : (
              <>
                <Play className='h-4 w-4' />
                Execute
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Result Section */}
      {(result !== null || error) && (
        <div className='rounded-lg border bg-card p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='font-medium'>Result</h3>
            <div className='flex items-center gap-4 text-sm'>
              {executionTime !== null && (
                <span className='text-muted-foreground'>{executionTime}ms</span>
              )}
              {error ? (
                <span className='flex items-center gap-1 text-red-600'>
                  <XCircle className='h-4 w-4' />
                  Failed
                </span>
              ) : (
                <span className='flex items-center gap-1 text-green-600'>
                  <CheckCircle2 className='h-4 w-4' />
                  Success
                </span>
              )}
            </div>
          </div>

          {error ? (
            <div className='rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300'>
              {error}
            </div>
          ) : (
            <MCPJsonViewer data={result} />
          )}
        </div>
      )}
    </div>
  )
}

export default MCPToolExecute
