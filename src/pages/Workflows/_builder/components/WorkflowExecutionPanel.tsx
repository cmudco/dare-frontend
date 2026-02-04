/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Features:
 * - Live streaming LLM responses during execution with markdown rendering
 * - Rich content display: snippets, web search sources, code blocks
 * - Human validation UI when required
 * - Connection status indicator
 *
 * Pattern: Follows MessageList.tsx auto-scroll implementation
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { Loader2, X, Play, History, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { setShowExecutionPanel } from '@/redux/workflowBuilderSlice'
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

  // Direct state access - backend provides clean, ordered data
  const {
    currentRun,
    isRunning,
    streamingResponses,
    activeStreamingNodeId,
    wsConnectionStatus,
    pendingValidation,
    nodes,
  } = useAppSelector((state) => state.workflowBuilder)

  // Use the shared auto-scroll hook (same pattern as MessageList)
  const {
    containerRef,
    anchorRef,
    showScrollButton,
    forceScrollToBottom,
    scrollToBottom,
    handleScrollToBottomClick,
  } = useAutoScroll()

  const prevRunIdRef = useRef<number | undefined>(currentRun?.id)

  // Force scroll on new run start
  useEffect(() => {
    if (currentRun?.id !== prevRunIdRef.current) {
      prevRunIdRef.current = currentRun?.id
      forceScrollToBottom('auto')
    }
  }, [currentRun?.id, forceScrollToBottom])

  // Auto-scroll during streaming (respects user scroll state)
  useEffect(() => {
    if (activeStreamingNodeId) {
      scrollToBottom('auto')
    }
  }, [streamingResponses, activeStreamingNodeId, scrollToBottom])

  // Force scroll when validation appears
  useEffect(() => {
    if (pendingValidation) {
      forceScrollToBottom('smooth')
    }
  }, [pendingValidation, forceScrollToBottom])

  const handleClose = useCallback(() => {
    dispatch(setShowExecutionPanel(false))
  }, [dispatch])

  const getNodeName = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      return (node?.data?.label as string) || node?.type || 'Step'
    },
    [nodes]
  )

  // Simple derived state
  const hasStreamingData = Object.keys(streamingResponses).length > 0
  const isViewingCompletedRun =
    !isRunning && !hasStreamingData && !!currentRun?.nodeStates
  const hasDisplayData = hasStreamingData || isViewingCompletedRun
  const isWaiting =
    isRunning && !hasDisplayData && !activeStreamingNodeId && !pendingValidation

  // Status text
  const statusText = isRunning
    ? activeStreamingNodeId
      ? 'Streaming response...'
      : 'Workflow running...'
    : pendingValidation
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
        {pendingValidation && (
          <ValidationPanel
            validation={pendingValidation}
            workflowRunId={currentRun?.id}
            nodeName={getNodeName(pendingValidation.nodeId)}
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

        {/* Streaming responses - filter to step/structuredOutput only */}
        {/* chatOutput nodes display their content directly in the canvas */}
        {hasStreamingData && (
          <div className='space-y-4'>
            {Object.entries(streamingResponses)
              .filter(([nodeId]) => {
                const node = nodes.find((n) => n.id === nodeId)
                return (
                  node?.type === WorkflowNodeType.Step ||
                  node?.type === WorkflowNodeType.StructuredOutput
                )
              })
              .map(([nodeId, data]) => (
                <StepResponseCard
                  key={nodeId}
                  nodeId={nodeId}
                  nodeName={getNodeName(nodeId)}
                  stepNumber={
                    nodes.find((n) => n.id === nodeId)?.data?.stepNumber as
                      | number
                      | undefined
                  }
                  nodeType={nodes.find((n) => n.id === nodeId)?.type}
                  content={data.content}
                  isActive={activeStreamingNodeId === nodeId}
                  snippets={data.snippets}
                  webSearchSources={data.webSearchSources}
                />
              ))}
          </div>
        )}

        {/* Completed run responses - filter to execution nodes only */}
        {/* chatOutput nodes have their own UI for viewing responses/versions */}
        {isViewingCompletedRun && currentRun?.nodeStates && (
          <div className='space-y-4'>
            {Object.entries(currentRun.nodeStates)
              .filter(
                ([, state]) =>
                  state.response &&
                  (state.nodeType === WorkflowNodeType.Step ||
                    state.nodeType === WorkflowNodeType.StructuredOutput)
              )
              .map(([nodeId, state]) => (
                <StepResponseCard
                  key={nodeId}
                  nodeId={nodeId}
                  nodeName={getNodeName(nodeId)}
                  stepNumber={
                    nodes.find((n) => n.id === nodeId)?.data?.stepNumber as
                      | number
                      | undefined
                  }
                  nodeType={nodes.find((n) => n.id === nodeId)?.type}
                  content={state.response || ''}
                  isActive={false}
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
      {currentRun && (
        <div className='rounded-b-2xl border-t border-border/50 bg-gradient-to-r from-slate-50 to-white p-3'>
          <div className='flex items-center justify-end text-xs text-muted-foreground'>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                currentRun.status === WorkflowRunStepStatus.Completed &&
                  'bg-[#023572]/10 text-[#023572]',
                currentRun.status === WorkflowRunStepStatus.Running &&
                  'bg-[#EE183C]/10 text-[#EE183C]',
                currentRun.status === WorkflowRunStepStatus.Failed &&
                  'bg-red-100 text-red-700',
                currentRun.status === WorkflowRunStepStatus.PendingHumanInput &&
                  'bg-[#EE183C]/10 text-[#EE183C]'
              )}
            >
              {currentRun.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
