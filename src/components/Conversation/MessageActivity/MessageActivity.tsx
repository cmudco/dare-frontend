import React, { useEffect, useMemo, useState } from 'react'
import {
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Globe,
  Loader2,
  XCircle,
} from 'lucide-react'
import { ToolCallStatus, ToolLoopState } from '@/utils/constants/dareTools'
import type {
  Message,
  MemoryContextItem,
  WebSearchSource,
} from '@/redux/types/conversation'
import { getToolPresentation } from '@/utils/toolActivityPresentation'
import { ToolActivityRow } from '../ToolActivity/ToolActivityRow'
import { getStatusIcon } from '../ToolActivity/toolStatusIcon'
import { StepHeader, TimelineStep } from '../Timeline'
import { contextStageSteps, type ActivityStep } from './ContextStages'
import { contextSummaryPieces, formatMs } from './activitySummary'

interface MessageActivityProps {
  message: Message
}

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

/** One web source: linked title, domain, optional cited quote. */
const WebSourceRow: React.FC<{ source: WebSearchSource }> = ({ source }) => (
  <div className='py-0.5'>
    <div className='flex min-w-0 items-center justify-between gap-2'>
      <a
        href={source.url}
        target='_blank'
        rel='noopener noreferrer'
        className='group flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary'
      >
        <span className='truncate'>
          {source.title || getDomain(source.url)}
        </span>
        <ExternalLink className='h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
      </a>
      <span className='flex shrink-0 items-center gap-2 text-xs text-muted-foreground'>
        <span className='truncate'>{getDomain(source.url)}</span>
        {source.pageAge && <span>{source.pageAge}</span>}
      </span>
    </div>
    {source.citedText && (
      <p className='mt-0.5 line-clamp-2 text-xs text-muted-foreground'>
        {source.citedText}
      </p>
    )}
  </div>
)

/** One recalled memory: content preview plus its type badge. */
const MemoryRow: React.FC<{ item: MemoryContextItem }> = ({ item }) => (
  <div className='flex items-start justify-between gap-2 py-0.5'>
    <p className='line-clamp-2 min-w-0 flex-1 text-xs text-muted-foreground'>
      {item.content}
    </p>
    {item.memoryType && (
      <span className='shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
        {item.memoryType}
      </span>
    )}
  </div>
)

/**
 * The message's unified activity panel — everything the assistant did to
 * produce this answer, as one chronological timeline at the bottom of the
 * message:
 *
 *   context assembly (files read, RAG snippets, memory, history)
 *   → tool calls in loop order (tagged by round when the loop ran twice)
 *   → web sources and recalled memories
 *
 * While the turn is live the header is a shimmering status line naming the
 * current activity ("Searching the web…", "Creating your document… 2.1k
 * chars written"); when the turn finishes it settles into a one-line
 * summary. Expanding reveals the full lifecycle on a timeline rail.
 */
