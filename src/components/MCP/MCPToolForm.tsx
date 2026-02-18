import { useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { executeMcpTool } from '@/redux/asyncThunks/mcp'
import {
  McpServer,
  McpTool,
  JsonSchema,
  JsonSchemaProperty,
} from '@/redux/types/mcp'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface MCPToolFormProps {
  server: McpServer | null
  tool: McpTool | null
  isOpen: boolean
  onClose: () => void
  onExecute?: (result: unknown) => void
}

export const MCPToolForm = ({
  server,
  tool,
  isOpen,
  onClose,
  onExecute,
}: MCPToolFormProps) => {
  const dispatch = useAppDispatch()
  const { executing } = useAppSelector((state) => state.mcp)

  const [args, setArgs] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  // Parse input schema
  const schema = useMemo(() => {
    if (!tool?.inputSchema) return null
    return tool.inputSchema as JsonSchema
  }, [tool])

  const properties = schema?.properties || {}
  const requiredFields = schema?.required || []

  const handleArgChange = (key: string, value: unknown) => {
    setArgs((prev) => ({ ...prev, [key]: value }))
  }

  const handleExecute = async () => {
    if (!server || !tool) return

    setError(null)
    setResult(null)

    const response = await dispatch(
      executeMcpTool({
        serverSlug: server.slug,
        toolName: tool.name,
        args,
      })
    )

    if (executeMcpTool.fulfilled.match(response)) {
      if (response.payload.success) {
        setResult(response.payload.result)
        onExecute?.(response.payload.result)
      } else {
        setError(response.payload.error || 'Execution failed')
      }
    } else {
      setError(response.payload as string)
    }
  }

  const handleClose = () => {
    setArgs({})
    setResult(null)
    setError(null)
    onClose()
  }

  const renderField = (key: string, prop: JsonSchemaProperty) => {
    const isRequired = requiredFields.includes(key)
    const value = args[key]

    // Handle enum (select)
    if (prop.enum && prop.enum.length > 0) {
      return (
        <div key={key} className='space-y-2'>
          <Label htmlFor={key}>
            {key}
            {isRequired && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Select
            value={value as string}
            onValueChange={(v) => handleArgChange(key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {prop.enum.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {prop.description && (
            <p className='text-xs text-muted-foreground'>{prop.description}</p>
          )}
        </div>
      )
    }

    // Handle boolean (checkbox)
    if (prop.type === 'boolean') {
      return (
        <div key={key} className='flex items-center space-x-2'>
          <Checkbox
            id={key}
            checked={value as boolean}
            onCheckedChange={(checked) => handleArgChange(key, checked)}
          />
          <Label htmlFor={key} className='cursor-pointer'>
            {key}
            {isRequired && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          {prop.description && (
            <span className='text-xs text-muted-foreground'>
              - {prop.description}
            </span>
          )}
        </div>
      )
    }

    // Handle number
    if (prop.type === 'number' || prop.type === 'integer') {
      return (
        <div key={key} className='space-y-2'>
          <Label htmlFor={key}>
            {key}
            {isRequired && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Input
            id={key}
            type='number'
            value={value as number}
            onChange={(e) =>
              handleArgChange(key, e.target.value ? Number(e.target.value) : '')
            }
            placeholder={prop.description || `Enter ${key}`}
          />
          {prop.description && (
            <p className='text-xs text-muted-foreground'>{prop.description}</p>
          )}
        </div>
      )
    }

    // Handle long text (use textarea if description suggests it)
    const isLongText =
      prop.description?.toLowerCase().includes('message') ||
      prop.description?.toLowerCase().includes('content') ||
      prop.description?.toLowerCase().includes('text') ||
      key.toLowerCase().includes('message') ||
      key.toLowerCase().includes('content') ||
      key.toLowerCase().includes('body')

    if (isLongText) {
      return (
        <div key={key} className='space-y-2'>
          <Label htmlFor={key}>
            {key}
            {isRequired && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Textarea
            id={key}
            value={value as string}
            onChange={(e) => handleArgChange(key, e.target.value)}
            placeholder={prop.description || `Enter ${key}`}
            rows={3}
          />
          {prop.description && (
            <p className='text-xs text-muted-foreground'>{prop.description}</p>
          )}
        </div>
      )
    }

    // Default: string input
    return (
      <div key={key} className='space-y-2'>
        <Label htmlFor={key}>
          {key}
          {isRequired && <span className='ml-1 text-red-500'>*</span>}
        </Label>
        <Input
          id={key}
          type='text'
          value={value as string}
          onChange={(e) => handleArgChange(key, e.target.value)}
          placeholder={prop.description || `Enter ${key}`}
        />
        {prop.description && (
          <p className='text-xs text-muted-foreground'>{prop.description}</p>
        )}
      </div>
    )
  }

  if (!server || !tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{tool.name}</DialogTitle>
          <DialogDescription>
            {tool.description || `Execute ${tool.name} on ${server.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {Object.keys(properties).length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              This tool does not require any arguments.
            </p>
          ) : (
            Object.entries(properties).map(([key, prop]) =>
              renderField(key, prop)
            )
          )}

          {/* Result display */}
          {result !== null && result !== undefined && (
            <div className='mt-4 rounded-md bg-muted p-3'>
              <Label className='mb-2 block text-xs text-muted-foreground'>
                Result
              </Label>
              <pre className='max-h-40 overflow-auto whitespace-pre-wrap text-sm'>
                {typeof result === 'string'
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className='mt-4 rounded-md bg-red-50 p-3 dark:bg-red-950'>
              <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handleExecute} disabled={executing}>
            {executing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Executing...
              </>
            ) : (
              'Execute'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
