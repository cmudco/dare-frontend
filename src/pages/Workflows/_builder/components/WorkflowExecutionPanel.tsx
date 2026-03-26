/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Single source of truth: all execution data read from currentRun.nodeStates.
 * During streaming, nodeStates[nodeId].response accumulates token-by-token.
 * After completion, the same field holds the final response.
 *
 * Features:
 * - Live streaming LLM responses with markdown rendering
 * - Rich content: snippets, web search sources, code blocks
 * - Human validation UI when required
 * - Connection status indicator
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { Loader2, X, Play, History, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  setShowExecutionPanel,
  setSelectedBatchRunId,
} from '@/redux/workflowBuilderSlice'
import { workflowSocketSubscribe } from '@/redux/middleware/workflowSocketMiddleware'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import { ValidationPanel } from './ValidationPanel'
import { StepResponseCard } from './StepResponseCard'
import { ConnectionIndicator } from './ConnectionIndicator'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'

export default function WorkflowExecutionPanel() {
  const dispatch = useAppDispatch()

  const {
    currentRun,
    isRunning,
    activeNodeId,
    wsConnectionStatus,
    pendingValidation,
    nodes,
    batchRun,
  } = useAppSelector((state) => state.workflowBuilder)

  const {
    containerRef,
    anchorRef,
    showScrollButton,
    forceScrollToBottom,
    scrollToBottom,
    handleScrollToBottomClick,
  } = useAutoScroll()

  const shouldShowBatch = batchRun.latestRunIsBatch
  const lastBatchRunId =
    [...batchRun.fileStatuses].reverse().find((status) => status.workflowRunId)
      ?.workflowRunId ?? null
  const effectiveBatchRunId = batchRun.selectedRunId ?? lastBatchRunId

  const selectedBatchRun =
    effectiveBatchRunId && batchRun.runsById[effectiveBatchRunId]
      ? batchRun.runsById[effectiveBatchRunId]
      : null

  const displayRun = shouldShowBatch ? selectedBatchRun : currentRun
  const displayActiveNodeId = shouldShowBatch
    ? effectiveBatchRunId
      ? batchRun.activeNodeIds[effectiveBatchRunId] || null
      : null
    : activeNodeId
  const displayPendingValidation = shouldShowBatch ? null : pendingValidation

  const batchRunOptions = shouldShowBatch
    ? batchRun.fileStatuses.filter((status) => status.workflowRunId)
    : []

  const lastSubscribedRunIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!shouldShowBatch || !effectiveBatchRunId) return

    const run = batchRun.runsById[effectiveBatchRunId]
    const hasNodeStates = Boolean(
      run?.nodeStates && Object.keys(run.nodeStates).length
    )
    if (
      !hasNodeStates &&
      lastSubscribedRunIdRef.current !== effectiveBatchRunId
    ) {
      lastSubscribedRunIdRef.current = effectiveBatchRunId
      dispatch(workflowSocketSubscribe(effectiveBatchRunId))
    }
  }, [shouldShowBatch, effectiveBatchRunId, batchRun.runsById, dispatch])

  const prevRunIdRef = useRef<number | undefined>(displayRun?.id)

  // Force scroll on new run start
  useEffect(() => {
    if (displayRun?.id !== prevRunIdRef.current) {
      prevRunIdRef.current = displayRun?.id
      forceScrollToBottom('auto')
    }
  }, [displayRun?.id, forceScrollToBottom])

  // Auto-scroll during streaming
  useEffect(() => {
    if (displayActiveNodeId) {
      scrollToBottom('auto')
    }
  }, [displayRun?.nodeStates, displayActiveNodeId, scrollToBottom])

  // Force scroll when validation appears
  useEffect(() => {
    if (displayPendingValidation) {
      forceScrollToBottom('smooth')
    }
  }, [displayPendingValidation, forceScrollToBottom])

  const handleClose = useCallback(() => {
    dispatch(setShowExecutionPanel(false))
  }, [dispatch])

  const getNodeName = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      const label = (node?.data as { label?: string })?.label
      if (label && label !== node?.type) {
        return label
      }
      if (node?.type === WorkflowNodeType.File) return 'File'
      return node?.type || 'step'
    },
    [nodes]
  )

  const labelByNodeId = useMemo(() => {
    const map = new Map<string, string>()
    for (const node of nodes) {
      const label = (node.data as { label?: string })?.label
      if (label) {
        map.set(node.id, label)
      }
    }
    return map
  }, [nodes])

  // Derive execution node entries from the single source: currentRun.nodeStates
  const executionNodeEntries = displayRun?.nodeStates
    ? Object.entries(displayRun.nodeStates).filter(
        ([, state]) =>
          state.response &&
          (state.nodeType === WorkflowNodeType.Step ||
            state.nodeType === WorkflowNodeType.StructuredOutput ||
            state.nodeType === WorkflowNodeType.File)
      )
    : []

  // Execution panel should reflect actual start order; keep deterministic fallbacks.
  const sortedExecutionNodeEntries = useMemo(() => {
    if (!executionNodeEntries.length) return executionNodeEntries
    // Sort by actual execution start time; fall back to step number then node ID.
    return [...executionNodeEntries].sort(([aId, aState], [bId, bState]) => {
      // Normalize timestamps; invalid/missing values become null.
      const aStartedRaw = aState.startedAt ? Date.parse(aState.startedAt) : NaN
      const bStartedRaw = bState.startedAt ? Date.parse(bState.startedAt) : NaN
      const aStarted = Number.isNaN(aStartedRaw) ? null : aStartedRaw
      const bStarted = Number.isNaN(bStartedRaw) ? null : bStartedRaw

      // Primary: earliest started first (actual execution order).
      if (aStarted !== null && bStarted !== null && aStarted !== bStarted) {
        return aStarted - bStarted
      }
      // Prefer nodes with a known start time over missing timestamps.
      if (aStarted !== null && bStarted === null) return -1
      if (aStarted === null && bStarted !== null) return 1

      // Secondary: label for stable ordering (natural string sort).
      const aLabel = labelByNodeId.get(aId)
      const bLabel = labelByNodeId.get(bId)
      if (aLabel && bLabel && aLabel !== bLabel) {
        return aLabel.localeCompare(bLabel, undefined, { numeric: true })
      }

      // Final tie-breaker: node ID for deterministic output.
      return aId.localeCompare(bId)
    })
  }, [executionNodeEntries, labelByNodeId])

  const hasDisplayData = executionNodeEntries.length > 0
  const isViewingCompletedRun =
    !isRunning && displayRun?.status === WorkflowRunStepStatus.Completed
  const isWaiting =
    isRunning &&
    !hasDisplayData &&
    !displayActiveNodeId &&
    !displayPendingValidation

  const statusText = isRunning
    ? displayActiveNodeId
      ? 'Streaming response...'
      : 'Workflow running...'
    : displayPendingValidation
      ? 'Awaiting validation'
      : isViewingCompletedRun
        ? 'Viewing results'
        : 'Ready'

  return (
    <div className='absolute inset-x-0 bottom-4 top-10 z-20 ml-auto flex w-[90%] max-w-[45vw] flex-col rounded-2xl border border-border/30 bg-white/95 shadow-2xl backdrop-blur-sm'>
      {/* Header */}
      <div className='flex items-center justify-between rounded-t-2xl border-b border-border/50 bg-gradient-to-r from-slate-50 to-white p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>
            {isViewingCompletedRun ? 'Run Results' : 'Execution Preview'}
          </h3>
          <p className='text-xs text-muted-foreground'>{statusText}</p>
        </div>
        {shouldShowBatch && batchRunOptions.length > 0 && (
          <div className='min-w-[180px]'>
            <Select
              value={effectiveBatchRunId ? effectiveBatchRunId.toString() : ''}
              onValueChange={(value) => {
                dispatch(setSelectedBatchRunId(Number(value)))
              }}
            >
              <SelectTrigger className='h-8 bg-background text-xs'>
                <SelectValue placeholder='Select batch run' />
              </SelectTrigger>
              <SelectContent>
                {batchRunOptions.map((status) => (
                  <SelectItem
                    key={status.workflowRunId}
                    value={String(status.workflowRunId)}
                  >
                    {status.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className='flex items-center gap-2'>
          <ConnectionIndicator status={wsConnectionStatus} />
          <Button variant='ghost' size='sm' onClick={handleClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={containerRef} className='flex-1 overflow-y-auto p-4'>
        {/* Human Validation UI */}
        {displayPendingValidation && (
          <ValidationPanel
            validation={displayPendingValidation}
            workflowRunId={displayRun?.id}
            nodeName={getNodeName(displayPendingValidation.nodeId)}
          />
        )}

        {/* Empty state */}
        {!hasDisplayData && !pendingValidation && !isRunning && (
          <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
            <Play className='mb-2 h-12 w-12 opacity-30' />
            <p className='text-sm'>Preview your workflow</p>
            <p className='text-xs'>Click Run to see execution in real-time</p>
          </div>
        )}

        {/* Loading state */}
        {isWaiting && (
          <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
            <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-500' />
            <p className='text-sm'>Starting workflow...</p>
          </div>
        )}

        {/* Completed run indicator */}
        {isViewingCompletedRun && (
          <div className='mb-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2'>
            <History className='h-4 w-4 text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>
              Showing results from previous run
            </span>
          </div>
        )}

        {/* Execution node responses — single render block from nodeStates */}
        {hasDisplayData && (
          <div className='space-y-4'>
            {sortedExecutionNodeEntries.map(([nodeId, state]) => (
              <StepResponseCard
                key={nodeId}
                nodeId={nodeId}
                nodeName={getNodeName(nodeId)}
                label={
                  (
                    nodes.find((n) => n.id === nodeId)?.data as {
                      label?: string
                    }
                  )?.label
                }
                nodeType={nodes.find((n) => n.id === nodeId)?.type}
                content={state.response || ''}
                isActive={displayActiveNodeId === nodeId}
                snippets={state.snippets}
                webSearchSources={state.webSearchSources}
              />
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={anchorRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottomClick}
          className='absolute bottom-20 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90'
          aria-label='Scroll to bottom'
        >
          <ChevronDown className='h-4 w-4' />
        </button>
      )}

      {/* Footer */}
      {displayRun && (
        <div className='rounded-b-2xl border-t border-border/50 bg-gradient-to-r from-slate-50 to-white p-3'>
          <div className='flex items-center justify-end text-xs text-muted-foreground'>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                displayRun.status === WorkflowRunStepStatus.Completed &&
                  'bg-[#023572]/10 text-[#023572]',
                displayRun.status === WorkflowRunStepStatus.Running &&
                  'bg-[#EE183C]/10 text-[#EE183C]',
                displayRun.status === WorkflowRunStepStatus.Failed &&
                  'bg-red-100 text-red-700',
                displayRun.status === WorkflowRunStepStatus.PendingHumanInput &&
                  'bg-[#EE183C]/10 text-[#EE183C]'
              )}
            >
              {displayRun.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
