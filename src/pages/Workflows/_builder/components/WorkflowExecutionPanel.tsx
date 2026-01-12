/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Features:
 * - Live streaming LLM responses during execution with markdown rendering
 * - Rich content display: snippets, web search sources, code blocks
 * - Human validation UI when required
 * - Connection status indicator
 */

import { useRef, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { Loader2, Wifi, WifiOff, X, Play, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { setShowExecutionPanel } from '@/redux/workflowBuilderSlice'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import type { StreamingResponse } from '@/redux/types/workflowBuilder'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { ValidationPanel } from './ValidationPanel'
import { StepResponseCard } from './StepResponseCard'

export default function WorkflowExecutionPanel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  // Get execution state from Redux
  const {
    currentRun,
    isRunning,
    streamingResponses,
    activeStreamingNodeId,
    wsConnectionStatus,
    pendingValidation,
    nodes,
  } = useAppSelector((state) => state.workflowBuilder)

  // Debug logging for execution panel state
  console.log('📋 ExecutionPanel state:', {
    pendingValidation: pendingValidation
      ? {
          nodeId: pendingValidation.nodeId,
          routesCount: pendingValidation.routes?.length,
          hasAiRecommendation: !!pendingValidation.aiRecommendation,
        }
      : null,
    currentRunStatus: currentRun?.status,
    currentRunId: currentRun?.id,
    isRunning,
    wsConnectionStatus,
  })

  // Close panel handler - don't clear streaming responses so we can reopen
  const handleClose = () => {
    dispatch(setShowExecutionPanel(false))
    // Note: We no longer clear streaming responses here so peek can show them
  }

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (scrollRef.current && activeStreamingNodeId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [streamingResponses, activeStreamingNodeId])

  // Get node name by id
  const getNodeName = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return (node?.data?.label as string) || node?.type || 'Step'
  }

  // Check if we have any streaming data to show
  const hasStreamingData = Object.keys(streamingResponses).length > 0

  // Node types that are execution nodes (have their own response data)
  // Display nodes (chatOutput, start) mirror data from execution nodes - skip to avoid duplication
  const EXECUTION_NODE_TYPES = ['step', 'structuredOutput']

  // Build display data from currentRun.nodeStates when no streaming data
  // This allows viewing completed runs via the "peek" button
  const completedRunResponses = useMemo(() => {
    if (hasStreamingData || !currentRun?.nodeStates) return []

    const responses: [string, StreamingResponse][] = []

    for (const [nodeId, nodeState] of Object.entries(currentRun.nodeStates)) {
      // Only show execution nodes (step, structuredOutput) - skip display nodes (chatOutput, start)
      // Display nodes mirror data from execution nodes, so including them causes duplication
      if (!EXECUTION_NODE_TYPES.includes(nodeState.nodeType)) {
        continue
      }

      // Only show nodes that have completed with a response
      if (
        nodeState.response &&
        (nodeState.status === WorkflowRunStepStatus.Completed ||
          nodeState.status === WorkflowRunStepStatus.Failed)
      ) {
        responses.push([
          nodeId,
          {
            content: nodeState.response,
            // nodeState.snippets and webSearchSources are already camelCase from backend
            snippets: nodeState.snippets,
            webSearchSources: nodeState.webSearchSources,
          },
        ])
      }
    }

    // Sort by step number
    return responses.sort(([idA], [idB]) => {
      const nodeA = nodes.find((n) => n.id === idA)
      const nodeB = nodes.find((n) => n.id === idB)
      const stepA = (nodeA?.data?.stepNumber as number) || 0
      const stepB = (nodeB?.data?.stepNumber as number) || 0
      return stepA - stepB
    })
  }, [hasStreamingData, currentRun?.nodeStates, nodes])

  // Use streaming data if available, otherwise use completed run data
  const displayResponses = hasStreamingData
    ? (Object.entries(streamingResponses).sort(([idA], [idB]) => {
        const nodeA = nodes.find((n) => n.id === idA)
        const nodeB = nodes.find((n) => n.id === idB)
        const stepA = (nodeA?.data?.stepNumber as number) || 0
        const stepB = (nodeB?.data?.stepNumber as number) || 0
        return stepA - stepB
      }) as [string, StreamingResponse][])
    : completedRunResponses

  const hasDisplayData = displayResponses.length > 0
  const isViewingCompletedRun =
    !hasStreamingData && completedRunResponses.length > 0

  return (
    <div className='absolute inset-x-0 bottom-4 top-10 z-20 ml-auto flex w-[90%] max-w-[35vw] flex-col rounded-2xl border border-border/30 bg-white/95 shadow-2xl backdrop-blur-sm'>
      {/* Header with connection status and close button */}
      <div className='flex items-center justify-between rounded-t-2xl border-b border-border/50 bg-gradient-to-r from-slate-50 to-white p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>
            {isViewingCompletedRun ? 'Run Results' : 'Execution Preview'}
          </h3>
          <p className='text-xs text-muted-foreground'>
            {isRunning
              ? activeStreamingNodeId
                ? 'Streaming response...'
                : 'Workflow running...'
              : pendingValidation
                ? 'Awaiting validation'
                : isViewingCompletedRun
                  ? `Viewing run #${currentRun?.id}`
                  : 'Ready'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            {wsConnectionStatus === 'connected' ? (
              <Wifi className='h-4 w-4 text-green-500' />
            ) : wsConnectionStatus === 'connecting' ? (
              <Loader2 className='h-4 w-4 animate-spin text-yellow-500' />
            ) : (
              <WifiOff className='h-4 w-4 text-gray-400' />
            )}
            <span className='text-xs text-muted-foreground'>
              {wsConnectionStatus === 'connected'
                ? 'Live'
                : wsConnectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Offline'}
            </span>
          </div>
          <Button variant='ghost' size='sm' onClick={handleClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Execution log - scrollable */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4'>
        {/* Human Validation UI */}
        {pendingValidation && (
          <ValidationPanel
            validation={pendingValidation}
            workflowRunId={currentRun?.id}
            nodeName={getNodeName(pendingValidation.nodeId)}
          />
        )}

        {/* Empty state - only show when no data and not running */}
        {!hasDisplayData && !pendingValidation && !isRunning && (
          <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
            <div className='mb-2'>
              <Play className='h-12 w-12 opacity-30' />
            </div>
            <p className='text-sm'>Preview your workflow</p>
            <p className='text-xs'>Click Run to see execution in real-time</p>
          </div>
        )}

        {/* Running but no data yet */}
        {isRunning &&
          !hasDisplayData &&
          !activeStreamingNodeId &&
          !pendingValidation && (
            <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
              <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-sm'>Starting workflow...</p>
            </div>
          )}

        {/* Viewing completed run indicator */}
        {isViewingCompletedRun && (
          <div className='mb-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2'>
            <History className='h-4 w-4 text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>
              Showing results from previous run
            </span>
          </div>
        )}

        {/* Response cards - streaming or completed run data */}
        {hasDisplayData && (
          <div className='space-y-4'>
            {displayResponses.map(([nodeId, responseData]) => {
              const isActive = activeStreamingNodeId === nodeId
              const node = nodes.find((n) => n.id === nodeId)
              const nodeName =
                (node?.data?.label as string) || node?.type || 'Step'
              const stepNumber = node?.data?.stepNumber as number | undefined
              const nodeType = node?.type
              const content = responseData.content
              const snippets = responseData.snippets
              const webSearchSources = responseData.webSearchSources

              return (
                <StepResponseCard
                  key={nodeId}
                  nodeId={nodeId}
                  nodeName={nodeName}
                  stepNumber={stepNumber}
                  nodeType={nodeType}
                  content={content}
                  isActive={isActive}
                  snippets={snippets}
                  webSearchSources={webSearchSources}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with run info */}
      {currentRun && (
        <div className='rounded-b-2xl border-t border-border/50 bg-gradient-to-r from-slate-50 to-white p-3'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Run #{currentRun.id}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                currentRun.status === 'completed' &&
                  'bg-[#023572]/10 text-[#023572]',
                currentRun.status === 'running' &&
                  'bg-[#EE183C]/10 text-[#EE183C]',
                currentRun.status === 'failed' && 'bg-red-100 text-red-700',
                currentRun.status === 'pending_human_input' &&
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
