import React, { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  CircleAlert,
} from 'lucide-react'
import { ToolCallStatus, ToolLoopState } from '@/utils/constants/dareTools'
import type { ToolCall } from '@/redux/types/conversation'
import { getToolPresentation } from '@/utils/toolActivityPresentation'
import { ToolActivityRow } from './ToolActivityRow'

interface ToolActivityProps {
  toolCalls: ToolCall[]
  streaming: boolean
  loopState?: ToolLoopState
  notice?: string
}

interface ToolCallRound {
  round: number
  calls: ToolCall[]
}

/**
 * Live tool-loop activity panel for an AI message.
 *
 * Collapsed by default: a chip header summarizes progress across all tool
 * calls (writing arguments, executing, done, failed). Expanding reveals one
 * row per call, grouped into rounds when the loop ran more than once.
 */
export const ToolActivity: React.FC<ToolActivityProps> = ({
  toolCalls,
  streaming,
  loopState,
  notice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const rounds: ToolCallRound[] = useMemo(() => {
    const byRound = new Map<number, ToolCall[]>()
    for (const tc of toolCalls) {
      const round = tc.round ?? 1
      const group = byRound.get(round)
      if (group) {
        group.push(tc)
      } else {
        byRound.set(round, [tc])
      }
    }
    return [...byRound.entries()]
      .sort(([a], [b]) => a - b)
      .map(([round, calls]) => ({ round, calls }))
  }, [toolCalls])

  const activeCalls = toolCalls.filter(
    (tc) =>
      tc.status === ToolCallStatus.PENDING ||
      tc.status === ToolCallStatus.EXECUTING
  )
  const hasActive = activeCalls.length > 0
  const hasError = toolCalls.some((tc) => tc.status === ToolCallStatus.FAILED)
  const failedCalls = toolCalls.filter(
    (tc) => tc.status === ToolCallStatus.FAILED
  )
  const completedCalls = toolCalls.filter(
    (tc) => tc.status === ToolCallStatus.COMPLETED
  )
  const lastFailedRound = Math.max(0, ...failedCalls.map((tc) => tc.round))
  const recovered =
    failedCalls.length > 0 &&
    completedCalls.some((tc) => tc.round > lastFailedRound)
  const interrupted = loopState === ToolLoopState.INTERRUPTED
  const capped = loopState === ToolLoopState.CAPPED
  const doneCount = toolCalls.filter(
    (tc) =>
      tc.status === ToolCallStatus.COMPLETED ||
      tc.status === ToolCallStatus.FAILED
  ).length

  useEffect(() => {
    if (interrupted || (!hasActive && hasError && !recovered)) {
      setIsExpanded(true)
    }
  }, [hasActive, hasError, interrupted, recovered])

  if (toolCalls.length === 0) return null

  const renderStatusText = () => {
    if (hasActive) {
      if (activeCalls.length === 1) {
        const active = activeCalls[0]
        const presentation = getToolPresentation(active.toolName)
        return active.status === ToolCallStatus.PENDING
          ? `${presentation.pendingLabel}…`
          : `${presentation.executingLabel}…`
      }
      return (
        <>
          Working across {toolCalls.length} steps…{' '}
          <span className='tabular-nums'>{doneCount} complete</span>
        </>
      )
    }
    if (capped) return <>Finishing with the best available result…</>
    if (interrupted) return <>{notice || 'The connection was interrupted'}</>
    if (recovered) return <>Recovered and completed {toolCalls.length} steps</>
    if (hasError && completedCalls.length > 0) {
      return (
        <>
          Completed with {failedCalls.length} tool issue
          {failedCalls.length === 1 ? '' : 's'}
        </>
      )
    }
    if (hasError) return <>Couldn’t complete the tool step</>
    return (
      <>
        Completed {toolCalls.length} step{toolCalls.length > 1 ? 's' : ''}
        {rounds.length > 1 && <> across {rounds.length} rounds</>}
      </>
    )
  }

  const renderStatusIcon = () => {
    if (hasActive) {
      return (
        <Loader2 className='h-3.5 w-3.5 animate-spin motion-reduce:animate-none' />
      )
    }
    if (capped || interrupted) {
      return <CircleAlert className='h-3.5 w-3.5 text-amber-500' />
    }
    if (hasError && !recovered) {
      return <XCircle className='h-3.5 w-3.5 text-destructive' />
    }
    return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
  }

  return (
    <div
      className='my-2 overflow-hidden rounded-lg bg-muted text-sm'
      aria-busy={streaming || hasActive}
    >
      {/* Collapsed chip header */}
      <button
        type='button'
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-muted-foreground transition-colors hover:bg-accent ${hasActive ? 'text-blue-500' : ''} ${!hasActive && hasError ? 'text-destructive' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className='flex items-center gap-2'>
          {renderStatusIcon()}
          <span className='font-medium' aria-live='polite' aria-atomic='true'>
            {renderStatusText()}
          </span>
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Expanded body: rows grouped by round */}
      {isExpanded && (
        <div className='space-y-1.5 border-t border-border p-2'>
          {rounds.map(({ round, calls }) => (
            <React.Fragment key={round}>
              {rounds.length > 1 && (
                <div className='flex items-center gap-2 pt-1 first:pt-0'>
                  <span className='h-px flex-1 bg-border' />
                  <span className='text-[10px] font-medium tracking-wider text-muted-foreground uppercase'>
                    Round {round}
                  </span>
                  <span className='h-px flex-1 bg-border' />
                </div>
              )}
              {calls.map((tc) => (
                <ToolActivityRow key={tc.id} toolCall={tc} />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export default ToolActivity
