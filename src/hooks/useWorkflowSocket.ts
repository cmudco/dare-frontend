/**
 * Custom hook for managing workflow WebSocket operations.
 *
 * Handles:
 * - Subscribing to workflow updates (for execution state)
 * - Starting workflow execution via socket
 *
 * NOTE: Socket CONNECTION is managed at App root level by useSocketConnection.
 * This hook only handles subscription and execution operations.
 *
 * NOTE: Execution state comes ONLY from socket, not from REST API.
 * When workflowId is provided, automatically subscribes to get current execution state.
 */

import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  workflowSocketStartExecution,
  workflowSocketSubscribeWorkflow,
} from '@/redux/middleware/workflowSocketMiddleware'

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
  const subscribedWorkflowRef = useRef<number | null>(null)

  const wsConnectionStatus = useAppSelector(
    (state) => state.workflowBuilder.wsConnectionStatus
  )

  // NOTE: Connection is now handled at App root level by useSocketConnection
  // No need to connect here - just wait for connection to be established

  // Subscribe to workflow when connected and workflowId is provided
  useEffect(() => {
    if (wsConnectionStatus !== 'connected' || !workflowId) {
      return
    }

    // Avoid re-subscribing to the same workflow
    if (subscribedWorkflowRef.current === workflowId) {
      return
    }

    console.log('🔌 Subscribing to workflow:', workflowId)
    dispatch(workflowSocketSubscribeWorkflow(workflowId))
    subscribedWorkflowRef.current = workflowId
  }, [wsConnectionStatus, workflowId, dispatch])

  // Start execution via socket
  // NOTE: Backend's on_start_execution automatically subscribes to the run
  const startExecution = useCallback(
    (params: {
      workflowRunId?: number
      workflowId?: number
      userInput?: string
    }) => {
      if (wsConnectionStatus === 'connected') {
        console.log('🚀 Starting workflow execution via socket:', params)
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
