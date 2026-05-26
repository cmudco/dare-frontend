import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Wrench,
} from 'lucide-react'
import { ToolCallOrigin, ToolCallStatus } from '@/utils/constants/dareTools'
import type { ToolCall } from '@/redux/types/conversation'
import type { ProviderToolResult } from '@/redux/types/dareToolResults'
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

  const formatContentSize = (size?: number) => {
    if (!size) return null
    return `${size.toLocaleString()} chars`
  }

  const formatRetrievalStatus = (status?: string) => {
    if (!status) return null
    return status.replace(/^URL_RETRIEVAL_STATUS_/, '').toLowerCase()
  }

  const renderProviderResult = (result: ProviderToolResult) => {
    const contentSize = formatContentSize(result.contentSize)
    const retrievalStatus = formatRetrievalStatus(result.retrievalStatus)

    return (
      <div className='mt-2 space-y-2 rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
        <div className='flex items-start gap-2'>
          <FileText className='mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400' />
          <div className='min-w-0 flex-1'>
            {result.url ? (
              <a
                href={result.url}
                target='_blank'
                rel='noreferrer'
                className='inline-flex max-w-full items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                <span className='truncate'>{result.title || result.url}</span>
                <ExternalLink className='h-3 w-3 shrink-0' />
              </a>
            ) : (
              <span className='font-medium text-gray-700 dark:text-gray-200'>
                {result.title || 'Fetched content'}
              </span>
            )}
            <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400'>
              {result.mediaType && <span>{result.mediaType}</span>}
              {retrievalStatus && <span>{retrievalStatus}</span>}
              {contentSize && <span>{contentSize}</span>}
              {result.retrievedAt && <span>{result.retrievedAt}</span>}
              {result.truncated && <span>truncated preview</span>}
            </div>
          </div>
        </div>

        {result.errorCode && (
          <div className='rounded bg-red-50 p-2 text-red-500 dark:bg-red-900/20'>
            {result.errorCode}
          </div>
        )}

        {result.contentPreview && (
          <div className='max-h-60 overflow-auto rounded bg-white p-2 dark:bg-gray-900'>
            <pre className='m-0 whitespace-pre-wrap break-words text-xs leading-relaxed'>
              {result.contentPreview}
            </pre>
          </div>
        )}
      </div>
    )
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
              tc.origin === ToolCallOrigin.DARE
                ? tc.dareResult
                : tc.providerResult || tc.mcpResult

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
                {tc.status === ToolCallStatus.COMPLETED &&
                  tc.origin === ToolCallOrigin.PROVIDER &&
                  tc.providerResult &&
                  renderProviderResult(tc.providerResult)}

                {tc.status === ToolCallStatus.COMPLETED &&
                  result &&
                  tc.origin !== ToolCallOrigin.PROVIDER && (
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
