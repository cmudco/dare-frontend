import { ExecutionStatus } from '@/utils/constants/mcp'
import { McpToolExecution } from '@/redux/types/mcp'
import { CheckCircle2, XCircle, Clock, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface MCPExecutionResultProps {
  execution?: McpToolExecution | null
  result?: unknown
  error?: string
  isLoading?: boolean
  className?: string
}

export const MCPExecutionResult = ({
  execution,
  result,
  error,
  isLoading,
  className = '',
}: MCPExecutionResultProps) => {
  const [copied, setCopied] = useState(false)

  // Use execution data if provided, otherwise use direct result/error
  const status = execution?.status
  const displayResult = execution?.result || result
  const displayError = execution?.errorMessage || error
  const executionTime = execution?.executionTimeMs

  const handleCopy = async () => {
    const textToCopy =
      typeof displayResult === 'string'
        ? displayResult
        : JSON.stringify(displayResult, null, 2)

    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-md bg-muted p-3 ${className}`}
      >
        <Clock className='h-4 w-4 animate-pulse text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>Executing...</span>
      </div>
    )
  }

  if (displayError || status === ExecutionStatus.ERROR) {
    return (
      <div className={`rounded-md bg-destructive/10 p-3 ${className}`}>
        <div className='mb-2 flex items-center gap-2'>
          <XCircle className='h-4 w-4 text-destructive' />
          <span className='text-sm font-medium text-destructive'>
            Execution Failed
          </span>
        </div>
        <p className='text-sm text-destructive'>{displayError}</p>
      </div>
    )
  }

  if (displayResult || status === ExecutionStatus.SUCCESS) {
    return (
      <div
        className={`rounded-md bg-green-50 p-3 dark:bg-green-950 ${className}`}
      >
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
            <span className='text-sm font-medium text-green-700 dark:text-green-300'>
              Success
            </span>
            {executionTime && (
              <span className='text-xs text-muted-foreground'>
                ({executionTime}ms)
              </span>
            )}
          </div>
          {displayResult !== null && displayResult !== undefined && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleCopy}
              className='h-6 px-2'
            >
              {copied ? (
                <Check className='h-3 w-3' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
          )}
        </div>
        {displayResult !== null && displayResult !== undefined && (
          <pre className='max-h-60 overflow-auto text-sm whitespace-pre-wrap text-green-800 dark:text-green-200'>
            {typeof displayResult === 'string'
              ? displayResult
              : JSON.stringify(displayResult, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  if (status === ExecutionStatus.PENDING) {
    return (
      <div
        className={`flex items-center gap-2 rounded-md bg-yellow-50 p-3 dark:bg-yellow-950 ${className}`}
      >
        <Clock className='h-4 w-4 text-yellow-500' />
        <span className='text-sm text-yellow-700 dark:text-yellow-300'>
          Pending...
        </span>
      </div>
    )
  }

  return null
}

/**
 * Compact inline version for displaying in conversation
 */
interface MCPExecutionInlineProps {
  toolName: string
  serverName: string
  status: ExecutionStatus
}

export const MCPExecutionInline = ({
  toolName,
  serverName,
  status,
}: MCPExecutionInlineProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case ExecutionStatus.SUCCESS:
        return CheckCircle2
      case ExecutionStatus.ERROR:
      case ExecutionStatus.FAILED:
        return XCircle
      case ExecutionStatus.RUNNING:
      case ExecutionStatus.PENDING:
      default:
        return Clock
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case ExecutionStatus.SUCCESS:
        return 'text-green-500'
      case ExecutionStatus.ERROR:
      case ExecutionStatus.FAILED:
        return 'text-destructive'
      case ExecutionStatus.RUNNING:
      case ExecutionStatus.PENDING:
      default:
        return 'text-yellow-500'
    }
  }

  const StatusIcon = getStatusIcon()
  const statusColor = getStatusColor()

  return (
    <div className='inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-sm'>
      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
      <span className='font-medium'>{toolName}</span>
      <span className='text-muted-foreground'>on {serverName}</span>
    </div>
  )
}
