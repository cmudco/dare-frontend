import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ExecutionState } from '../types/workflowBuilder'
import { OutputDisplayMode } from '../types/workflowBuilder'
import type { WorkflowRun, NodeStatesMap } from '../types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { loadWorkflowIntoBuilder } from '../asyncThunks/workflowBuilder'
import { getActivePartialRun, getWorkflowRuns } from '../asyncThunks/workflow'
import { debugLog } from '@/utils/debugLogger'
import {
  workflowSubscribed,
  executionStarted,
  singleStepStarted,
  stepStarted,
  stepStreaming,
  stepCompleted,
  executionComplete,
  stepError,
  workflowStatus,
  validationRequired,
  validationSubmitted,
} from './actions'

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function isWorkflowRunActive(run: WorkflowRun | null): boolean {
  if (!run) return false
  return (
    run.status === WorkflowRunStepStatus.Running ||
    run.status === WorkflowRunStepStatus.PendingHumanInput
  )
}

function ensureNodeState(
  nodeStates: NodeStatesMap,
  nodeId: string,
  nodeType = 'unknown'
): void {
  if (!nodeStates[nodeId]) {
    nodeStates[nodeId] = {
      stepId: null,
      startedAt: null,
      nodeType,
      status: WorkflowRunStepStatus.Pending,
      response: '',
      error: null,
      validationContext: null,
      metadata: null,
      snippets: [],
      webSearchSources: [],
    }
  }
}

function getRunningNodeId(run: WorkflowRun | null): string | null {
  if (!run?.nodeStates) return null
  return (
    Object.keys(run.nodeStates).find(
      (nodeId) =>
        run.nodeStates?.[nodeId]?.status === WorkflowRunStepStatus.Running
    ) || null
  )
}

// ════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ════════════════════════════════════════════════════════════════════════════

export const executionInitialState: ExecutionState = {
  currentRun: null,
  isRunning: false,
  manualModeEnabled: false,
  currentPartialRunId: null,
  executedStepNodeIds: [],
  availableRuns: [],
  selectedRunIds: {},
  activeNodeId: null,
  rightPanelTab: 'config',
  showExecutionPanel: false,
  pendingValidation: null,
}

// ════════════════════════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════════════════════════

