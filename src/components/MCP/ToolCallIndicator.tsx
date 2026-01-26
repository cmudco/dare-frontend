import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Wrench,
} from 'lucide-react'
import { ToolCallStatus } from '@/utils/constants/dareTools'
import type { ToolCall } from '@/redux/types/conversation'
import { MCPServerLogo } from './MCPServerLogo'

interface ToolCallIndicatorProps {
  toolCalls: ToolCall[]
  className?: string
}

/**
 * Displays tool call status and results in chat messages.
 * Shows a compact indicator during execution, expandable for details.
 */
export const ToolCallIndicator: React.FC<ToolCallIndicatorProps> = ({
  toolCalls,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!toolCalls || toolCalls.length === 0) return null

  const hasExecuting = toolCalls.some(
    (tc) =>
      tc.status === ToolCallStatus.EXECUTING ||
      tc.status === ToolCallStatus.PENDING ||
      tc.status === ToolCallStatus.RUNNING
  )
  const hasError = toolCalls.some((tc) => tc.status === ToolCallStatus.FAILED)
  const allCompleted = toolCalls.every(
    (tc) => tc.status === ToolCallStatus.COMPLETED
  )

  const getStatusIcon = (status: ToolCallStatus) => {
    switch (status) {
      case ToolCallStatus.PENDING:
      case ToolCallStatus.EXECUTING:
      case ToolCallStatus.RUNNING:
        return <Loader2 className='h-3.5 w-3.5 animate-spin text-gray-400' />
      case ToolCallStatus.COMPLETED:
        return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
      case ToolCallStatus.FAILED:
        return <XCircle className='h-3.5 w-3.5 text-red-500' />
      default:
        return <Wrench className='h-3.5 w-3.5 text-gray-400' />
    }
  }

  const getStatusText = () => {
    if (hasExecuting)
      return `Using ${toolCalls.length} tool${toolCalls.length > 1 ? 's' : ''}...`
    if (hasError) return 'Tool execution failed'
    if (allCompleted)
      return `Used ${toolCalls.length} tool${toolCalls.length > 1 ? 's' : ''}`
    return 'Tools'
  }

  return (
    <div
      className={`my-2 overflow-hidden rounded-lg bg-gray-50 text-sm dark:bg-gray-800 ${className}`}
    >
      {/* Compact header */}
      <button
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 ${hasExecuting ? 'text-blue-500' : ''} ${hasError ? 'text-red-500' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className='flex items-center gap-2'>
          {hasExecuting ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : hasError ? (
            <XCircle className='h-3.5 w-3.5 text-red-500' />
          ) : (
            <CheckCircle className='h-3.5 w-3.5 text-green-500' />
          )}
          <span className='font-medium'>{getStatusText()}</span>
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className='space-y-1.5 border-t border-gray-200 p-2 dark:border-gray-700'>
          {toolCalls.map((tc) => {
            const result =
              tc.serverSlug === 'dare' ? tc.dareResult : tc.mcpResult

            return (
              <div
                key={tc.id}
                className='rounded-md bg-white p-2 dark:bg-gray-900'
              >
                <div className='flex items-center gap-2'>
                  {getStatusIcon(tc.status)}
                  <span className='flex items-center gap-1.5'>
                    <MCPServerLogo slug={tc.serverSlug} size={16} />
                    <span className='font-medium text-primary'>
                      {tc.serverSlug}
                    </span>
                    <span className='text-gray-400'>→</span>
                    <span className='font-mono text-gray-700 dark:text-gray-200'>
                      {tc.toolName}
                    </span>
                  </span>
                </div>

                {/* Result JSON - no truncation, with scroll */}
                {tc.status === ToolCallStatus.COMPLETED && result && (
                  <div className='mt-2 max-h-80 overflow-auto rounded bg-gray-50 p-2 dark:bg-gray-800'>
                    <pre className='m-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600 dark:text-gray-300'>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error display */}
                {tc.status === ToolCallStatus.FAILED && tc.error && (
                  <div className='mt-2 rounded bg-red-50 p-2 text-xs text-red-500 dark:bg-red-900/20'>
                    {tc.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ToolCallIndicator
