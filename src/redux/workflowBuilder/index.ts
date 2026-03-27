import { combineReducers, type UnknownAction } from '@reduxjs/toolkit'
import { produce } from 'immer'
import type { Node } from '@xyflow/react'
import builderReducer from './builderSlice'
import executionReducer from './executionSlice'
import batchReducer from './batchSlice'
import type { WorkflowBuilderCombinedState } from '../types/workflowBuilder'
import type { NodeStatesMap } from '../types/workflow'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'
import {
  executionStarted,
  singleStepStarted,
  stepStarted,
  stepStreaming,
  stepCompleted,
} from './actions'
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

/**
 * Find chatOutput node IDs connected as targets of a given source node.
 */
function getConnectedChatOutputIds(
  sourceNodeId: string,
  edges: { source: string; target: string }[],
  nodes: Node[]
): string[] {
  const chatOutputIds = new Set(
    nodes.filter((n) => n.type === WorkflowNodeType.ChatOutput).map((n) => n.id)
  )
  return edges
    .filter((e) => e.source === sourceNodeId && chatOutputIds.has(e.target))
    .map((e) => e.target)
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
 *
 * Uses Immer's `produce` to safely mutate the frozen output from
 * combineReducers — without this, direct property assignments throw
 * "Cannot assign to read only property" on Immer-frozen state.
 */
function workflowBuilderReducer(
  state: WorkflowBuilderCombinedState | undefined,
  action: UnknownAction
): WorkflowBuilderCombinedState {
  const nextState = baseReducer(state, action)

  // Only apply cross-slice coordination for actions that need it
  const needsCrossSlice =
    executionStarted.match(action) ||
    singleStepStarted.match(action) ||
    stepStarted.match(action) ||
    stepStreaming.match(action) ||
    stepCompleted.match(action) ||
    action.type === 'workflowSocket/execution_complete' ||
    action.type === 'workflowSocket/batch_complete' ||
    action.type === 'workflowSocket/workflowSubscribed' ||
    loadWorkflowIntoBuilder.fulfilled.match(action)

  if (!needsCrossSlice) return nextState

  return produce(nextState, (draft) => {
    // Cross-slice: executionStarted needs builder.nodes for nodeStates
    if (executionStarted.match(action)) {
      const nodes = draft.builder.nodes
      const loadedWorkflow = draft.builder.loadedWorkflow
      const lastWorkflowId = draft.builder.lastWorkflowId
      const workflowId = loadedWorkflow?.id || lastWorkflowId || 0

      if (draft.execution.currentRun) {
        draft.execution.currentRun.workflow = workflowId
        draft.execution.currentRun.workflowTitle = loadedWorkflow?.title || ''
        draft.execution.currentRun.workflowDescription =
          loadedWorkflow?.description || ''
        draft.execution.currentRun.nodeStates = initializeNodeStates(nodes)
      }
    }

    // Cross-slice: singleStepStarted needs builder info for workflow metadata
    if (singleStepStarted.match(action)) {
      const loadedWorkflow = draft.builder.loadedWorkflow
      const lastWorkflowId = draft.builder.lastWorkflowId
      const workflowId = loadedWorkflow?.id || lastWorkflowId || 0
      const nodes = draft.builder.nodes

      if (draft.execution.currentRun) {
        const run = draft.execution.currentRun
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
      const batchActive = draft.batch.batchRun.isActive
      if (batchActive && !draft.execution.isRunning) {
        draft.execution.isRunning = true
      }
    }

    // Cross-slice: workflowSubscribed needs to sync isRunning with batch
    if (action.type === 'workflowSocket/workflowSubscribed') {
      if (draft.batch.batchRun.isActive && !draft.execution.isRunning) {
        draft.execution.isRunning = true
      }
    }

    // Cross-slice: propagate step execution state to connected chatOutput nodes.
    // chatOutput nodes are non-executable — they never receive WebSocket events.
    // We mirror the source step's state so output nodes display streamed content.
    if (
      stepStarted.match(action) ||
      stepStreaming.match(action) ||
      stepCompleted.match(action)
    ) {
      const { nodeId } = action.payload
      const nodeStates = draft.execution.currentRun?.nodeStates
      if (nodeStates) {
        const outputIds = getConnectedChatOutputIds(
          nodeId,
          draft.builder.edges,
          draft.builder.nodes
        )
        const sourceState = nodeStates[nodeId]
        if (sourceState) {
          for (const outputId of outputIds) {
            if (!nodeStates[outputId]) {
              nodeStates[outputId] = {
                stepId: null,
                startedAt: null,
                nodeType: WorkflowNodeType.ChatOutput,
                status: WorkflowRunStepStatus.Pending,
                response: '',
                error: null,
                validationContext: null,
                metadata: null,
                snippets: [],
                webSearchSources: [],
              }
            }
            nodeStates[outputId].status = sourceState.status
            nodeStates[outputId].response = sourceState.response
            nodeStates[outputId].startedAt = sourceState.startedAt
            nodeStates[outputId].snippets = sourceState.snippets
            nodeStates[outputId].webSearchSources = sourceState.webSearchSources
          }
        }
      }
    }

    // Cross-slice: showExecutionPanel visibility based on outputDisplayMode
    if (executionStarted.match(action) || singleStepStarted.match(action)) {
      const { outputDisplayMode } = draft.builder
      if (outputDisplayMode === 'panel') {
        draft.execution.showExecutionPanel = true
      }
    }

    // Cross-slice: workflowSubscribed — show panel if running in panel mode
    if (action.type === 'workflowSocket/workflowSubscribed') {
      const { outputDisplayMode } = draft.builder
      if (draft.execution.isRunning && outputDisplayMode === 'panel') {
        draft.execution.showExecutionPanel = true
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
        draft.execution.currentRun = null
        draft.execution.isRunning = false
        draft.execution.currentPartialRunId = null
        draft.execution.executedStepNodeIds = []
        draft.execution.activeNodeId = null
        draft.execution.pendingValidation = null
        draft.execution.showExecutionPanel = false
        draft.execution.availableRuns = []
        draft.execution.selectedRunIds = {}
      }

      // Clear batch if not for this workflow
      const hasBatchRunForWorkflow =
        draft.batch.batchRun.workflowId === incomingWorkflowId
      if (!hasBatchRunForWorkflow) {
        draft.batch.batchRun = {
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
  })
}

export default workflowBuilderReducer

// Re-export everything for convenience
export * from './builderSlice'
export * from './executionSlice'
export * from './batchSlice'
export * from './selectors'
export * from './actions'