const executionSlice = createSlice({
  name: 'workflowBuilder/execution',
  initialState: executionInitialState,
  reducers: {
    updateWorkflowRunStatus: (state, action: PayloadAction<WorkflowRun>) => {
      state.currentRun = action.payload
      state.isRunning =
        action.payload.status === WorkflowRunStepStatus.Running ||
        action.payload.status === WorkflowRunStepStatus.PendingHumanInput
    },
    clearExecutionState: (state) => {
      state.currentRun = null
      state.isRunning = false
      state.currentPartialRunId = null
      state.executedStepNodeIds = []
      state.activeNodeId = null
      state.pendingValidation = null
      state.showExecutionPanel = false
      state.availableRuns = []
      state.selectedRunIds = {}
    },

    // ── Manual Mode ──────────────────────────────────────────────────────
    setManualMode: (state, action: PayloadAction<boolean>) => {
      state.manualModeEnabled = action.payload
      if (action.payload) {
        state.selectedRunIds = {}
      } else {
        state.currentPartialRunId = null
        state.executedStepNodeIds = []
      }
    },
    setCurrentPartialRunId: (state, action: PayloadAction<number | null>) => {
      state.currentPartialRunId = action.payload
    },
    markStepExecuted: (state, action: PayloadAction<string>) => {
      if (!state.executedStepNodeIds.includes(action.payload)) {
        state.executedStepNodeIds.push(action.payload)
      }
    },
    resetPartialRun: (state) => {
      state.currentPartialRunId = null
      state.executedStepNodeIds = []
    },

    // ── Run Version Selection ────────────────────────────────────────────
    setNodeSelectedRun: (
      state,
      action: PayloadAction<{ nodeId: string; runId: number }>
    ) => {
      state.selectedRunIds[action.payload.nodeId] = action.payload.runId
    },

    // ── UI State ─────────────────────────────────────────────────────────
    setRightPanelTab: (
      state,
      action: PayloadAction<'config' | 'execution'>
    ) => {
      state.rightPanelTab = action.payload
    },
    setShowExecutionPanel: (state, action: PayloadAction<boolean>) => {
      state.showExecutionPanel = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Async Thunks ─────────────────────────────────────────────────
      .addCase(loadWorkflowIntoBuilder.fulfilled, (state, action) => {
        debugLog('📂 [executionSlice] loadWorkflowIntoBuilder.fulfilled:', {
          workflowId: action.payload.workflow.id,
        })

        // Server snapshot REPLACES client state — no merge
        state.currentRun = action.payload.currentRun
        state.pendingValidation =
          action.payload.currentRun?.pendingValidation ?? null
        state.activeNodeId = getRunningNodeId(action.payload.currentRun)
        state.manualModeEnabled =
          action.payload.workflow.manualModeEnabled ?? false

        const isRunning = isWorkflowRunActive(action.payload.currentRun)
        state.isRunning = isRunning

        const outputDisplayMode =
          action.payload.workflow.outputDisplayMode ?? OutputDisplayMode.Panel

        if (isRunning && outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        } else if (!isRunning && !state.pendingValidation) {
          state.showExecutionPanel = false
        }

        // Clear run selection state
        state.availableRuns = []
        state.selectedRunIds = {}
      })
      .addCase(getActivePartialRun.fulfilled, (state, action) => {
        const { partialRun, executedStepNodeIds } = action.payload
        if (!partialRun) return

        // Server snapshot REPLACES — no merge
        state.currentRun = partialRun
        state.currentPartialRunId = partialRun.id
        state.executedStepNodeIds = executedStepNodeIds
      })
      .addCase(getWorkflowRuns.fulfilled, (state, action) => {
        state.availableRuns = action.payload
      })

      // ── Workflow Subscription ────────────────────────────────────────
      .addCase(workflowSubscribed, (state, action) => {
        const { latestRun } = action.payload
        debugLog('🔔 [executionSlice] workflowSubscribed:', {
          runId: latestRun?.id,
          runStatus: latestRun?.status,
        })

        if (latestRun) {
          // Server snapshot REPLACES — no merge
          state.currentRun = latestRun
          state.isRunning = isWorkflowRunActive(latestRun)

          state.pendingValidation = latestRun.pendingValidation ?? null
          if (state.pendingValidation) {
            state.showExecutionPanel = true
          }

          const runningNodeId = getRunningNodeId(latestRun)
          if (runningNodeId) {
            state.activeNodeId = runningNodeId
          }
        } else {
          state.currentRun = null
          state.isRunning = false
          state.pendingValidation = null
          state.activeNodeId = null
        }
      })

      // ── Execution Lifecycle ──────────────────────────────────────────
      .addCase(executionStarted, (state, action) => {
        const { workflowRunId } = action.payload
        debugLog('🚀 [executionSlice] executionStarted, runId:', workflowRunId)

        // Note: nodeStates initialization requires access to builder.nodes.
        // This is handled by the cross-slice reducer in index.ts.
        // Here we set the execution-specific fields.
        const baseRun = state.currentRun
        state.currentRun = {
          ...(baseRun || ({} as WorkflowRun)),
          id: workflowRunId,
          status: WorkflowRunStepStatus.Running,
          nodeStates: {}, // Populated by cross-slice reducer
        }
        state.isRunning = true
        state.activeNodeId = null
        state.pendingValidation = null
      })
      .addCase(singleStepStarted, (state, action) => {
        const { workflowRunId, stepNodeId } = action.payload

        if (state.currentRun) {
          state.currentRun = {
            ...state.currentRun,
            id: workflowRunId,
            status: WorkflowRunStepStatus.Running,
            isPartial: true,
          }
        } else {
          state.currentRun = {
            id: workflowRunId,
            user: 0,
            status: WorkflowRunStepStatus.Running,
            startedAt: new Date().toISOString(),
            endedAt: null,
            workflowTitle: '',
            workflowDescription: '',
            isPartial: true,
            nodeStates: {}, // Populated by cross-slice reducer
          } as WorkflowRun
        }

        if (state.currentRun.nodeStates) {
          ensureNodeState(state.currentRun.nodeStates, stepNodeId)
          state.currentRun.nodeStates[stepNodeId].response = ''
          state.currentRun.nodeStates[stepNodeId].status =
            WorkflowRunStepStatus.Pending
        }

        state.currentPartialRunId = workflowRunId
        state.isRunning = true
        state.activeNodeId = stepNodeId
        state.pendingValidation = null
      })

      // ── Step Execution Events ────────────────────────────────────────
      .addCase(stepStarted, (state, action) => {
        const { nodeId, nodeType, startedAt, workflowRunId } = action.payload

        // Batch run events are handled by batchSlice
        if (_isBatchRunId(state, workflowRunId)) return

        state.activeNodeId = nodeId
        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId, nodeType)
        state.currentRun.nodeStates[nodeId].status =
          WorkflowRunStepStatus.Running
        state.currentRun.nodeStates[nodeId].response = ''
        if (startedAt) {
          state.currentRun.nodeStates[nodeId].startedAt = startedAt
        }
      })
      .addCase(stepStreaming, (state, action) => {
        const { nodeId, chunk, workflowRunId } = action.payload

        if (_isBatchRunId(state, workflowRunId)) return
        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId)
        state.currentRun.nodeStates[nodeId].response =
          (state.currentRun.nodeStates[nodeId].response || '') + chunk
      })
      .addCase(stepCompleted, (state, action) => {
        const { nodeId, response, metadata, workflowRunId } = action.payload

        if (_isBatchRunId(state, workflowRunId)) return
        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId)
        const nodeState = state.currentRun.nodeStates[nodeId]
        nodeState.response = response
        nodeState.status = WorkflowRunStepStatus.Completed
        nodeState.snippets = metadata?.snippets ?? []
        nodeState.webSearchSources = metadata?.webSearchSources ?? []

        if (state.activeNodeId === nodeId) {
          state.activeNodeId = null
        }

        if (
          state.manualModeEnabled &&
          !state.executedStepNodeIds.includes(nodeId)
        ) {
          state.executedStepNodeIds.push(nodeId)
        }
      })
      .addCase(executionComplete, (state, action) => {
        const { status, endedAt, workflowRunId } = action.payload

        if (_isBatchRunId(state, workflowRunId)) return

        state.isRunning = status === 'pending_human_input'
        state.activeNodeId = null

        if (state.currentRun) {
          state.currentRun = {
            ...state.currentRun,
            status: status as typeof state.currentRun.status,
            endedAt: endedAt || state.currentRun.endedAt,
          }
        }
      })
      .addCase(stepError, (state, action) => {
        const { nodeId, workflowRunId } = action.payload

        if (_isBatchRunId(state, workflowRunId)) return

        if (nodeId) {
          if (state.activeNodeId === nodeId) {
            state.activeNodeId = null
          }
          if (state.currentRun?.nodeStates?.[nodeId]) {
            state.currentRun.nodeStates[nodeId].status =
              WorkflowRunStepStatus.Failed
            state.currentRun.nodeStates[nodeId].error =
              action.payload.error || null
          }
        }
      })

      // ── Full Status Update ───────────────────────────────────────────
      .addCase(workflowStatus, (state, action) => {
        const { status, pendingValidation, ...runData } = action.payload
        const workflowRunId = action.payload.id

        if (_isBatchRunId(state, workflowRunId)) return

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _eventType, ...workflowRunData } =
          runData as WorkflowRun & { type: string }

        // Server snapshot REPLACES — no merge
        state.currentRun = { ...workflowRunData, status } as WorkflowRun
        state.showExecutionPanel = true
        state.isRunning = isWorkflowRunActive(state.currentRun)
        state.pendingValidation = pendingValidation ?? null
        state.activeNodeId = getRunningNodeId(state.currentRun)
      })

      // ── Human Validation ─────────────────────────────────────────────
      .addCase(validationRequired, (state, action) => {
        if (_isBatchRunId(state, action.payload.workflowRunId)) return

        state.isRunning = true
        state.activeNodeId = null

        // A routing node streams its raw decision JSON as it runs. Once we pause
        // for human validation the ValidationPanel shows the recommendation and
        // routes, so drop the accumulated JSON to keep it from rendering beside
        // the card.
        const pendingNodeState =
          state.currentRun?.nodeStates?.[action.payload.nodeId]
        if (pendingNodeState) {
          pendingNodeState.response = ''
        }

        state.pendingValidation = {
          nodeId: action.payload.nodeId,
          routes: action.payload.routes,
          context: action.payload.context,
          aiRecommendation: action.payload.aiRecommendation,
        }
      })
      .addCase(validationSubmitted, (state) => {
        state.pendingValidation = null
      })
  },
})

// ════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Check if a workflowRunId belongs to a batch run.
 * The execution slice skips batch events — they're handled by batchSlice.
 * This is a simplified check: if the run ID doesn't match our current run
 * or partial run, it's likely a batch event. The batch slice has the full
 * context to determine this more precisely.
 */
function _isBatchRunId(state: ExecutionState, workflowRunId?: number): boolean {
  if (!workflowRunId) return false
  // If it matches our current run or partial run, it's ours
  if (workflowRunId === state.currentRun?.id) return false
  if (workflowRunId === state.currentPartialRunId) return false
  // Otherwise, let batch handle it
  return true
}

export const {
  updateWorkflowRunStatus,
  clearExecutionState,
  setManualMode,
  setCurrentPartialRunId,
  markStepExecuted,
  resetPartialRun,
  setNodeSelectedRun,
  setRightPanelTab,
  setShowExecutionPanel,
} = executionSlice.actions

export default executionSlice.reducer
