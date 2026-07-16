import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Wrench,
} from 'lucide-react'
import { ToolCallOrigin, ToolCallStatus } from '@/utils/constants/dareTools'
import type { ToolCall } from '@/redux/types/conversation'
import {
  getToolPresentation,
  getToolSourceLabel,
  getToolStatusLabel,
} from '@/utils/toolActivityPresentation'
import { MCPServerLogo } from '../../MCP/MCPServerLogo'
import { ToolResultPreview } from './ToolResultPreview'

interface ToolActivityRowProps {
  toolCall: ToolCall
}

const getStatusIcon = (status: ToolCallStatus) => {
  switch (status) {
    case ToolCallStatus.PENDING:
    case ToolCallStatus.EXECUTING:
      return (
        <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground motion-reduce:animate-none' />
      )
    case ToolCallStatus.COMPLETED:
      return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
    case ToolCallStatus.FAILED:
      return <XCircle className='h-3.5 w-3.5 text-destructive' />
    default:
      return <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
  }
}

/**
 * One tool call inside the ToolActivity panel: status icon, server logo,
 * `serverSlug → toolName` label, and an expandable result/error detail.
 */
export const ToolActivityRow: React.FC<ToolActivityRowProps> = ({
  toolCall,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const result =
    toolCall.origin === ToolCallOrigin.DARE
      ? toolCall.dareResult
      : toolCall.providerResult || toolCall.mcpResult

  const presentation = getToolPresentation(toolCall.toolName)
  const sourceLabel = getToolSourceLabel(toolCall.serverSlug)

  const hasDetail =
    (toolCall.status === ToolCallStatus.COMPLETED && !!result) ||
    (toolCall.status === ToolCallStatus.FAILED && !!toolCall.error)

  return (
    <div className='animate-in rounded-md bg-card p-2 duration-200 fade-in slide-in-from-top-1 motion-reduce:animate-none'>
      <button
        type='button'
        className={`flex w-full items-center justify-between gap-2 border-none bg-transparent text-left ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => hasDetail && setIsExpanded(!isExpanded)}
        aria-expanded={hasDetail ? isExpanded : undefined}
      >
        <span className='flex min-w-0 flex-wrap items-center gap-2'>
          {getStatusIcon(toolCall.status)}
          <span className='flex min-w-0 flex-wrap items-center gap-1.5'>
            <MCPServerLogo slug={toolCall.serverSlug} size={16} />
            <span className='min-w-0 font-medium text-foreground'>
              {presentation.title}
            </span>
            <span className='text-muted-foreground'>·</span>
            <span className='text-xs text-muted-foreground'>
              {getToolStatusLabel(toolCall.status)}
            </span>
          </span>
        </span>
        {hasDetail &&
          (isExpanded ? (
            <ChevronDown size={14} className='shrink-0' />
          ) : (
            <ChevronRight size={14} className='shrink-0' />
          ))}
      </button>

      {isExpanded && (
        <>
          {toolCall.status === ToolCallStatus.COMPLETED && (
            <ToolResultPreview toolCall={toolCall} />
          )}

          {/* Error display */}
          {toolCall.status === ToolCallStatus.FAILED && toolCall.error && (
            <div className='mt-2 rounded-sm bg-destructive/10 p-2 text-xs text-destructive'>
              {toolCall.error}
            </div>
          )}

          <details className='mt-2 text-xs text-muted-foreground'>
            <summary className='cursor-pointer font-medium'>
              Technical details
            </summary>
            <dl className='mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1'>
              <dt>Source</dt>
              <dd>{sourceLabel}</dd>
              <dt>Tool</dt>
              <dd className='font-mono break-all'>{toolCall.toolName}</dd>
              <dt>Round</dt>
              <dd>{toolCall.round}</dd>
              {toolCall.argsChars != null && (
                <>
                  <dt>Arguments</dt>
                  <dd>{toolCall.argsChars.toLocaleString()} characters</dd>
                </>
              )}
            </dl>
            {toolCall.arguments && (
              <pre className='mt-2 max-h-48 overflow-auto rounded-sm bg-muted p-2 break-words whitespace-pre-wrap'>
                {JSON.stringify(toolCall.arguments, null, 2)}
              </pre>
            )}
            {result && (
              <pre className='mt-2 max-h-64 overflow-auto rounded-sm bg-muted p-2 break-words whitespace-pre-wrap'>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </details>
        </>
      )}
    </div>
  )
}

export default ToolActivityRow
