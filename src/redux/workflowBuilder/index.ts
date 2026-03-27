import { combineReducers, type UnknownAction } from '@reduxjs/toolkit'
import type { Node } from '@xyflow/react'
import builderReducer from './builderSlice'
import executionReducer from './executionSlice'
import batchReducer from './batchSlice'
import type { WorkflowBuilderCombinedState } from '../types/workflowBuilder'
import type { NodeStatesMap } from '../types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { executionStarted, singleStepStarted } from './actions'
import { loadWorkflowIntoBuilder } from '../asyncThunks/workflowBuilder'

// ════════════════════════════════════════════════════════════════════════════
// HELPERS for cross-slice coordination
// ════════════════════════════════════════════════════════════════════════════

function initializeNodeStates(nodes: Node[]): NodeStatesMap {
  const states: NodeStatesMap = {}
  for (const node of nodes) {
    states[node.id] = {
      stepId: null,
      startedAt: null,
      nodeType: node.type || 'unknown',
      status: WorkflowRunStepStatus.Pending,
      response: '',
      error: null,
      validationContext: null,
      metadata: null,
      snippets: [],
      webSearchSources: [],
    }
  }
  return states
}

// ════════════════════════════════════════════════════════════════════════════
// COMBINED REDUCER
// ════════════════════════════════════════════════════════════════════════════

const baseReducer = combineReducers({
  builder: builderReducer,
  execution: executionReducer,
  batch: batchReducer,
})

/**
 * Cross-slice reducer that coordinates state between sub-slices.
 *
 * combineReducers gives each sub-reducer only its own slice of state.
 * Some actions need data from sibling slices (e.g., executionStarted
 * needs builder.nodes to initialize nodeStates). This wrapper handles
 * those cases after the base reducers have run.
 */
function workflowBuilderReducer(
  state: WorkflowBuilderCombinedState | undefined,
  action: UnknownAction
): WorkflowBuilderCombinedState {
  const nextState = baseReducer(state, action)

  // Cross-slice: executionStarted needs builder.nodes for nodeStates
  if (executionStarted.match(action)) {
    const nodes = nextState.builder.nodes
    const loadedWorkflow = nextState.builder.loadedWorkflow
    const lastWorkflowId = nextState.builder.lastWorkflowId
    const workflowId = loadedWorkflow?.id || lastWorkflowId || 0

    if (nextState.execution.currentRun) {
      nextState.execution.currentRun = {
        ...nextState.execution.currentRun,
        workflow: workflowId,
        workflowTitle: loadedWorkflow?.title || '',
        workflowDescription: loadedWorkflow?.description || '',
        nodeStates: initializeNodeStates(nodes),
      }
    }
  }

  // Cross-slice: singleStepStarted needs builder info for workflow metadata
  if (singleStepStarted.match(action)) {
    const loadedWorkflow = nextState.builder.loadedWorkflow
    const lastWorkflowId = nextState.builder.lastWorkflowId
    const workflowId = loadedWorkflow?.id || lastWorkflowId || 0
    const nodes = nextState.builder.nodes

    if (nextState.execution.currentRun) {
      const run = nextState.execution.currentRun
      run.workflow = workflowId
      if (!run.workflowTitle) {
        run.workflowTitle = loadedWorkflow?.title || ''
      }
      if (!run.workflowDescription) {
        run.workflowDescription = loadedWorkflow?.description || ''
      }
      // Initialize nodeStates from builder nodes if empty
      if (run.nodeStates && Object.keys(run.nodeStates).length <= 1) {
        run.nodeStates = {
          ...initializeNodeStates(nodes),
          ...run.nodeStates,
        }
      }
    }
  }

  // Cross-slice: executionComplete / batchComplete need to sync isRunning
  // with batch state
  if (
    action.type === 'workflowSocket/execution_complete' ||
    action.type === 'workflowSocket/batch_complete'
  ) {
    const batchActive = nextState.batch.batchRun.isActive
    if (batchActive && !nextState.execution.isRunning) {
      nextState.execution.isRunning = true
    }
  }

  // Cross-slice: workflowSubscribed needs to sync isRunning with batch
  if (action.type === 'workflowSocket/workflowSubscribed') {
    if (nextState.batch.batchRun.isActive && !nextState.execution.isRunning) {
      nextState.execution.isRunning = true
    }
  }

  // Cross-slice: showExecutionPanel visibility based on outputDisplayMode
  if (executionStarted.match(action) || singleStepStarted.match(action)) {
    const { outputDisplayMode } = nextState.builder
    if (outputDisplayMode === 'panel') {
      nextState.execution.showExecutionPanel = true
    }
  }

  // Cross-slice: workflowSubscribed — show panel if running in panel mode
  if (action.type === 'workflowSocket/workflowSubscribed') {
    const { outputDisplayMode } = nextState.builder
    if (nextState.execution.isRunning && outputDisplayMode === 'panel') {
      nextState.execution.showExecutionPanel = true
    }
  }

  // Cross-slice: loadWorkflowIntoBuilder — clear execution on workflow switch
  if (loadWorkflowIntoBuilder.fulfilled.match(action)) {
    const previousWorkflowId = state?.builder.lastWorkflowId
    const incomingWorkflowId = action.payload.workflow.id
    const isWorkflowSwitch =
      previousWorkflowId !== undefined &&
      previousWorkflowId !== incomingWorkflowId

    if (isWorkflowSwitch) {
      // Reset execution state on workflow switch
      nextState.execution.currentRun = null
      nextState.execution.isRunning = false
      nextState.execution.currentPartialRunId = null
      nextState.execution.executedStepNodeIds = []
      nextState.execution.activeNodeId = null
      nextState.execution.pendingValidation = null
      nextState.execution.showExecutionPanel = false
      nextState.execution.availableRuns = []
      nextState.execution.selectedRunIds = {}
    }

    // Clear batch if not for this workflow
    const hasBatchRunForWorkflow =
      nextState.batch.batchRun.workflowId === incomingWorkflowId
    if (!hasBatchRunForWorkflow) {
      nextState.batch.batchRun = {
        isActive: false,
        batchId: null,
        workflowId: null,
        latestRunIsBatch: false,
        dismissedBatchId: null,
        totalFiles: 0,
        completedCount: 0,
        failedCount: 0,
        currentIndex: 0,
        fileStatuses: [],
        runsById: {},
        activeNodeIds: {},
        selectedRunId: null,
      }
    }
  }

  return nextState
}

export default workflowBuilderReducer

// Re-export everything for convenience
export * from './builderSlice'
export * from './executionSlice'
export * from './batchSlice'
export * from './selectors'
export * from './actions'
