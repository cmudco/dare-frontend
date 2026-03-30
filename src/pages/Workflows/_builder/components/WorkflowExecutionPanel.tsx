/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Orchestrator that composes:
 * - BatchRunSelector — batch run dropdown
 * - ExecutionNodeList — sorted node response cards
 * - ValidationPanel, ConnectionIndicator — existing components
 *
 * All display-run resolution lives in selectors.ts — this component
 * reads the resolved values and renders. No local derivation of
 * batch vs single run, effective IDs, or fallback chains.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { Loader2, X, Play, History, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  setShowExecutionPanel,
  selectIsRunning,
  selectNodes,
  selectWsConnectionStatus,
  selectDisplayRun,
  selectDisplayActiveNodeId,
  selectDisplayPendingValidation,
  selectShouldShowBatch,
  selectEffectiveBatchRunId,
  selectPendingValidation,
} from '@/redux/workflowBuilder'
import { workflowSocketSubscribe } from '@/redux/middleware/workflowSocketMiddleware'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import { ValidationPanel } from './ValidationPanel'
import { ConnectionIndicator } from './ConnectionIndicator'
import { ExecutionNodeList } from './ExecutionNodeList'
import { BatchRunSelector } from './BatchRunSelector'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

export default function WorkflowExecutionPanel() {
  const dispatch = useAppDispatch()

  // All display-run resolution from centralized selectors
  const displayRun = useAppSelector(selectDisplayRun)
  const displayActiveNodeId = useAppSelector(selectDisplayActiveNodeId)
  const displayPendingValidation = useAppSelector(
    selectDisplayPendingValidation
  )
  const isRunning = useAppSelector(selectIsRunning)
  const nodes = useAppSelector(selectNodes)
  const wsConnectionStatus = useAppSelector(selectWsConnectionStatus)
  const pendingValidation = useAppSelector(selectPendingValidation)

  // Batch subscription needs these to know when to subscribe
  const shouldShowBatch = useAppSelector(selectShouldShowBatch)
  const effectiveBatchRunId = useAppSelector(selectEffectiveBatchRunId)

  const {
    containerRef,
    anchorRef,
    showScrollButton,
    forceScrollToBottom,
    scrollToBottom,
    handleScrollToBottomClick,
  } = useAutoScroll()

  // ── Batch subscription ─────────────────────────────────────────────────
  const lastSubscribedRunIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!shouldShowBatch || !effectiveBatchRunId) return

    // Always fetch when switching to a different run, regardless of whether
    // we already have some nodeStates. Partial data captured mid-execution
    // must be replaced with the final complete state on demand.
    if (lastSubscribedRunIdRef.current !== effectiveBatchRunId) {
      lastSubscribedRunIdRef.current = effectiveBatchRunId
      dispatch(workflowSocketSubscribe({ workflowRunId: effectiveBatchRunId }))
    }
  }, [shouldShowBatch, effectiveBatchRunId, dispatch])

  // ── Auto-scroll effects ────────────────────────────────────────────────
  const prevRunIdRef = useRef<number | undefined>(displayRun?.id)

  useEffect(() => {
    if (displayRun?.id !== prevRunIdRef.current) {
      prevRunIdRef.current = displayRun?.id
      forceScrollToBottom('auto')
    }
  }, [displayRun?.id, forceScrollToBottom])

  useEffect(() => {
    if (displayActiveNodeId) {
      scrollToBottom('auto')
    }
  }, [displayRun?.nodeStates, displayActiveNodeId, scrollToBottom])

  useEffect(() => {
    if (displayPendingValidation) {
      forceScrollToBottom('smooth')
    }
  }, [displayPendingValidation, forceScrollToBottom])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    dispatch(setShowExecutionPanel(false))
  }, [dispatch])

  const getNodeName = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      return (node?.data as { label?: string })?.label || nodeId
    },
    [nodes]
  )

  // ── Derived display state ──────────────────────────────────────────────
  const hasDisplayData = Boolean(
    displayRun?.nodeStates && Object.keys(displayRun.nodeStates).length
  )
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
        <BatchRunSelector />
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

        {/* Execution node responses */}
        {displayRun && hasDisplayData && (
          <ExecutionNodeList
            displayRun={displayRun}
            displayActiveNodeId={displayActiveNodeId}
          />
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
