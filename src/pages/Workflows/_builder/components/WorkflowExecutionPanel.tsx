/**
 * WorkflowExecutionPanel - Real-time workflow execution preview
 *
 * Features:
 * - Live streaming LLM responses during execution
 * - Empty by default, shows data from WebSocket events
 * - Human validation UI when required
 * - Connection status indicator
 */

import { useRef, useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { Loader2, CheckCircle, Wifi, WifiOff, X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  setShowExecutionPanel,
  clearStreamingResponses,
} from '@/redux/workflowBuilderSlice'
import { workflowSocketSubmitValidation } from '@/redux/middleware/workflowSocketMiddleware'

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

  // Close panel handler
  const handleClose = () => {
    dispatch(setShowExecutionPanel(false))
    dispatch(clearStreamingResponses())
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

  // Sort streaming responses by step order (based on node position in workflow)
  const sortedResponses = Object.entries(streamingResponses).sort(
    ([idA], [idB]) => {
      const nodeA = nodes.find((n) => n.id === idA)
      const nodeB = nodes.find((n) => n.id === idB)
      const stepA = (nodeA?.data?.stepNumber as number) || 0
      const stepB = (nodeB?.data?.stepNumber as number) || 0
      return stepA - stepB
    }
  )

  return (
    <div className='absolute right-0 top-0 z-20 flex h-full w-96 flex-col border-l border-border/50 bg-white/95 shadow-lg backdrop-blur-sm'>
      {/* Header with connection status and close button */}
      <div className='flex items-center justify-between border-b border-border p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>Execution Preview</h3>
          <p className='text-xs text-muted-foreground'>
            {isRunning
              ? activeStreamingNodeId
                ? 'Streaming response...'
                : 'Workflow running...'
              : pendingValidation
                ? 'Awaiting validation'
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

        {/* Empty state */}
        {!hasStreamingData && !pendingValidation && !isRunning && (
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
          !hasStreamingData &&
          !activeStreamingNodeId &&
          !pendingValidation && (
            <div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
              <Loader2 className='mb-2 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-sm'>Starting workflow...</p>
            </div>
          )}

        {/* Streaming responses */}
        {hasStreamingData && (
          <div className='space-y-4'>
            {sortedResponses.map(([nodeId, content]) => {
              const isActive = activeStreamingNodeId === nodeId
              const nodeName = getNodeName(nodeId)

              return (
                <div
                  key={nodeId}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    isActive && 'border-blue-200 bg-blue-50/50',
                    !isActive && content && 'border-green-200 bg-green-50/50'
                  )}
                >
                  {/* Step header */}
                  <div className='mb-2 flex items-center gap-2'>
                    {isActive ? (
                      <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
                    ) : (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    )}
                    <span className='text-sm font-medium'>{nodeName}</span>
                    {isActive && (
                      <span className='text-xs text-blue-600'>
                        Streaming...
                      </span>
                    )}
                  </div>

                  {/* Response content */}
                  {content && (
                    <div className='mt-2 rounded bg-white/80 p-2'>
                      <pre className='whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700'>
                        {content}
                        {isActive && (
                          <span className='animate-pulse text-blue-500'>|</span>
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with run info */}
      {currentRun && (
        <div className='border-t border-border p-3'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Run #{currentRun.id}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                currentRun.status === 'completed' &&
                  'bg-green-100 text-green-700',
                currentRun.status === 'running' && 'bg-blue-100 text-blue-700',
                currentRun.status === 'failed' && 'bg-red-100 text-red-700',
                currentRun.status === 'pending_human_input' &&
                  'bg-yellow-100 text-yellow-700'
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

/**
 * ValidationPanel - Human-in-the-loop validation UI
 */
interface ValidationPanelProps {
  validation: {
    nodeId: string
    routes: Array<{ name: string; description?: string }>
    context?: Record<string, unknown>
    aiRecommendation?: string
  }
  workflowRunId?: number
  nodeName: string
}

function ValidationPanel({
  validation,
  workflowRunId,
  nodeName,
}: ValidationPanelProps) {
  const dispatch = useAppDispatch()
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!selectedRoute || !workflowRunId) return

    setIsSubmitting(true)
    dispatch(
      workflowSocketSubmitValidation({
        workflowRunId,
        nodeId: validation.nodeId,
        selectedRoute,
        continueExecution: true,
      })
    )
  }

  return (
    <div className='mb-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400'>
          <span className='text-xs font-bold text-yellow-900'>?</span>
        </div>
        <span className='font-medium text-yellow-900'>
          Human Validation Required
        </span>
      </div>

      <p className='mb-3 text-sm text-yellow-800'>
        The workflow is waiting for your decision at <strong>{nodeName}</strong>
        . Please select a route to continue.
      </p>

      {validation.aiRecommendation && (
        <div className='mb-3 rounded bg-yellow-100 p-2 text-xs text-yellow-800'>
          <strong>AI Recommendation:</strong> {validation.aiRecommendation}
        </div>
      )}

      <div className='mb-4 space-y-2'>
        {validation.routes.map((route) => (
          <button
            key={route.name}
            onClick={() => setSelectedRoute(route.name)}
            className={cn(
              'w-full rounded-lg border p-3 text-left transition-all',
              selectedRoute === route.name
                ? 'border-yellow-500 bg-yellow-100'
                : 'border-yellow-200 bg-white hover:border-yellow-400'
            )}
          >
            <div className='font-medium text-gray-900'>{route.name}</div>
            {route.description && (
              <div className='text-xs text-gray-600'>{route.description}</div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedRoute || isSubmitting}
        className='w-full'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Continue Workflow'
        )}
      </Button>
    </div>
  )
}
