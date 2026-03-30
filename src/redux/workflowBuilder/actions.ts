import { createAction } from '@reduxjs/toolkit'
import type {
  WorkflowRun,
  RouteOption,
  PendingValidationContext,
  WorkflowStepSnippet,
  WorkflowStepWebSearchSource,
} from '../types/workflow'
import type { BatchFileStatus } from '../types/workflowBuilder'

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
  }
  workflowRunId?: number
}>('workflowSocket/step_completed')

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
