import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

// ════════════════════════════════════════════════════════════════════════════
// BASE SELECTORS — direct state access
// ════════════════════════════════════════════════════════════════════════════

// Builder state
export const selectBuilderState = (state: RootState) =>
  state.workflowBuilder.builder
export const selectNodes = (state: RootState) =>
  state.workflowBuilder.builder.nodes
export const selectEdges = (state: RootState) =>
  state.workflowBuilder.builder.edges
export const selectLoadedWorkflow = (state: RootState) =>
  state.workflowBuilder.builder.loadedWorkflow
export const selectLastWorkflowId = (state: RootState) =>
  state.workflowBuilder.builder.lastWorkflowId
export const selectSavedViewport = (state: RootState) =>
  state.workflowBuilder.builder.savedViewport
export const selectHistory = (state: RootState) =>
  state.workflowBuilder.builder.history
export const selectSavingStatus = (state: RootState) =>
  state.workflowBuilder.builder.savingStatus
export const selectSelectedNodeId = (state: RootState) =>
  state.workflowBuilder.builder.selectedNodeId
export const selectWsConnectionStatus = (state: RootState) =>
  state.workflowBuilder.builder.wsConnectionStatus
export const selectOutputDisplayMode = (state: RootState) =>
  state.workflowBuilder.builder.outputDisplayMode
export const selectCurrentMode = (state: RootState) =>
  state.workflowBuilder.builder.currentMode

// Execution state
export const selectExecutionState = (state: RootState) =>
  state.workflowBuilder.execution
export const selectCurrentRun = (state: RootState) =>
  state.workflowBuilder.execution.currentRun
export const selectIsRunning = (state: RootState) =>
  state.workflowBuilder.execution.isRunning
export const selectActiveNodeId = (state: RootState) =>
  state.workflowBuilder.execution.activeNodeId
export const selectManualModeEnabled = (state: RootState) =>
  state.workflowBuilder.execution.manualModeEnabled
export const selectCurrentPartialRunId = (state: RootState) =>
  state.workflowBuilder.execution.currentPartialRunId
export const selectExecutedStepNodeIds = (state: RootState) =>
  state.workflowBuilder.execution.executedStepNodeIds
export const selectAvailableRuns = (state: RootState) =>
  state.workflowBuilder.execution.availableRuns
export const selectSelectedRunIds = (state: RootState) =>
  state.workflowBuilder.execution.selectedRunIds
export const selectRightPanelTab = (state: RootState) =>
  state.workflowBuilder.execution.rightPanelTab
export const selectShowExecutionPanel = (state: RootState) =>
  state.workflowBuilder.execution.showExecutionPanel
export const selectPendingValidation = (state: RootState) =>
  state.workflowBuilder.execution.pendingValidation

// Batch state
export const selectBatchState = (state: RootState) =>
  state.workflowBuilder.batch
export const selectBatchRun = (state: RootState) =>
  state.workflowBuilder.batch.batchRun

// ════════════════════════════════════════════════════════════════════════════
// DERIVED SELECTORS — memoized computations
// ════════════════════════════════════════════════════════════════════════════

export const selectCurrentRunStatus = createSelector(
  [selectCurrentRun],
  (currentRun) => currentRun?.status ?? null
)

export const selectCurrentRunNodeStates = createSelector(
  [selectCurrentRun],
  (currentRun) => currentRun?.nodeStates ?? null
)

export const selectNodeExecutionState = createSelector(
  [selectCurrentRunNodeStates, (_state: RootState, nodeId: string) => nodeId],
  (nodeStates, nodeId) => nodeStates?.[nodeId] ?? null
)

export const selectIsWorkflowRunActive = createSelector(
  [selectCurrentRun, selectBatchRun],
  (currentRun, batchRun) => {
    if (batchRun.isActive) return true
    if (!currentRun) return false
    return (
      currentRun.status === WorkflowRunStepStatus.Running ||
      currentRun.status === WorkflowRunStepStatus.PendingHumanInput
    )
  }
)

export const selectCanViewExecutionPanel = createSelector(
  [selectCurrentRun, selectPendingValidation, selectBatchRun],
  (currentRun, pendingValidation, batchRun) =>
    currentRun !== null || pendingValidation !== null || batchRun.isActive
)

export const selectExecutionNodeEntries = createSelector(
  [selectCurrentRunNodeStates],
  (nodeStates) => {
    if (!nodeStates) return []
    return Object.entries(nodeStates)
  }
)

export const selectRunningNodeId = createSelector(
  [selectCurrentRunNodeStates],
  (nodeStates) => {
    if (!nodeStates) return null
    return (
      Object.keys(nodeStates).find(
        (nodeId) => nodeStates[nodeId]?.status === WorkflowRunStepStatus.Running
      ) || null
    )
  }
)

// ════════════════════════════════════════════════════════════════════════════
// BATCH + DISPLAY RUN SELECTORS — single source of truth for batch/single
// run resolution. Components should use these instead of deriving locally.
// ════════════════════════════════════════════════════════════════════════════

export const selectShouldShowBatch = createSelector(
  [selectBatchRun],
  (batchRun) => batchRun.latestRunIsBatch
)

export const selectEffectiveBatchRunId = createSelector(
  [selectBatchRun],
  (batchRun) => {
    if (batchRun.selectedRunId !== null) return batchRun.selectedRunId
    // Walk backwards to find the most recent file status with an assigned run
    for (let i = batchRun.fileStatuses.length - 1; i >= 0; i--) {
      const status = batchRun.fileStatuses[i]
      if (status.workflowRunId) return status.workflowRunId
    }
    return null
  }
)

export const selectBatchRunOptions = createSelector(
  [selectBatchRun, selectShouldShowBatch],
  (batchRun, shouldShowBatch) => {
    if (!shouldShowBatch) return []
    return batchRun.fileStatuses.filter((status) => status.workflowRunId)
  }
)

export const selectSelectedBatchRun = createSelector(
  [selectEffectiveBatchRunId, selectBatchRun],
  (effectiveId, batchRun) => {
    if (!effectiveId) return null
    return batchRun.runsById[effectiveId] ?? null
  }
)

/** The run to render in the execution panel — batch or single. */
export const selectDisplayRun = createSelector(
  [selectShouldShowBatch, selectSelectedBatchRun, selectCurrentRun],
  (shouldShowBatch, selectedBatchRun, currentRun) =>
    shouldShowBatch ? selectedBatchRun : currentRun
)

/** The active (streaming) node ID for the current display run. */
export const selectDisplayActiveNodeId = createSelector(
  [
    selectShouldShowBatch,
    selectEffectiveBatchRunId,
    selectBatchRun,
    selectActiveNodeId,
  ],
  (shouldShowBatch, effectiveId, batchRun, activeNodeId) => {
    if (!shouldShowBatch) return activeNodeId
    if (!effectiveId) return null
    return batchRun.activeNodeIds[effectiveId] ?? null
  }
)

/** Pending validation for the current display context (null during batch). */
export const selectDisplayPendingValidation = createSelector(
  [selectShouldShowBatch, selectPendingValidation],
  (shouldShowBatch, pendingValidation) =>
    shouldShowBatch ? null : pendingValidation
)
