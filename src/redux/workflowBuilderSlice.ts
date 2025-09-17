import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type Node, type Edge } from '@xyflow/react'
import { initialState } from './initialState/workflowBuilder'
import { NodeErrors } from './types/workflowBuilder'

const workflowBuilderSlice = createSlice({
  name: 'workflowBuilder',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload
    },
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload)
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload)
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Node> }>
    ) => {
      const { id, updates } = action.payload
      const nodeIndex = state.nodes.findIndex((node) => node.id === id)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates }
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      state.nodes = state.nodes.filter((node) => node.id !== nodeId)
      // Also remove any edges connected to this node
      state.edges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    },
    removeEdge: (state, action: PayloadAction<string>) => {
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
        delete (copy as Record<string, string | undefined>)[field]
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
    setLastWorkflowId: (state, action: PayloadAction<string | undefined>) => {
      state.lastWorkflowId = action.payload
    },
    setSavedViewport: (
      state,
      action: PayloadAction<{ x: number; y: number; zoom: number } | null>
    ) => {
      state.savedViewport = action.payload
    },
    resetBuilder: () => {
      return initialState
    },
  },
})

export const {
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
  resetBuilder,
} = workflowBuilderSlice.actions

export default workflowBuilderSlice.reducer
