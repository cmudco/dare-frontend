/**
 * Custom hook for managing workflow WebSocket operations.
 *
 * Handles:
 * - Subscribing to workflow updates (for execution state)
 * - Starting workflow execution via socket
 * - Properly unsubscribing when switching workflows
 *
 * NOTE: Socket CONNECTION is managed at App root level by useSocketConnection.
 * This hook only handles subscription and execution operations.
 *
 * NOTE: Execution state comes ONLY from socket, not from REST API.
 * When workflowId is provided, automatically subscribes to get current execution state.
 */

import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { debugLog } from '@/utils/debugLogger'
import {
  workflowSocketStartExecution,
  workflowSocketSubscribeWorkflow,
  workflowSocketUnsubscribeWorkflow,
} from '@/redux/middleware/workflowSocketMiddleware'
import { clearExecutionState } from '@/redux/workflowBuilderSlice'

interface UseWorkflowSocketOptions {
  /** Workflow ID to subscribe to for execution state */
  workflowId?: number | null
}

interface UseWorkflowSocketReturn {
  /** Current WebSocket connection status */
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  /** Whether connected to WebSocket */
  isConnected: boolean
  /** Start workflow execution via WebSocket */
  startExecution: (params: {
    workflowRunId?: number
    workflowId?: number
    userInput?: string
  }) => void
}

export function useWorkflowSocket(
  options: UseWorkflowSocketOptions = {}
): UseWorkflowSocketReturn {
  const { workflowId } = options
  const dispatch = useAppDispatch()

  const wsConnectionStatus = useAppSelector(
    (state) => state.workflowBuilder.wsConnectionStatus
  )

  // Subscribe to workflow when connected and workflowId is provided
  useEffect(() => {
    if (wsConnectionStatus !== 'connected' || !workflowId) {
      return
    }

    dispatch(workflowSocketSubscribeWorkflow(workflowId))

    // Cleanup: unsubscribe when workflowId changes or component unmounts
    return () => {
      dispatch(workflowSocketUnsubscribeWorkflow(workflowId))
      dispatch(clearExecutionState())
    }
  }, [wsConnectionStatus, workflowId, dispatch])

  // Start execution via socket
  const startExecution = useCallback(
    (params: {
      workflowRunId?: number
      workflowId?: number
      userInput?: string
    }) => {
      if (wsConnectionStatus === 'connected') {
        debugLog('🚀 Starting workflow execution via socket:', params)
        dispatch(workflowSocketStartExecution(params))
      } else {
        console.error('❌ WebSocket not connected, cannot start execution')
      }
    },
    [wsConnectionStatus, dispatch]
  )

  return {
    connectionStatus: wsConnectionStatus,
    isConnected: wsConnectionStatus === 'connected',
    startExecution,
  }
}
