/**
 * Workflow Socket.IO Redux Middleware
 *
 * Handles real-time workflow execution streaming via WebSocket.
 *
 * Features:
 * - Token-by-token LLM response streaming
 * - Step-by-step execution progress
 * - Human validation request handling
 * - Automatic reconnection
 *
 * Usage:
 *   1. Add workflowSocketMiddleware to Redux store
 *   2. Dispatch workflow socket actions
 *   3. Listen for incoming actions in reducers
 */

import type { Middleware } from '@reduxjs/toolkit'
import { io, Socket } from 'socket.io-client'
import { config } from '@/config/environment'

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

// Workflow event types from backend
export interface WorkflowStepStarted {
  type: 'step_started'
  nodeId: string
  stepNumber: number
  nodeType: string
}

export interface WorkflowStepStreaming {
  type: 'step_streaming'
  nodeId: string
  chunk: string
  accumulatedTokens?: number
}

// Rich metadata types for step completion
export interface StepSnippet {
  id: number
  file: { id: number; name: string } | null
  text: string
  similarity_score: number
  chunk_index: number
  vector_db_source: string
}

export interface StepWebSearchSource {
  id: number
  url: string
  title: string
  cited_text: string
  page_age?: string
  provider: string
}

export interface StepCompletedMetadata {
  snippets?: StepSnippet[]
  webSearchSources?: StepWebSearchSource[]
}

export interface WorkflowStepCompleted {
  type: 'step_completed'
  nodeId: string
  response: string
  status: 'completed' | 'failed' | 'skipped'
  tokens?: { input: number; output: number }
  metadata?: StepCompletedMetadata
}

export interface WorkflowExecutionComplete {
  type: 'execution_complete'
  workflowRunId: number
  status: 'completed' | 'failed' | 'pending_human_input'
  totalCost?: number
  totalTokens?: { input: number; output: number }
  endedAt?: string
}

export interface WorkflowStepError {
  type: 'step_error'
  nodeId?: string
  error: string
  errorType?: string
}

export interface WorkflowValidationRequired {
  type: 'validation_required'
  nodeId: string
  routes: Array<{ name: string; description?: string }>
  context?: Record<string, unknown>
  aiRecommendation?: string
}

export interface WorkflowStatus {
  type: 'workflow_status'
  id: number
  status: string
  [key: string]: unknown
}

export type WorkflowEvent =
  | WorkflowStepStarted
  | WorkflowStepStreaming
  | WorkflowStepCompleted
  | WorkflowExecutionComplete
  | WorkflowStepError
  | WorkflowValidationRequired
  | WorkflowStatus

// Server to client events
export interface WorkflowServerToClientEvents {
  workflow_event: (data: WorkflowEvent) => void
  workflow_status: (data: WorkflowStatus) => void
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
}

