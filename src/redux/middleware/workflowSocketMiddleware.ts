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
 *   with camelCase payload keys (nodeId, label, etc.).
 *   All events including workflow_status use camelCase payload keys —
 *   backend applies camelize() before socket emission.
 */

import { createAction, type Middleware } from '@reduxjs/toolkit'
import { io, Socket } from 'socket.io-client'
import { config } from '@/config/environment'
import { debugLog } from '@/utils/debugLogger'
import {
  captureSocketFailure,
  recordSocketLifecycle,
} from '@/utils/socketObservability'
import {
  WorkflowEventSchema,
  WorkflowStatusSchema,
  SubscribeWorkflowResponseSchema,
  type WorkflowEvent,
  type WorkflowStatusEvent,
  type SubscribeWorkflowResponse,
} from '@/schemas/workflowSocket'
import {
  wsConnecting,
  wsConnected,
  wsDisconnected,
  executionStarted,
  singleStepStarted,
  workflowSubscribed,
  validationSubmitted,
  workflowStatus,
  stepStarted,
  stepStreaming,
  stepCompleted,
  executionComplete,
  stepError,
  validationRequired,
  batchStarted,
  batchProgress,
  batchComplete,
  batchSummaryLoaded,
  workflowToolCallPending,
  workflowToolCallArgsProgress,
  workflowToolCallExecuting,
  workflowToolCallResult,
  workflowToolRoundsCapped,
  workflowContextTrace,
  workflowArtifactCreated,
  workflowArtifactUpdated,
} from '@/redux/workflowBuilder/actions'

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
    callback: (response: SubscribeWorkflowResponse) => void
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
// MIDDLEWARE COMMAND ACTIONS
// Actions dispatched by UI components that the middleware intercepts.
// These never reach reducers — the middleware handles them and emits
// socket events instead.
// ════════════════════════════════════════════════════════════════════════════

export const workflowSocketConnect = createAction<{ jwtToken: string }>(
  'workflowSocket/connect'
)
export const workflowSocketDisconnect = createAction(
  'workflowSocket/disconnect'
)
export const workflowSocketSubscribe = createAction<{
  workflowRunId: number
}>('workflowSocket/subscribe')
export const workflowSocketSubscribeWorkflow = createAction<{
  workflowId: number
}>('workflowSocket/subscribeWorkflow')
export const workflowSocketUnsubscribeWorkflow = createAction<{
  workflowId: number
}>('workflowSocket/unsubscribeWorkflow')
export const workflowSocketUnsubscribe = createAction<{
  workflowRunId: number
}>('workflowSocket/unsubscribe')
export const workflowSocketStartExecution = createAction<{
  workflowRunId?: number
  workflowId?: number
  userInput?: string
}>('workflowSocket/startExecution')
export const workflowSocketStartBatchExecution = createAction<{
  workflowId: number
  fileIds: number[]
}>('workflowSocket/startBatchExecution')
export const workflowSocketExecuteSingleStep = createAction<{
  workflowId: number
  stepNodeId: string
  workflowRunId?: number
}>('workflowSocket/executeSingleStep')
export const workflowSocketSubmitValidation = createAction<{
  workflowRunId: number
  nodeId: string
  selectedRoute: string
  continueExecution?: boolean
}>('workflowSocket/submitValidation')

