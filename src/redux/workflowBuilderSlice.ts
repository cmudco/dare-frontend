import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { initialState } from './initialState/workflowBuilder'
import { NodeErrors } from './types/workflowBuilder'
import { handleConnection } from '@/utils/workflowBuilder/handleConnection'
import { createNode } from '@/utils/workflowBuilder/createNode'
import { removeNodeById as removeNodeByIdHelper } from '@/utils/workflowBuilder/removeNodeById'
import { updateNodeData as updateNodeDataHelper } from '@/utils/workflowBuilder/updateNodeData'
import { validateWorkflow } from '@/utils/workflowBuilder/validateWorkflow'
import { loadWorkflowIntoBuilder } from './asyncThunks/workflowBuilder'
import { startWorkflowRun, getActivePartialRun } from './asyncThunks/workflow'
import type { WorkflowRun } from './types/workflow'
import {
  createSnapshot,
  pushToHistory,
  hasSignificantNodeChange,
  hasSignificantEdgeChange,
} from './utils/historyHelpers'

const workflowBuilderSlice = createSlice({
  name: 'workflowBuilder',
  initialState,
  reducers: {
    // Undo/Redo actions
    undo: (state) => {
      const previous = state.history.past.pop()
      if (previous) {
        // Save current state to future
        const currentSnapshot = createSnapshot(
          state.nodes,
          state.edges,
          state.errorsByNodeId
        )
        state.history.future.push(currentSnapshot)

        // Restore previous state
        state.nodes = previous.nodes
        state.edges = previous.edges
        state.errorsByNodeId = previous.errorsByNodeId
      }
    },
    redo: (state) => {
      const next = state.history.future.pop()
      if (next) {
        // Save current state to past
        const currentSnapshot = createSnapshot(
          state.nodes,
          state.edges,
          state.errorsByNodeId
        )
        state.history.past.push(currentSnapshot)

        // Restore next state
        state.nodes = next.nodes
        state.edges = next.edges
        state.errorsByNodeId = next.errorsByNodeId
      }
    },
    clearHistory: (state) => {
      state.history.past = []
      state.history.future = []
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload
    },
    addNode: (state, action: PayloadAction<Node>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      state.nodes.push(action.payload)
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      state.edges.push(action.payload)
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Node> }>
    ) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const { id, updates } = action.payload
      const nodeIndex = state.nodes.findIndex((node) => node.id === id)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates }
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const nodeId = action.payload
      state.nodes = state.nodes.filter((node) => node.id !== nodeId)
      // Also remove any edges connected to this node
      state.edges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const edgeId = action.payload
      state.edges = state.edges.filter((edge) => edge.id !== edgeId)
    },
    setErrorsByNodeId: (
      state,
      action: PayloadAction<Record<string, NodeErrors>>
    ) => {
      state.errorsByNodeId = action.payload
    },
    setNodeError: (
      state,
      action: PayloadAction<{ nodeId: string; errors: NodeErrors }>
    ) => {
      const { nodeId, errors } = action.payload
      state.errorsByNodeId[nodeId] = errors
    },
    clearNodeError: (
      state,
      action: PayloadAction<{ nodeId: string; field?: keyof NodeErrors }>
    ) => {
      const { nodeId, field } = action.payload
      const nodeErrors = state.errorsByNodeId[nodeId]
      if (!nodeErrors) return

      if (field) {
        // remove the specific field error
        const copy = { ...nodeErrors }
        delete copy[field]
        if (Object.keys(copy).length) {
          state.errorsByNodeId[nodeId] = copy
        } else {
          delete state.errorsByNodeId[nodeId]
        }
      } else {
        delete state.errorsByNodeId[nodeId]
      }
    },
    setCurrentMode: (
      state,
      action: PayloadAction<'sequential' | 'parallel'>
    ) => {
      state.currentMode = action.payload
    },
    setLastWorkflowId: (state, action: PayloadAction<number | undefined>) => {
      state.lastWorkflowId = action.payload
    },
    setSavedViewport: (
      state,
      action: PayloadAction<{ x: number; y: number; zoom: number } | null>
    ) => {
      state.savedViewport = action.payload
    },
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      // Check if this is a significant change (not just selection or dragging)
      if (hasSignificantNodeChange(action.payload)) {
        const snapshot = createSnapshot(
          state.nodes,
          state.edges,
          state.errorsByNodeId
        )
        pushToHistory(state, snapshot)
      }

      // Apply changes using ReactFlow's utility
      state.nodes = applyNodeChanges(action.payload, state.nodes)
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      // Check if this is a significant change (not just selection)
      if (hasSignificantEdgeChange(action.payload)) {
        const snapshot = createSnapshot(
          state.nodes,
          state.edges,
          state.errorsByNodeId
        )
        pushToHistory(state, snapshot)
      }

      state.edges = applyEdgeChanges(action.payload, state.edges)
    },
    onConnect: (state, action: PayloadAction<Connection>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const result = handleConnection(action.payload, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
    },
    createNodeAtPosition: (
      state,
      action: PayloadAction<{
        type: string
        position: { x: number; y: number }
      }>
    ) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const { type, position } = action.payload
      const result = createNode(type, position, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
      // Note: Toast handling will be done in the component via the shouldShowToast return value
    },
    removeNodeWithEdges: (state, action: PayloadAction<{ nodeId: string }>) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const { nodeId } = action.payload
      const result = removeNodeByIdHelper(nodeId, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
    },
    updateNodeDataById: (
      state,
      action: PayloadAction<{
        nodeId: string
        newData: Record<string, unknown>
      }>
    ) => {
      // Save state before change
      const snapshot = createSnapshot(
        state.nodes,
        state.edges,
        state.errorsByNodeId
      )
      pushToHistory(state, snapshot)

      const { nodeId, newData } = action.payload
      state.nodes = updateNodeDataHelper(nodeId, newData, state.nodes)
    },
    validateWorkflowData: (state) => {
      const result = validateWorkflow(state.nodes, state.edges)
      state.errorsByNodeId = result.nodeErrors
      // Return validation result for component to handle
    },
    updateStepApiIds: (
      state,
      action: PayloadAction<{ stepApiIds: Record<string, number> }>
    ) => {
      const { stepApiIds } = action.payload

      state.nodes = state.nodes.map((node) => {
        if (node.type === 'step' && stepApiIds[node.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              apiId: stepApiIds[node.id],
            },
          }
        }
        return node
      })
    },
    updateWorkflowRunStatus: (state, action: PayloadAction<WorkflowRun>) => {
      const runData = action.payload
      state.currentRun = runData
      state.isRunning =
        runData.status === 'running' || runData.status === 'pending_human_input'

      // Update output nodes and conditional nodes with step responses and status
      state.nodes = state.nodes.map((node) => {
        if (node.type === 'chatOutput') {
          const stepNumber = node.data.stepNumber
          const stepRun = runData.steps?.find(
            (s) => (s.order || s.stepNode) === stepNumber
          )

          if (stepRun) {
            return {
              ...node,
              data: {
                ...node.data,
                status: stepRun.status,
                response: stepRun.response || '',
                error: stepRun.error || '',
              },
            }
          }
        } else if (node.type === 'conditional') {
          const stepNumber = node.data.stepNumber
          const stepRun = runData.steps?.find(
            (s) => (s.order || s.stepNode) === stepNumber
          )

          if (stepRun) {
            return {
              ...node,
              data: {
                ...node.data,
                status: stepRun.status,
                selectedRoute: stepRun.response || '', // Store selected route from backend
                error: stepRun.error || '',
              },
            }
          }
        }
        return node
      })
    },
    collapseAllNodes: (state) => {
      state.nodes = state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCollapsed: true,
        },
      }))
    },
    expandAllNodes: (state) => {
      state.nodes = state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCollapsed: false,
        },
      }))
    },
    toggleNodeCollapse: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      const nodeIndex = state.nodes.findIndex((node) => node.id === nodeId)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = {
          ...state.nodes[nodeIndex],
          data: {
            ...state.nodes[nodeIndex].data,
            isCollapsed: !state.nodes[nodeIndex].data.isCollapsed,
          },
        }
      }
    },
    // Manual execution mode actions
    setManualMode: (state, action: PayloadAction<boolean>) => {
      state.manualModeEnabled = action.payload
      // If disabling manual mode, reset partial run state
      if (!action.payload) {
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
    resetBuilder: () => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkflowIntoBuilder.fulfilled, (state, action) => {
        state.nodes = action.payload.nodes
        state.edges = action.payload.edges
        state.loadedWorkflow = action.payload.workflow
        state.currentRun = action.payload.currentRun
        state.isRunning =
          action.payload.currentRun?.status === 'running' ||
          action.payload.currentRun?.status === 'pending_human_input'
        state.lastWorkflowId = action.payload.workflow.id
        state.savedViewport = action.payload.viewport ?? null
        // Load manual mode state from workflow
        state.manualModeEnabled =
          action.payload.workflow.manualModeEnabled ?? false
        // Clear history when loading a workflow
        state.history.past = []
        state.history.future = []
      })
      .addCase(startWorkflowRun.fulfilled, (state, action) => {
        // When a new run starts, update the current run and start polling
        state.currentRun = action.payload
        state.isRunning =
          action.payload.status === 'running' ||
          action.payload.status === 'pending_human_input'
      })
      .addCase(getActivePartialRun.fulfilled, (state, action) => {
        const { partialRun, executedStepNodeIds } = action.payload

        if (!partialRun) {
          return
        }

        // Update partial run state
        state.currentPartialRunId = partialRun.id
        state.executedStepNodeIds = executedStepNodeIds

        // Update node data with step results
        partialRun.steps.forEach((step) => {
          // Find the step node
          const stepNodeIndex = state.nodes.findIndex(
            (n) => n.id === String(step.stepNode)
          )
          if (stepNodeIndex === -1) {
            return // Skip if step node not found
          }

          // Find connected output node (chatOutput or conditional)
          const connectedEdge = state.edges.find(
            (e) => e.source === String(step.stepNode)
          )
          if (!connectedEdge) {
            return // Skip if no connected edge
          }

          const outputNodeIndex = state.nodes.findIndex(
            (n) => n.id === connectedEdge.target
          )
          if (outputNodeIndex === -1) {
            return // Skip if output node not found
          }

          // Update the output node with step results
          const outputNode = state.nodes[outputNodeIndex]
          state.nodes[outputNodeIndex] = {
            ...outputNode,
            data: {
              ...outputNode.data,
              response: step.response ?? '',
              status: step.status,
              error: step.error ?? '',
            },
          }
        })
      })
  },
})

export const {
  undo,
  redo,
  clearHistory,
  setNodes,
  setEdges,
  addNode,
  addEdge,
  updateNode,
  removeNode,
  removeEdge,
  setErrorsByNodeId,
  setNodeError,
  clearNodeError,
  setCurrentMode,
  setLastWorkflowId,
  setSavedViewport,
  onNodesChange,
  onEdgesChange,
  onConnect,
  createNodeAtPosition,
  removeNodeWithEdges,
  updateNodeDataById,
  validateWorkflowData,
  updateStepApiIds,
  updateWorkflowRunStatus,
  collapseAllNodes,
  expandAllNodes,
  toggleNodeCollapse,
  setManualMode,
  setCurrentPartialRunId,
  markStepExecuted,
  resetPartialRun,
  resetBuilder,
} = workflowBuilderSlice.actions

export default workflowBuilderSlice.reducer