// Client to server events
export interface WorkflowClientToServerEvents {
  subscribe_workflow_run: (
    data: { workflowRunId: number },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
  unsubscribe_workflow_run: (
    data: { workflowRunId: number },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
  subscribe_workflow: (
    data: { workflowId: number },
    callback: (response: {
      success: boolean
      workflowId?: number
      latestRun?: unknown
      error?: string
    }) => void
  ) => void
  start_execution: (
    data: { workflowRunId?: number; workflowId?: number; userInput?: string },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
  submit_validation: (
    data: {
      workflowRunId: number
      nodeId: string
      selectedRoute: string
      continueExecution?: boolean
    },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
}

export interface WorkflowSocketResponse {
  success: boolean
  error?: string
  workflowRunId?: number
}

// ════════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ════════════════════════════════════════════════════════════════════════════

export const WORKFLOW_SOCKET_CONNECT = 'workflowSocket/connect'
export const WORKFLOW_SOCKET_DISCONNECT = 'workflowSocket/disconnect'
export const WORKFLOW_SOCKET_SUBSCRIBE = 'workflowSocket/subscribe'
export const WORKFLOW_SOCKET_SUBSCRIBE_WORKFLOW =
  'workflowSocket/subscribeWorkflow'
export const WORKFLOW_SOCKET_UNSUBSCRIBE = 'workflowSocket/unsubscribe'
export const WORKFLOW_SOCKET_START_EXECUTION = 'workflowSocket/startExecution'
export const WORKFLOW_SOCKET_SUBMIT_VALIDATION =
  'workflowSocket/submitValidation'

// ════════════════════════════════════════════════════════════════════════════
// ACTION CREATORS
// ════════════════════════════════════════════════════════════════════════════

export const workflowSocketConnect = (jwtToken: string) => ({
  type: WORKFLOW_SOCKET_CONNECT as typeof WORKFLOW_SOCKET_CONNECT,
  payload: { jwtToken },
})

export const workflowSocketDisconnect = () => ({
  type: WORKFLOW_SOCKET_DISCONNECT as typeof WORKFLOW_SOCKET_DISCONNECT,
})

export const workflowSocketSubscribe = (workflowRunId: number) => ({
  type: WORKFLOW_SOCKET_SUBSCRIBE as typeof WORKFLOW_SOCKET_SUBSCRIBE,
  payload: { workflowRunId },
})

export const workflowSocketSubscribeWorkflow = (workflowId: number) => ({
  type: WORKFLOW_SOCKET_SUBSCRIBE_WORKFLOW as typeof WORKFLOW_SOCKET_SUBSCRIBE_WORKFLOW,
  payload: { workflowId },
})

export const workflowSocketUnsubscribe = (workflowRunId: number) => ({
  type: WORKFLOW_SOCKET_UNSUBSCRIBE as typeof WORKFLOW_SOCKET_UNSUBSCRIBE,
  payload: { workflowRunId },
})

export const workflowSocketStartExecution = (params: {
  workflowRunId?: number
  workflowId?: number
  userInput?: string
}) => ({
  type: WORKFLOW_SOCKET_START_EXECUTION as typeof WORKFLOW_SOCKET_START_EXECUTION,
  payload: params,
})

export const workflowSocketSubmitValidation = (params: {
  workflowRunId: number
  nodeId: string
  selectedRoute: string
  continueExecution?: boolean
}) => ({
  type: WORKFLOW_SOCKET_SUBMIT_VALIDATION as typeof WORKFLOW_SOCKET_SUBMIT_VALIDATION,
  payload: params,
})

// Action type union
export type WorkflowSocketAction =
  | ReturnType<typeof workflowSocketConnect>
  | ReturnType<typeof workflowSocketDisconnect>
  | ReturnType<typeof workflowSocketSubscribe>
  | ReturnType<typeof workflowSocketUnsubscribe>
  | ReturnType<typeof workflowSocketStartExecution>
  | ReturnType<typeof workflowSocketSubmitValidation>

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════

type TypedWorkflowSocket = Socket<
  WorkflowServerToClientEvents,
  WorkflowClientToServerEvents
>

interface WorkflowSocketActionWithPayload {
  type: string
  payload?: Record<string, unknown>
}

/**
 * Create Workflow Socket.IO Redux middleware
 *
 * Handles:
 * - Connection lifecycle for /workflow namespace
 * - Workflow run subscriptions
 * - Execution start/progress streaming
 * - Human validation submissions
 */
export function createWorkflowSocketMiddleware(): Middleware {
  let socket: TypedWorkflowSocket | null = null
  const subscriptions = new Set<number>()

  return (store) => (next) => (action: unknown) => {
    const typedAction = action as WorkflowSocketActionWithPayload
    const dispatch = store.dispatch

    switch (typedAction.type) {
      // ─────────────────────────────────────────────────────────────────────
      // Connection
      // ─────────────────────────────────────────────────────────────────────

      case WORKFLOW_SOCKET_CONNECT: {
        const { jwtToken } = typedAction.payload as { jwtToken: string }

        // Already connected or connecting - don't create another socket
        if (socket) {
          console.log('🔧 Workflow socket already exists, skipping connection')
          return next(typedAction)
        }

        console.log('🔧 Workflow socket CONNECT action received')

        // Dispatch connecting state immediately
        dispatch({ type: 'workflowWebsocket/connecting' })

        // Build URL with /workflow namespace
        const baseUrl = config.apiUrl.replace(/\/api\/?$/, '')
        const socketUrl = `${baseUrl}/workflow`

        console.log('🔧 Workflow Socket.IO connecting to:', socketUrl)

        // Create socket connecting to /workflow namespace
        // Use websocket first, with polling fallback for compatibility
        socket = io(socketUrl, {
          path: '/socket.io/',
          auth: { token: jwtToken },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 30000,
        }) as TypedWorkflowSocket

        // Connection events
        socket.on('connect', () => {
          console.log('🔧 Workflow Socket.IO connected')
          dispatch({ type: 'workflowWebsocket/connected' })

          // Re-subscribe after reconnect
          subscriptions.forEach((runId) => {
            socket?.emit(
              'subscribe_workflow_run',
              { workflowRunId: runId },
              () => {}
            )
          })
        })

        socket.on('disconnect', (reason) => {
          console.log('🔧 Workflow Socket.IO disconnected:', reason)
          dispatch({
            type: 'workflowWebsocket/disconnected',
            payload: { reason },
          })
        })

        socket.on('connect_error', (error) => {
          console.error('🔧 Workflow Socket.IO error:', error.message)
          dispatch({
            type: 'workflowWebsocket/error',
            payload: { error: error.message },
          })
        })

        // Incoming workflow events → dispatch as Redux actions
        socket.on('workflow_event', (data) => {
          console.log('📡 [WorkflowSocket] workflow_event:', data.type, data)
          dispatch({ type: `workflowSocket/${data.type}`, payload: data })
        })

        // Workflow status updates
        socket.on('workflow_status', (data) => {
          console.log('📡 [WorkflowSocket] workflow_status:', data)
          dispatch({ type: 'workflowSocket/workflow_status', payload: data })
        })

        break
      }

      case WORKFLOW_SOCKET_DISCONNECT: {
        if (socket) {
          socket.disconnect()
          socket = null
        }
        subscriptions.clear()
        dispatch({ type: 'workflowWebsocket/disconnected' })
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Subscriptions
      // ─────────────────────────────────────────────────────────────────────

      case WORKFLOW_SOCKET_SUBSCRIBE: {
        const { workflowRunId } = typedAction.payload as {
          workflowRunId: number
        }

        if (!socket?.connected) {
          console.warn('Cannot subscribe to workflow run: not connected')
          return next(typedAction)
        }

        socket.emit('subscribe_workflow_run', { workflowRunId }, (response) => {
          if (response.success) {
            subscriptions.add(workflowRunId)
            dispatch({
              type: 'workflowSocket/subscribed',
              payload: { workflowRunId },
            })
          } else {
            dispatch({
              type: 'workflowSocket/subscribeError',
              payload: { workflowRunId, error: response.error },
            })
          }
        })
        break
      }

      case WORKFLOW_SOCKET_UNSUBSCRIBE: {
        const { workflowRunId } = typedAction.payload as {
          workflowRunId: number
        }

        if (!socket?.connected) {
          return next(typedAction)
        }

        socket.emit('unsubscribe_workflow_run', { workflowRunId }, () => {
          subscriptions.delete(workflowRunId)
          dispatch({
            type: 'workflowSocket/unsubscribed',
            payload: { workflowRunId },
          })
        })
        break
      }

      case WORKFLOW_SOCKET_SUBSCRIBE_WORKFLOW: {
        const { workflowId } = typedAction.payload as { workflowId: number }

        if (!socket?.connected) {
          console.warn('Cannot subscribe to workflow: not connected')
          return next(typedAction)
        }

        socket.emit(
          'subscribe_workflow',
          { workflowId },
          (response: {
            success: boolean
            workflowId?: number
            latestRun?: unknown
            error?: string
          }) => {
            if (response.success) {
              // If there's a latest run, add to subscriptions and dispatch state
              if (
                response.latestRun &&
                typeof response.latestRun === 'object'
              ) {
                const latestRun = response.latestRun as { id?: number }
                if (latestRun.id) {
                  subscriptions.add(latestRun.id)
                }
              }

              dispatch({
                type: 'workflowSocket/workflowSubscribed',
                payload: {
                  workflowId,
                  latestRun: response.latestRun || null,
                },
              })
            } else {
              dispatch({
                type: 'workflowSocket/subscribeError',
                payload: { workflowId, error: response.error },
              })
            }
          }
        )
        break
      }

      // ─────────────────────────────────────────────────────────────────────
      // Execution
      // ─────────────────────────────────────────────────────────────────────

      case WORKFLOW_SOCKET_START_EXECUTION: {
        if (!socket?.connected) {
          console.warn('Cannot start workflow execution: not connected')
          return next(typedAction)
        }

        const params = typedAction.payload as {
          workflowRunId?: number
          workflowId?: number
          userInput?: string
        }

        socket.emit('start_execution', params, (response) => {
          if (response.success && response.workflowRunId) {
            // Auto-subscribe to the run
            subscriptions.add(response.workflowRunId)
            dispatch({
              type: 'workflowSocket/executionStarted',
              payload: { workflowRunId: response.workflowRunId },
            })
          } else {
            dispatch({
              type: 'workflowSocket/executionError',
              payload: { error: response.error },
            })
          }
        })
        break
      }

      case WORKFLOW_SOCKET_SUBMIT_VALIDATION: {
        if (!socket?.connected) {
          console.warn('Cannot submit validation: not connected')
          return next(typedAction)
        }

        const validationParams = typedAction.payload as {
          workflowRunId: number
          nodeId: string
          selectedRoute: string
          continueExecution?: boolean
        }

        socket.emit('submit_validation', validationParams, (response) => {
          if (response.success) {
            dispatch({
              type: 'workflowSocket/validationSubmitted',
              payload: validationParams,
            })
          } else {
            dispatch({
              type: 'workflowSocket/validationError',
              payload: { error: response.error },
            })
          }
        })
        break
      }
    }

    return next(typedAction)
  }
}

// Export middleware instance
export const workflowSocketMiddleware = createWorkflowSocketMiddleware()