export const MessageActivity: React.FC<MessageActivityProps> = ({
  message,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toolCalls = useMemo(() => message.toolCalls ?? [], [message.toolCalls])
  const trace = message.contextTrace
  const webSources = message.webSearchSources ?? []
  const memories = message.memoryContextData ?? []
  const streaming = !!message.streaming
  const loopState = message.toolLoopState

  const orderedCalls = useMemo(
    () => [...toolCalls].sort((a, b) => (a.round ?? 1) - (b.round ?? 1)),
    [toolCalls]
  )
  const roundCount = new Set(orderedCalls.map((tc) => tc.round ?? 1)).size

  const activeCalls = toolCalls.filter(
    (tc) =>
      tc.status === ToolCallStatus.PENDING ||
      tc.status === ToolCallStatus.EXECUTING
  )
  const failedCalls = toolCalls.filter(
    (tc) => tc.status === ToolCallStatus.FAILED
  )
  const completedCalls = toolCalls.filter(
    (tc) => tc.status === ToolCallStatus.COMPLETED
  )
  const doneCount = failedCalls.length + completedCalls.length
  const lastFailedRound = Math.max(0, ...failedCalls.map((tc) => tc.round))
  const recovered =
    failedCalls.length > 0 &&
    completedCalls.some((tc) => tc.round > lastFailedRound)
  const interrupted = loopState === ToolLoopState.INTERRUPTED
  const capped = loopState === ToolLoopState.CAPPED
  const hasActive = activeCalls.length > 0
  const hasError = failedCalls.length > 0
  const live = streaming || hasActive

  useEffect(() => {
    if (interrupted || (!hasActive && hasError && !recovered)) {
      setIsExpanded(true)
    }
  }, [hasActive, hasError, interrupted, recovered])

  if (!trace?.stages.length && !toolCalls.length && !webSources.length) {
    return null
  }

  const renderLiveText = () => {
    if (activeCalls.length === 1) {
      const active = activeCalls[0]
      const presentation = getToolPresentation(active.toolName)
      const progress =
        active.status === ToolCallStatus.PENDING && active.argsChars
          ? ` · ${(active.argsChars / 1000).toFixed(1)}k chars`
          : ''
      const label =
        active.status === ToolCallStatus.PENDING
          ? presentation.pendingLabel
          : presentation.executingLabel
      return `${label}…${progress}`
    }
    if (activeCalls.length > 1) {
      return `Working across ${toolCalls.length} steps… ${doneCount} complete`
    }
    if (capped) return 'Finishing with the best available result…'
    return message.message ? 'Writing the answer…' : 'Thinking…'
  }

  const renderSummaryText = () => {
    if (interrupted) {
      return message.toolLoopNotice || 'The connection was interrupted'
    }
    const parts: string[] = trace ? contextSummaryPieces(trace) : []
    if (toolCalls.length) {
      const steps = `${toolCalls.length} step${toolCalls.length === 1 ? '' : 's'}`
      parts.push(
        roundCount > 1 ? `${steps} across ${roundCount} rounds` : steps
      )
    }
    if (webSources.length) {
      parts.push(
        `${webSources.length} web source${webSources.length === 1 ? '' : 's'}`
      )
    }
    let prefix = 'Gathered'
    if (recovered) prefix = 'Recovered — gathered'
    else if (hasError && completedCalls.length > 0) {
      prefix = `${failedCalls.length} tool issue${failedCalls.length === 1 ? '' : 's'} — gathered`
    } else if (hasError) {
      return 'Couldn’t complete the tool step'
    }
    const timing = trace ? ` in ${formatMs(trace.totalMs)}` : ''
    return `${prefix} ${parts.length ? parts.join(' · ') : 'context'}${timing}`
  }

  const renderStatusIcon = () => {
    if (live) {
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

  // The lifecycle, in the order it actually happened: context assembly,
  // then each tool call (loop order), then the answer's sources.
  const steps: ActivityStep[] = [
    ...(trace ? contextStageSteps(trace.stages) : []),
    ...orderedCalls.map((tc) => ({
      key: `tool-${tc.id}`,
      icon: getStatusIcon(tc.status),
      content: (
        <ToolActivityRow
          toolCall={tc}
          bare
          roundLabel={roundCount > 1 ? `round ${tc.round ?? 1}` : undefined}
        />
      ),
    })),
    ...(webSources.length
      ? [
          {
            key: 'web-sources',
            icon: <Globe className='h-3.5 w-3.5' />,
            content: (
              <>
                <StepHeader title='Web sources'>
                  <span className='font-normal text-muted-foreground'>
                    {webSources.length}
                  </span>
                </StepHeader>
                <div className='mt-1'>
                  {webSources.map((source) => (
                    <WebSourceRow key={source.id} source={source} />
                  ))}
                </div>
              </>
            ),
          },
        ]
      : []),
    ...(memories.length
      ? [
          {
            key: 'memories',
            icon: <Brain className='h-3.5 w-3.5' />,
            content: (
              <>
                <StepHeader title='Memories recalled'>
                  <span className='font-normal text-muted-foreground'>
                    {memories.length}
                  </span>
                </StepHeader>
                <div className='mt-1'>
                  {memories.map((item, index) => (
                    <MemoryRow key={index} item={item} />
                  ))}
                </div>
              </>
            ),
          },
        ]
      : []),
  ]

  return (
    <div
      className='my-2 overflow-hidden rounded-lg bg-muted text-sm'
      aria-busy={live}
    >
      <button
        type='button'
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-muted-foreground transition-colors hover:bg-accent ${!live && hasError && !recovered ? 'text-destructive' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className='flex min-w-0 items-center gap-2'>
          {renderStatusIcon()}
          <span
            className={`truncate font-medium ${live ? 'text-shimmer' : ''}`}
            aria-live='polite'
            aria-atomic='true'
          >
            {live ? renderLiveText() : renderSummaryText()}
          </span>
        </span>
        {isExpanded ? (
          <ChevronDown size={14} className='shrink-0' />
        ) : (
          <ChevronRight size={14} className='shrink-0' />
        )}
      </button>

      {isExpanded && (
        <div className='border-t border-border p-3'>
          {steps.map((step, index) => (
            <div
              key={step.key}
              className='animate-in duration-200 fade-in slide-in-from-top-1 motion-reduce:animate-none'
              style={{
                animationDelay: `${index * 40}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <TimelineStep
                icon={step.icon}
                isLast={index === steps.length - 1}
              >
                {step.content}
              </TimelineStep>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageActivity
