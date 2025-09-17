import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { type Node, type Edge, type NodeChange, type EdgeChange, type Connection, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { initialState } from './initialState/workflowBuilder'
import { NodeErrors } from './types/workflowBuilder'
import { handleConnection, isValidConnection } from '@/utils/workflowBuilder/connectionHelpers'
import { createNode, removeNodeById as removeNodeByIdHelper, updateNodeData as updateNodeDataHelper } from '@/utils/workflowBuilder/nodeHelpers'
import { validateWorkflow, serializeWorkflow } from '@/utils/workflowBuilder/workflowHelpers'
import { loadWorkflowIntoBuilder } from './asyncThunks/workflowBuilder'
import { startWorkflowRun } from './asyncThunks/workflow'
import type { WorkflowRun } from './types/workflow'

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
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      console.log('onNodesChange payload:', action.payload)
      // Apply changes using ReactFlow's utility
      state.nodes = applyNodeChanges(action.payload, state.nodes)
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      // Apply changes using ReactFlow's utility
      state.edges = applyEdgeChanges(action.payload, state.edges)
    },
    onConnect: (state, action: PayloadAction<Connection>) => {
      const result = handleConnection(action.payload, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
    },
    createNodeAtPosition: (
      state,
      action: PayloadAction<{ type: string; position: { x: number; y: number } }>
    ) => {
      const { type, position } = action.payload
      const result = createNode(type, position, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
      // Note: Toast handling will be done in the component via the shouldShowToast return value
    },
    removeNodeWithEdges: (state, action: PayloadAction<{ nodeId: string }>) => {
      const { nodeId } = action.payload
      const result = removeNodeByIdHelper(nodeId, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
    },
    updateNodeDataById: (
      state,
      action: PayloadAction<{ nodeId: string; newData: Record<string, unknown> }>
    ) => {
      const { nodeId, newData } = action.payload
      state.nodes = updateNodeDataHelper(nodeId, newData, state.nodes)
    },
    validateWorkflowData: (state) => {
      const result = validateWorkflow(state.nodes)
      state.errorsByNodeId = result.nodeErrors
      // Return validation result for component to handle
    },
    updateStepApiIds: (
      state,
      action: PayloadAction<{ stepApiIds: Record<string, number> }>
    ) => {
      const { stepApiIds } = action.payload

      state.nodes = state.nodes.map(node => {
        if (node.type === 'step' && stepApiIds[node.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              apiId: stepApiIds[node.id]
            }
          }
        }
        return node
      })
    },
    updateWorkflowRunStatus: (state, action: PayloadAction<WorkflowRun>) => {
      const runData = action.payload
      state.currentRun = runData
      state.isRunning = runData.status === 'running'

      // Update output nodes with step responses and status
      state.nodes = state.nodes.map(node => {
        if (node.type === 'chatOutput') {
          const stepNumber = node.data.stepNumber
          const stepRun = runData.steps?.find(s => (s.order || s.step) === stepNumber)

          if (stepRun) {
            return {
              ...node,
              data: {
                ...node.data,
                status: stepRun.status,
                response: stepRun.response,
                error: stepRun.error
              }
            }
          }
        }
        return node
      })
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
        state.isRunning = action.payload.currentRun?.status === 'running'
        state.lastWorkflowId = action.payload.workflow.id?.toString()
      })
      .addCase(startWorkflowRun.fulfilled, (state, action) => {
        // When a new run starts, update the current run and start polling
        state.currentRun = action.payload
        state.isRunning = action.payload.status === 'running'
      })
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
  onNodesChange,
  onEdgesChange,
  onConnect,
  createNodeAtPosition,
  removeNodeWithEdges,
  updateNodeDataById,
  validateWorkflowData,
  updateStepApiIds,
  updateWorkflowRunStatus,
  resetBuilder,
} = workflowBuilderSlice.actions

export default workflowBuilderSlice.reducer
