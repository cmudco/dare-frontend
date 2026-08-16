import { createAction } from '@reduxjs/toolkit'
import type {
  WorkflowRun,
  RouteOption,
  PendingValidationContext,
  WorkflowStepArtifact,
  WorkflowStepSnippet,
  WorkflowStepToolCall,
  WorkflowStepWebSearchSource,
} from '../types/workflow'
import type { BatchFileStatus } from '../types/workflowBuilder'
import type {
  WorkflowToolCallPendingEvent,
  WorkflowToolCallExecutingEvent,
  WorkflowToolCallResultEvent,
  WorkflowContextTraceEvent,
  WorkflowArtifactCreatedEvent,
  WorkflowArtifactUpdatedEvent,
} from '@/schemas/workflowSocket'

// ════════════════════════════════════════════════════════════════════════════
// WEBSOCKET CONNECTION ACTIONS
// ════════════════════════════════════════════════════════════════════════════

export const wsConnecting = createAction('workflowWebsocket/connecting')
export const wsConnected = createAction('workflowWebsocket/connected')
export const wsDisconnected = createAction('workflowWebsocket/disconnected')

// ════════════════════════════════════════════════════════════════════════════
// WORKFLOW SUBSCRIPTION
// ════════════════════════════════════════════════════════════════════════════

export const workflowSubscribed = createAction<{
  workflowId: number
  latestRun: WorkflowRun | null
}>('workflowSocket/workflowSubscribed')

// ════════════════════════════════════════════════════════════════════════════
// EXECUTION LIFECYCLE
// ════════════════════════════════════════════════════════════════════════════

export const executionStarted = createAction<{ workflowRunId: number }>(
  'workflowSocket/executionStarted'
)

export const singleStepStarted = createAction<{
  workflowRunId: number
  stepNodeId: string
}>('workflowSocket/singleStepStarted')

export const stepStarted = createAction<{
  nodeId: string
  nodeType?: string
  label?: string | null
  startedAt?: string
  workflowRunId?: number
}>('workflowSocket/step_started')

export const stepStreaming = createAction<{
  nodeId: string
  chunk: string
  workflowRunId?: number
}>('workflowSocket/step_streaming')

export const stepCompleted = createAction<{
  nodeId: string
  response: string
  status?: string
  metadata?: {
    snippets: WorkflowStepSnippet[]
    webSearchSources: WorkflowStepWebSearchSource[]
    toolCalls?: WorkflowStepToolCall[]
    artifacts?: WorkflowStepArtifact[]
    retrievalTrace?: unknown
    contextTrace?: unknown
  }
  workflowRunId?: number
}>('workflowSocket/step_completed')

// ════════════════════════════════════════════════════════════════════════════
// TOOL-LOOP EVENTS (unified vocabulary shared with chat)
// ════════════════════════════════════════════════════════════════════════════

export const workflowToolCallPending =
  createAction<WorkflowToolCallPendingEvent>('workflowSocket/tool_call_pending')

export const workflowToolCallArgsProgress = createAction<{
  workflowRunId: number
  nodeId: string
  toolCallId: string
  argsChars: number
}>('workflowSocket/tool_call_args_progress')

export const workflowToolCallExecuting =
  createAction<WorkflowToolCallExecutingEvent>(
    'workflowSocket/tool_call_executing'
  )

export const workflowToolCallResult = createAction<WorkflowToolCallResultEvent>(
  'workflowSocket/tool_call_result'
)

export const workflowToolRoundsCapped = createAction<{
  workflowRunId: number
  nodeId: string
  round: number
}>('workflowSocket/tool_rounds_capped')

export const workflowContextTrace = createAction<WorkflowContextTraceEvent>(
  'workflowSocket/context_trace'
)

// Artifact events use chat's `socket/*` action types on purpose: the shared
// artifactSlice hydrates its store (and opens the sidecar) from the exact
// same actions, whichever socket they arrived on.
export const workflowArtifactCreated =
  createAction<WorkflowArtifactCreatedEvent>('socket/artifact_created')

export const workflowArtifactUpdated =
  createAction<WorkflowArtifactUpdatedEvent>('socket/artifact_updated')

export const executionComplete = createAction<{
  status: string
  workflowRunId: number
  endedAt?: string
}>('workflowSocket/execution_complete')

export const stepError = createAction<{
  nodeId?: string
  error?: string
  workflowRunId?: number
}>('workflowSocket/step_error')

export const workflowStatus = createAction<
  WorkflowRun & { type: 'workflow_status' }
>('workflowSocket/workflow_status')

// ════════════════════════════════════════════════════════════════════════════
// HUMAN VALIDATION
// ════════════════════════════════════════════════════════════════════════════

export const validationRequired = createAction<{
  nodeId: string
  routes: RouteOption[]
  context?: PendingValidationContext
  aiRecommendation?: string
  workflowRunId?: number
}>('workflowSocket/validation_required')

export const validationSubmitted = createAction(
  'workflowSocket/validationSubmitted'
)

// ════════════════════════════════════════════════════════════════════════════
// BATCH EXECUTION
// ════════════════════════════════════════════════════════════════════════════

export const batchStarted = createAction<{
  batchId: number
  totalFiles: number
  workflowId: number
}>('workflowSocket/batch_started')

export const batchProgress = createAction<{
  batchId: number
  index: number
  total: number
  fileId: number
  fileName: string
  status: 'running' | 'completed' | 'failed'
  workflowRunId?: number
}>('workflowSocket/batch_progress')

export const batchComplete = createAction<{
  batchId: number
  completedCount: number
  failedCount: number
  totalFiles: number
}>('workflowSocket/batch_complete')

export const batchSummaryLoaded = createAction<{
  batchId: number
  workflowId: number
  status: string
  totalFiles: number
  completedCount: number
  failedCount: number
  fileStatuses: BatchFileStatus[]
  latestRunId?: number | null
}>('workflowSocket/batch_summary_loaded')
