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
import { MCPServerLogo } from '../../MCP/MCPServerLogo'
import { ProviderToolResultView } from './ProviderToolResultView'

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
            <span className='font-medium text-primary'>
              {toolCall.serverSlug}
            </span>
            <span className='text-muted-foreground'>→</span>
            <span className='min-w-0 font-mono break-all text-foreground'>
              {toolCall.toolName}
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
          {/* Provider-native result preview */}
          {toolCall.status === ToolCallStatus.COMPLETED &&
            toolCall.origin === ToolCallOrigin.PROVIDER &&
            toolCall.providerResult && (
              <ProviderToolResultView result={toolCall.providerResult} />
            )}

          {/* Result JSON - no truncation, with scroll */}
          {toolCall.status === ToolCallStatus.COMPLETED &&
            result &&
            toolCall.origin !== ToolCallOrigin.PROVIDER && (
              <div className='mt-2 max-h-80 overflow-auto rounded-sm bg-muted p-2'>
                <pre className='m-0 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground'>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

          {/* Error display */}
          {toolCall.status === ToolCallStatus.FAILED && toolCall.error && (
            <div className='mt-2 rounded-sm bg-destructive/10 p-2 text-xs text-destructive'>
              {toolCall.error}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ToolActivityRow
