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
 * - Zod validation of all incoming socket events
 *
 * Event naming convention:
 *   Backend sends snake_case event names (step_started, step_streaming, etc.)
 *   with camelCase payload keys (nodeId, stepNumber, etc.).
 *   Exception: workflow_status uses DRF serializer snake_case fields
 *   (started_at, workflow_title) because DRF camelCase middleware
 *   doesn't apply to socket events.
 */

import type { Middleware } from '@reduxjs/toolkit'
import { io, Socket } from 'socket.io-client'
import { config } from '@/config/environment'
import { debugLog } from '@/utils/debugLogger'
import {
  WorkflowEventSchema,
  WorkflowStatusSchema,
  SubscribeWorkflowResponseSchema,
  type WorkflowEvent,
  type WorkflowStatusEvent,
} from '@/schemas/workflowSocket'
import { batchSummaryLoaded } from '@/redux/workflowBuilderSlice'

// ════════════════════════════════════════════════════════════════════════════
// SOCKET INTERFACE
// ════════════════════════════════════════════════════════════════════════════

interface WorkflowSocketResponse {
  success: boolean
  error?: string
  workflowRunId?: number
  batchId?: number
}

interface WorkflowServerToClientEvents {
  workflow_event: (data: WorkflowEvent) => void
  workflow_status: (data: WorkflowStatusEvent) => void
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
}

