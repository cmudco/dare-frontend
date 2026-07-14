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
import { friendlyToolLabel } from '../Conversation/toolCallLabels'

interface ToolCallIndicatorProps {
  toolCalls: ToolCall[]
  className?: string
  /** Render live chips for each tool call while the message is streaming. */
  live?: boolean
}

/**
 * Displays tool call status and results in chat messages.
 * Shows a compact indicator during execution, expandable for details.
 * With `live`, each tool call also renders as a chip (spinner while
 * executing, check/error once its result arrives).
 */
export const ToolCallIndicator: React.FC<ToolCallIndicatorProps> = ({
  toolCalls,
  className = '',
  live = false,
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
        return (
          <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
        )
      case ToolCallStatus.COMPLETED:
        return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
      case ToolCallStatus.FAILED:
        return <XCircle className='h-3.5 w-3.5 text-destructive' />
      default:
        return <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
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
      <div className='mt-2 space-y-2 rounded-sm bg-muted p-2 text-xs text-muted-foreground'>
        <div className='flex items-start gap-2'>
          <FileText className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
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
              <span className='font-medium text-foreground'>
                {result.title || 'Fetched content'}
              </span>
            )}
            <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground'>
              {result.mediaType && <span>{result.mediaType}</span>}
              {retrievalStatus && <span>{retrievalStatus}</span>}
              {contentSize && <span>{contentSize}</span>}
              {result.retrievedAt && <span>{result.retrievedAt}</span>}
              {result.truncated && <span>truncated preview</span>}
            </div>
          </div>
        </div>

        {result.errorCode && (
          <div className='rounded-sm bg-destructive/10 p-2 text-destructive'>
            {result.errorCode}
          </div>
        )}

        {result.contentPreview && (
          <div className='max-h-60 overflow-auto rounded-sm bg-card p-2'>
            <pre className='m-0 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap'>
              {result.contentPreview}
            </pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`my-2 overflow-hidden rounded-lg bg-muted text-sm ${className}`}
    >
      {/* Compact header */}
      <button
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-muted-foreground transition-colors hover:bg-accent ${hasExecuting ? 'text-dare' : ''} ${hasError ? 'text-destructive' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className='flex items-center gap-2'>
          {hasExecuting ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : hasError ? (
            <XCircle className='h-3.5 w-3.5 text-destructive' />
          ) : (
            <CheckCircle className='h-3.5 w-3.5 text-green-500' />
          )}
          <span className='font-medium'>{getStatusText()}</span>
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Live tool chips - one per call, updating as results arrive */}
      {live && !isExpanded && (
        <div className='flex flex-wrap gap-1.5 px-3 pb-2'>
          {toolCalls.map((tc) => (
            <span
              key={tc.id}
              className='inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground'
            >
              {getStatusIcon(tc.status)}
              <span className='min-w-0 truncate'>
                {friendlyToolLabel(tc.toolName)}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className='space-y-1.5 border-t border-border p-2'>
          {toolCalls.map((tc) => {
            const result =
              tc.origin === ToolCallOrigin.DARE
                ? tc.dareResult
                : tc.providerResult || tc.mcpResult

            return (
              <div key={tc.id} className='rounded-md bg-card p-2'>
                <div className='flex min-w-0 flex-wrap items-center gap-2'>
                  {getStatusIcon(tc.status)}
                  <span className='flex min-w-0 flex-wrap items-center gap-1.5'>
                    <MCPServerLogo slug={tc.serverSlug} size={16} />
                    <span className='font-medium text-primary'>
                      {tc.serverSlug}
                    </span>
                    <span className='text-muted-foreground'>→</span>
                    <span className='min-w-0 font-mono break-all text-foreground'>
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
                    <div className='mt-2 max-h-80 overflow-auto rounded-sm bg-muted p-2'>
                      <pre className='m-0 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground'>
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}

                {/* Error display */}
                {tc.status === ToolCallStatus.FAILED && tc.error && (
                  <div className='mt-2 rounded-sm bg-destructive/10 p-2 text-xs text-destructive'>
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