// ════════════════════════════════════════════════════════════════════════════
// INCOMING EVENT DISPATCH MAP
// Maps snake_case event type strings from the backend to typed action
// creators. If a new event type is added, it must be mapped here explicitly.
// ════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventDispatchMap: Record<WorkflowEvent['type'], (payload: any) => any> = {
  step_started: stepStarted,
  step_streaming: stepStreaming,
  step_completed: stepCompleted,
  execution_complete: executionComplete,
  step_error: stepError,
  validation_required: validationRequired,
  batch_started: batchStarted,
  batch_progress: batchProgress,
  batch_complete: batchComplete,
  tool_call_pending: workflowToolCallPending,
  tool_call_args_progress: workflowToolCallArgsProgress,
  tool_call_executing: workflowToolCallExecuting,
  tool_call_result: workflowToolCallResult,
  tool_rounds_capped: workflowToolRoundsCapped,
  context_trace: workflowContextTrace,
  artifact_created: workflowArtifactCreated,
  artifact_updated: workflowArtifactUpdated,
}

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════

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
    const dispatch = store.dispatch

    // ─────────────────────────────────────────────────────────────────────
    // Connection
    // ─────────────────────────────────────────────────────────────────────

    if (workflowSocketConnect.match(action)) {
      const { jwtToken } = action.payload

      // Already connected or connecting - don't create another socket
      if (socket) {
        debugLog('🔧 Workflow socket already exists, skipping connection')
        return next(action)
      }

      debugLog('🔧 Workflow socket CONNECT action received')

      // Dispatch connecting state immediately
      dispatch(wsConnecting())

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
        recordSocketLifecycle(
          'workflow',
          socket?.recovered ? 'reconnected' : 'connected',
          { transport: socket?.io.engine?.transport.name }
        )
        dispatch(wsConnected())

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
        const active = socket?.active ?? false
        recordSocketLifecycle('workflow', 'disconnected', { reason, active })
        dispatch(wsDisconnected())

        if (reason === 'io server disconnect') {
          captureSocketFailure(
            'workflow',
            'forced_disconnect',
            new Error('Workflow socket was disconnected by the server'),
            { reason, active }
          )
          socket?.connect()
        }
      })

      socket.on('connect_error', (error) => {
        console.error('🔧 Workflow Socket.IO error:', error.message)
        captureSocketFailure('workflow', 'connect', error, {
          active: socket?.active,
          transport: socket?.io.engine?.transport.name,
        })
      })

      socket.io.on('reconnect_attempt', (attempt) => {
        recordSocketLifecycle('workflow', 'reconnect_attempt', {
          reason: `attempt ${attempt}`,
        })
      })

      socket.io.on('reconnect_error', (error) => {
        captureSocketFailure('workflow', 'reconnect', error, {
          active: socket?.active,
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

        const creator = eventDispatchMap[result.data.type]
        dispatch(creator(result.data))
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
        // Zod .passthrough() adds an index signature incompatible with
        // the strict WorkflowRun type — cast is safe post-validation
        dispatch(
          workflowStatus(
            result.data as unknown as Parameters<typeof workflowStatus>[0]
          )
        )
      })

      return next(action)
    }

    if (workflowSocketDisconnect.match(action)) {
      if (socket) {
        socket.disconnect()
        socket = null
      }
      subscriptions.clear()
      dispatch(wsDisconnected())
      return next(action)
    }

    // ─────────────────────────────────────────────────────────────────────
    // Subscriptions
    // ─────────────────────────────────────────────────────────────────────

    if (workflowSocketSubscribe.match(action)) {
      const { workflowRunId } = action.payload

      if (!socket?.connected) {
        console.warn('Cannot subscribe to workflow run: not connected')
        return next(action)
      }

      socket.emit('subscribe_workflow_run', { workflowRunId }, (response) => {
        if (response.success) {
          subscriptions.add(workflowRunId)
        } else {
          console.error(
            `[WorkflowSocket] Failed to subscribe to run ${workflowRunId}:`,
            response.error
          )
        }
      })
      return next(action)
    }

    if (workflowSocketUnsubscribe.match(action)) {
      const { workflowRunId } = action.payload

      if (!socket?.connected) {
        return next(action)
      }

      socket.emit('unsubscribe_workflow_run', { workflowRunId }, () => {
        subscriptions.delete(workflowRunId)
      })
      return next(action)
    }

    if (workflowSocketSubscribeWorkflow.match(action)) {
      const { workflowId } = action.payload

      if (!socket?.connected) {
        console.warn('Cannot subscribe to workflow: not connected')
        return next(action)
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

              if (!socket) return
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

          // Zod schema has optional workflow/user fields that WorkflowRun
          // requires — cast is safe since the slice handles partial data
          dispatch(
            workflowSubscribed({
              workflowId,
              latestRun:
                (response.latestRun as Parameters<
                  typeof workflowSubscribed
                >[0]['latestRun']) || null,
            })
          )
        } else {
          console.error(
            `[WorkflowSocket] Failed to subscribe to workflow ${workflowId}:`,
            response.error
          )
        }
      })
      return next(action)
    }

    if (workflowSocketUnsubscribeWorkflow.match(action)) {
      const { workflowId } = action.payload

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
      return next(action)
    }

    // ─────────────────────────────────────────────────────────────────────
    // Execution
    // ─────────────────────────────────────────────────────────────────────

    if (workflowSocketStartExecution.match(action)) {
      if (!socket?.connected) {
        console.warn('Cannot start workflow execution: not connected')
        return next(action)
      }

      socket.emit('start_execution', action.payload, (response) => {
        if (response.success && response.workflowRunId) {
          // Auto-subscribe to the run
          subscriptions.add(response.workflowRunId)
          dispatch(executionStarted({ workflowRunId: response.workflowRunId }))
        } else {
          console.error(
            '[WorkflowSocket] Failed to start execution:',
            response.error
          )
        }
      })
      return next(action)
    }

    if (workflowSocketStartBatchExecution.match(action)) {
      if (!socket?.connected) {
        console.warn('Cannot start batch execution: not connected')
        return next(action)
      }

      socket.emit('start_batch_execution', action.payload, (response) => {
        if (!response.success) {
          console.error(
            '[WorkflowSocket] Failed to start batch execution:',
            response.error
          )
        }
      })
      return next(action)
    }

    if (workflowSocketExecuteSingleStep.match(action)) {
      if (!socket?.connected) {
        console.warn('Cannot execute single step: not connected')
        return next(action)
      }

      const { stepNodeId } = action.payload

      socket.emit(
        'execute_single_step',
        action.payload,
        (response: WorkflowSocketResponse) => {
          if (response.success && response.workflowRunId) {
            // Auto-subscribe to the run
            subscriptions.add(response.workflowRunId)
            dispatch(
              singleStepStarted({
                workflowRunId: response.workflowRunId,
                stepNodeId,
              })
            )
          } else {
            console.error(
              '[WorkflowSocket] Failed to execute single step:',
              response.error
            )
          }
        }
      )
      return next(action)
    }

    if (workflowSocketSubmitValidation.match(action)) {
      if (!socket?.connected) {
        console.warn('Cannot submit validation: not connected')
        return next(action)
      }

      socket.emit('submit_validation', action.payload, (response) => {
        if (response.success) {
          dispatch(validationSubmitted())
        } else {
          console.error(
            '[WorkflowSocket] Failed to submit validation:',
            response.error
          )
        }
      })
      return next(action)
    }

    return next(action)
  }
}

// Export middleware instance
export const workflowSocketMiddleware = createWorkflowSocketMiddleware()