interface WorkflowClientToServerEvents {
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
      latestRun?: Record<string, unknown> | null
      error?: string
    }) => void
  ) => void
  start_execution: (
    data: { workflowRunId?: number; workflowId?: number; userInput?: string },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
  execute_single_step: (
    data: { workflowId: number; stepNodeId: string; workflowRunId?: number },
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
  start_batch_execution: (
    data: { workflowId: number; fileIds: number[] },
    callback: (response: WorkflowSocketResponse) => void
  ) => void
}

type TypedWorkflowSocket = Socket<
  WorkflowServerToClientEvents,
  WorkflowClientToServerEvents
>

// ════════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ════════════════════════════════════════════════════════════════════════════

export const WORKFLOW_SOCKET_CONNECT = 'workflowSocket/connect'
export const WORKFLOW_SOCKET_DISCONNECT = 'workflowSocket/disconnect'
export const WORKFLOW_SOCKET_SUBSCRIBE = 'workflowSocket/subscribe'
export const WORKFLOW_SOCKET_SUBSCRIBE_WORKFLOW =
  'workflowSocket/subscribeWorkflow'
export const WORKFLOW_SOCKET_UNSUBSCRIBE_WORKFLOW =
  'workflowSocket/unsubscribeWorkflow'
export const WORKFLOW_SOCKET_UNSUBSCRIBE = 'workflowSocket/unsubscribe'
export const WORKFLOW_SOCKET_START_EXECUTION = 'workflowSocket/startExecution'
export const WORKFLOW_SOCKET_START_BATCH_EXECUTION =
  'workflowSocket/startBatchExecution'
export const WORKFLOW_SOCKET_EXECUTE_SINGLE_STEP =
  'workflowSocket/executeSingleStep'
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

export const workflowSocketUnsubscribeWorkflow = (workflowId: number) => ({
  type: WORKFLOW_SOCKET_UNSUBSCRIBE_WORKFLOW as typeof WORKFLOW_SOCKET_UNSUBSCRIBE_WORKFLOW,
  payload: { workflowId },
})

export const workflowSocketStartExecution = (params: {
  workflowRunId?: number
  workflowId?: number
  userInput?: string
}) => ({
  type: WORKFLOW_SOCKET_START_EXECUTION as typeof WORKFLOW_SOCKET_START_EXECUTION,
  payload: params,
})

export const workflowSocketStartBatchExecution = (params: {
  workflowId: number
  fileIds: number[]
}) => ({
  type: WORKFLOW_SOCKET_START_BATCH_EXECUTION as typeof WORKFLOW_SOCKET_START_BATCH_EXECUTION,
  payload: params,
})

export const workflowSocketExecuteSingleStep = (params: {
  workflowId: number
  stepNodeId: string
  workflowRunId?: number
}) => ({
  type: WORKFLOW_SOCKET_EXECUTE_SINGLE_STEP as typeof WORKFLOW_SOCKET_EXECUTE_SINGLE_STEP,
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
  | ReturnType<typeof workflowSocketUnsubscribeWorkflow>
  | ReturnType<typeof workflowSocketStartExecution>
  | ReturnType<typeof workflowSocketStartBatchExecution>
  | ReturnType<typeof workflowSocketExecuteSingleStep>
  | ReturnType<typeof workflowSocketSubmitValidation>

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════

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
 * - Zod validation of all incoming events
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
          debugLog('🔧 Workflow socket already exists, skipping connection')
          return next(typedAction)
        }

        debugLog('🔧 Workflow socket CONNECT action received')

        // Dispatch connecting state immediately
        dispatch({ type: 'workflowWebsocket/connecting' })

        // Build URL with /workflow namespace
        const baseUrl = config.apiUrl.replace(/\/api\/?$/, '')
        const socketUrl = `${baseUrl}/workflow`

        debugLog('🔧 Workflow Socket.IO connecting to:', socketUrl)

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
          debugLog('🔧 Workflow Socket.IO connected')
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
          debugLog('🔧 Workflow Socket.IO disconnected:', reason)
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

        // Incoming workflow events → validate with Zod, then dispatch as Redux actions
        socket.on('workflow_event', (data) => {
          const result = WorkflowEventSchema.safeParse(data)
          if (!result.success) {
            console.warn(
              `[WorkflowSocket] Invalid workflow_event (${data?.type}):`,
              result.error.issues
            )
            return
          }
          debugLog(
            '📡 [WorkflowSocket] workflow_event:',
            result.data.type,
            result.data
          )
          dispatch({
            type: `workflowSocket/${result.data.type}`,
            payload: result.data,
          })
        })

        // Workflow status updates (full run snapshot from DRF serializer)
        socket.on('workflow_status', (data) => {
          const result = WorkflowStatusSchema.safeParse(data)
          if (!result.success) {
            console.warn(
              '[WorkflowSocket] Invalid workflow_status:',
              result.error.issues
            )
            return
          }
          debugLog('📡 [WorkflowSocket] workflow_status:', result.data)
          dispatch({
            type: 'workflowSocket/workflow_status',
            payload: result.data,
          })
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

        socket.emit('subscribe_workflow', { workflowId }, (response) => {
          // Validate the subscribe_workflow response shape
          const result = SubscribeWorkflowResponseSchema.safeParse(response)
          if (!result.success) {
            console.warn(
              '[WorkflowSocket] Invalid subscribe_workflow response:',
              result.error.issues
            )
            // Fall through with raw response to avoid breaking existing flow
          }

          if (response.success) {
            // If there's a latest run, add to subscriptions
            if (response.latestRun && typeof response.latestRun === 'object') {
              const latestRun = response.latestRun as Record<string, unknown>
              if (typeof latestRun.id === 'number') {
                subscriptions.add(latestRun.id)
              }
            }

            if (response.latestBatchRun) {
              const latestRunId =
                typeof response.latestRun?.id === 'number'
                  ? response.latestRun.id
                  : null
              dispatch(
                batchSummaryLoaded({
                  ...response.latestBatchRun,
                  latestRunId,
                })
              )

              response.latestBatchRun.fileStatuses.forEach((statusItem) => {
                if (typeof statusItem.workflowRunId !== 'number') return
                if (subscriptions.has(statusItem.workflowRunId)) return

                socket.emit(
                  'subscribe_workflow_run',
                  { workflowRunId: statusItem.workflowRunId },
                  (runResponse) => {
                    if (runResponse.success) {
                      subscriptions.add(statusItem.workflowRunId as number)
                    } else {
                      console.warn(
                        'Failed to subscribe to batch workflow run',
                        runResponse.error
                      )
                    }
                  }
                )
              })
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
        })
        break
      }

      case WORKFLOW_SOCKET_UNSUBSCRIBE_WORKFLOW: {
        const { workflowId } = typedAction.payload as { workflowId: number }

        debugLog('🔌 Unsubscribing from workflow:', workflowId)

        // Backend uses run-based subscriptions, so we need to leave all run rooms
        // associated with this workflow. Since we don't track workflow->run mapping,
        // we just clear all subscriptions to ensure clean state when switching workflows.
        if (socket?.connected) {
          subscriptions.forEach((runId) => {
            socket?.emit(
              'unsubscribe_workflow_run',
              { workflowRunId: runId },
              () => {}
            )
          })
        }
        subscriptions.clear()

        dispatch({
          type: 'workflowSocket/workflowUnsubscribed',
          payload: { workflowId },
        })
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

      case WORKFLOW_SOCKET_START_BATCH_EXECUTION: {
        if (!socket?.connected) {
          console.warn('Cannot start batch execution: not connected')
          return next(typedAction)
        }

        const params = typedAction.payload as {
          workflowId: number
          fileIds: number[]
        }

        socket.emit('start_batch_execution', params, (response) => {
          if (!response.success) {
            dispatch({
              type: 'workflowSocket/batchStartError',
              payload: { error: response.error },
            })
          }
        })
        break
      }

      case WORKFLOW_SOCKET_EXECUTE_SINGLE_STEP: {
        if (!socket?.connected) {
          console.warn('Cannot execute single step: not connected')
          return next(typedAction)
        }

        const singleStepParams = typedAction.payload as {
          workflowId: number
          stepNodeId: string
          workflowRunId?: number
        }

        socket.emit(
          'execute_single_step',
          singleStepParams,
          (response: WorkflowSocketResponse) => {
            if (response.success && response.workflowRunId) {
              // Auto-subscribe to the run
              subscriptions.add(response.workflowRunId)
              dispatch({
                type: 'workflowSocket/singleStepStarted',
                payload: {
                  workflowRunId: response.workflowRunId,
                  stepNodeId: singleStepParams.stepNodeId,
                },
              })
            } else {
              dispatch({
                type: 'workflowSocket/executionError',
                payload: { error: response.error },
              })
            }
          }
        )
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
