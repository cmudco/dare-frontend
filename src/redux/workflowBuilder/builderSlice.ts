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
import type { BuilderState } from '../types/workflowBuilder'
import { SavingStatus, OutputDisplayMode } from '../types/workflowBuilder'
import { handleConnection } from '@/utils/workflowBuilder/handleConnection'
import { createNode } from '@/utils/workflowBuilder/createNode'
import { removeNodeById as removeNodeByIdHelper } from '@/utils/workflowBuilder/removeNodeById'
import { updateNodeData as updateNodeDataHelper } from '@/utils/workflowBuilder/updateNodeData'
import { loadWorkflowIntoBuilder } from '../asyncThunks/workflowBuilder'
import { WorkflowNodeType } from '@/utils/constants/workflows'
import {
  createSnapshot,
  pushToHistory,
  hasSignificantNodeChange,
  hasSignificantEdgeChange,
} from '../utils/historyHelpers'
import { wsConnecting, wsConnected, wsDisconnected } from './actions'
import { INITIAL_NODES, INITIAL_EDGES } from '@/utils/constants/workflowBuilder'

// ════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ════════════════════════════════════════════════════════════════════════════

export const builderInitialState: BuilderState = {
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  currentMode: 'sequential',
  lastWorkflowId: undefined,
  savedViewport: null,
  loadedWorkflow: null,
  history: {
    past: [],
    future: [],
  },
  savingStatus: SavingStatus.Idle,
  selectedNodeId: null,
  wsConnectionStatus: 'disconnected',
  outputDisplayMode: OutputDisplayMode.Panel,
}

// ════════════════════════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════════════════════════

