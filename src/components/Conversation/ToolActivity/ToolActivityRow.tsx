import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ToolCallOrigin, ToolCallStatus } from '@/utils/constants/dareTools'
import { getStatusIcon } from './toolStatusIcon'
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
  /**
   * Timeline mode: no card chrome and no leading status icon — the activity
   * timeline provides both (the rail circle shows the status).
   */
  bare?: boolean
  /** Muted tag after the status, e.g. "round 2" in multi-round turns. */
  roundLabel?: string
}

const ECHOED_ARTIFACT_CONFIG_KEYS = new Set([
  'chartConfig',
  'docConfig',
  'pptConfig',
])

const compactTechnicalResult = (result: unknown): unknown => {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return result
  }

  return Object.fromEntries(
    Object.entries(result).filter(
      ([key]) => !ECHOED_ARTIFACT_CONFIG_KEYS.has(key)
    )
  )
}

/**
 * One tool call inside the ToolActivity panel: status icon, server logo,
 * `serverSlug → toolName` label, and an expandable result/error detail.
 */
export const ToolActivityRow: React.FC<ToolActivityRowProps> = ({
  toolCall,
  bare = false,
  roundLabel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const result =
    toolCall.origin === ToolCallOrigin.DARE
      ? toolCall.dareResult
      : toolCall.providerResult || toolCall.mcpResult

  const presentation = getToolPresentation(toolCall.toolName)
  const sourceLabel = getToolSourceLabel(toolCall.serverSlug)
  const technicalResult =
    toolCall.origin === ToolCallOrigin.DARE
      ? compactTechnicalResult(result)
      : result

  const hasDetail =
    (toolCall.status === ToolCallStatus.COMPLETED && !!result) ||
    (toolCall.status === ToolCallStatus.FAILED && !!toolCall.error)

  return (
    <div
      className={
        bare
          ? 'min-w-0'
          : 'animate-in rounded-md bg-card p-2 duration-200 fade-in slide-in-from-top-1 motion-reduce:animate-none'
      }
    >
      <button
        type='button'
        className={`flex w-full items-center justify-between gap-2 border-none bg-transparent text-left ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => hasDetail && setIsExpanded(!isExpanded)}
        aria-expanded={hasDetail ? isExpanded : undefined}
      >
        <span className='flex min-w-0 flex-wrap items-center gap-2'>
          {!bare && getStatusIcon(toolCall.status)}
          <span className='flex min-w-0 flex-wrap items-center gap-1.5'>
            <MCPServerLogo slug={toolCall.serverSlug} size={16} />
            <span className='min-w-0 font-medium text-foreground'>
              {presentation.title}
            </span>
            <span className='text-muted-foreground'>·</span>
            <span className='text-xs text-muted-foreground'>
              {getToolStatusLabel(toolCall.status)}
            </span>
            {toolCall.status === ToolCallStatus.PENDING &&
              !!toolCall.argsChars && (
                <span className='text-xs text-muted-foreground tabular-nums'>
                  · {(toolCall.argsChars / 1000).toFixed(1)}k chars written
                </span>
              )}
            {roundLabel && (
              <span className='text-xs text-muted-foreground'>
                · {roundLabel}
              </span>
            )}
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
            {technicalResult != null && (
              <pre className='mt-2 max-h-64 overflow-auto rounded-sm bg-muted p-2 break-words whitespace-pre-wrap'>
                {JSON.stringify(technicalResult, null, 2)}
              </pre>
            )}
          </details>
        </>
      )}
    </div>
  )
}

export default ToolActivityRow