const builderSlice = createSlice({
  name: 'workflowBuilder/builder',
  initialState: builderInitialState,
  reducers: {
    // ── History ───────────────────────────────────────────────────────────
    undo: (state) => {
      const previous = state.history.past.pop()
      if (previous) {
        const currentSnapshot = createSnapshot(state.nodes, state.edges)
        state.history.future.push(currentSnapshot)
        state.nodes = previous.nodes
        state.edges = previous.edges
      }
    },
    redo: (state) => {
      const next = state.history.future.pop()
      if (next) {
        const currentSnapshot = createSnapshot(state.nodes, state.edges)
        state.history.past.push(currentSnapshot)
        state.nodes = next.nodes
        state.edges = next.edges
      }
    },
    clearHistory: (state) => {
      state.history.past = []
      state.history.future = []
    },

    // ── Canvas Operations ────────────────────────────────────────────────
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload
    },
    addNode: (state, action: PayloadAction<Node>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      state.nodes.push(action.payload)
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      state.edges.push(action.payload)
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Node> }>
    ) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      const { id, updates } = action.payload
      const nodeIndex = state.nodes.findIndex((node) => node.id === id)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates }
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      const nodeId = action.payload
      state.nodes = state.nodes.filter((node) => node.id !== nodeId)
      state.edges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      state.edges = state.edges.filter((edge) => edge.id !== action.payload)
    },
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      if (hasSignificantNodeChange(action.payload)) {
        const snapshot = createSnapshot(state.nodes, state.edges)
        pushToHistory(state, snapshot)
      }
      state.nodes = applyNodeChanges(action.payload, state.nodes)
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      if (hasSignificantEdgeChange(action.payload)) {
        const snapshot = createSnapshot(state.nodes, state.edges)
        pushToHistory(state, snapshot)
      }
      state.edges = applyEdgeChanges(action.payload, state.edges)
    },
    onConnect: (state, action: PayloadAction<Connection>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
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
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      const { type, position } = action.payload
      const result = createNode(type, position, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
    },
    removeNodeWithEdges: (state, action: PayloadAction<{ nodeId: string }>) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      const result = removeNodeByIdHelper(
        action.payload.nodeId,
        state.nodes,
        state.edges
      )
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
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      const { nodeId, newData } = action.payload
      state.nodes = updateNodeDataHelper(nodeId, newData, state.nodes)
    },
    updateStepApiIds: (
      state,
      action: PayloadAction<{ stepApiIds: Record<string, number> }>
    ) => {
      const { stepApiIds } = action.payload
      state.nodes = state.nodes.map((node) => {
        if (node.type === WorkflowNodeType.Step && stepApiIds[node.id]) {
          return {
            ...node,
            data: { ...node.data, apiId: stepApiIds[node.id] },
          }
        }
        return node
      })
    },
    importNodes: (
      state,
      action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
    ) => {
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)
      state.nodes = [...state.nodes, ...action.payload.nodes]
      state.edges = [...state.edges, ...action.payload.edges]
    },

    // ── Node Collapse/Expand ─────────────────────────────────────────────
    collapseAllNodes: (state) => {
      state.nodes = state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, isCollapsed: true },
      }))
    },
    expandAllNodes: (state) => {
      state.nodes = state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, isCollapsed: false },
      }))
    },
    toggleNodeCollapse: (state, action: PayloadAction<string>) => {
      const nodeIndex = state.nodes.findIndex(
        (node) => node.id === action.payload
      )
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
    expandAllOutputNodes: (state) => {
      state.nodes = state.nodes.map((node) =>
        node.type === WorkflowNodeType.ChatOutput
          ? { ...node, data: { ...node.data, isExpanded: true } }
          : node
      )
    },
    collapseAllOutputNodes: (state) => {
      state.nodes = state.nodes.map((node) =>
        node.type === WorkflowNodeType.ChatOutput
          ? { ...node, data: { ...node.data, isExpanded: false } }
          : node
      )
    },

    // ── UI State ─────────────────────────────────────────────────────────
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
    setSavingStatus: (
      state,
      action: PayloadAction<BuilderState['savingStatus']>
    ) => {
      state.savingStatus = action.payload
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload
    },
    setWsConnectionStatus: (
      state,
      action: PayloadAction<'disconnected' | 'connecting' | 'connected'>
    ) => {
      state.wsConnectionStatus = action.payload
    },
    setOutputDisplayMode: (state, action: PayloadAction<OutputDisplayMode>) => {
      state.outputDisplayMode = action.payload
    },
    toggleOutputDisplayMode: (state) => {
      state.outputDisplayMode =
        state.outputDisplayMode === OutputDisplayMode.Panel
          ? OutputDisplayMode.Nodes
          : OutputDisplayMode.Panel
    },
    resetBuilder: (state) => {
      const wsConnectionStatus = state.wsConnectionStatus
      return { ...builderInitialState, wsConnectionStatus }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── WebSocket Connection ─────────────────────────────────────────
      .addCase(wsConnecting, (state) => {
        state.wsConnectionStatus = 'connecting'
      })
      .addCase(wsConnected, (state) => {
        state.wsConnectionStatus = 'connected'
      })
      .addCase(wsDisconnected, (state) => {
        state.wsConnectionStatus = 'disconnected'
      })

      // ── Async Thunks ─────────────────────────────────────────────────
      .addCase(loadWorkflowIntoBuilder.fulfilled, (state, action) => {
        const incomingWorkflowId = action.payload.workflow.id

        state.nodes = action.payload.nodes
        state.edges = action.payload.edges
        state.loadedWorkflow = action.payload.workflow
        state.lastWorkflowId = incomingWorkflowId
        state.savedViewport = action.payload.viewport ?? null
        state.outputDisplayMode =
          action.payload.workflow.outputDisplayMode ?? OutputDisplayMode.Panel

        // Clear history when loading a workflow
        state.history.past = []
        state.history.future = []
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
  onNodesChange,
  onEdgesChange,
  onConnect,
  createNodeAtPosition,
  removeNodeWithEdges,
  updateNodeDataById,
  updateStepApiIds,
  importNodes,
  collapseAllNodes,
  expandAllNodes,
  toggleNodeCollapse,
  expandAllOutputNodes,
  collapseAllOutputNodes,
  setCurrentMode,
  setLastWorkflowId,
  setSavedViewport,
  setSavingStatus,
  setSelectedNodeId,
  setWsConnectionStatus,
  setOutputDisplayMode,
  toggleOutputDisplayMode,
  resetBuilder,
} = builderSlice.actions

export default builderSlice.reducer
