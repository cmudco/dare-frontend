import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  Node,
  Edge,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'

// Node data type definitions
interface StartNodeData {
  title: string
  description: string
  mode: string
}

interface StepNodeData {
  prompt: string | null
  contentFiles: string[]
  embeddingFiles: string[]
  llm: string | null
  stepNumber: number
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
}

type NodeData = StartNodeData | StepNodeData | Record<string, unknown>

// Validation utilities
const validateFlowData = (nodes: Node[], edges: Edge[]) => {
  const startNodes = nodes.filter((n) => n.type === 'start')
  const stepNodes = nodes.filter((n) => n.type === 'step')
  const fieldErrors: Record<string, Record<string, string>> = {}

  // Node structure validation
  if (startNodes.length === 0)
    return {
      valid: false,
      error: 'Add a Start node to begin building your workflow',
      fieldErrors,
    }
  if (startNodes.length > 1)
    return {
      valid: false,
      error: 'Only one Start node is allowed per workflow',
      fieldErrors,
    }
  if (stepNodes.length === 0)
    return {
      valid: false,
      error: 'Add at least one Step node to your workflow',
      fieldErrors,
    }

  // Start node data validation
  const startNode = startNodes[0]
  const startData = startNode.data as unknown as StartNodeData
  let hasStartErrors = false

  if (!startData?.title?.trim()) {
    fieldErrors[startNode.id] = {
      ...fieldErrors[startNode.id],
      title: 'Title is required',
    }
    hasStartErrors = true
  }

  if (!startData?.description?.trim()) {
    fieldErrors[startNode.id] = {
      ...fieldErrors[startNode.id],
      description: 'Description is required',
    }
    hasStartErrors = true
  }

  // Step nodes data validation
  let hasStepErrors = false
  for (const stepNode of stepNodes) {
    const stepData = stepNode.data as unknown as StepNodeData

    if (!stepData?.prompt) {
      fieldErrors[stepNode.id] = {
        ...fieldErrors[stepNode.id],
        prompt: 'Please select a prompt',
      }
      hasStepErrors = true
    }

    if (!stepData?.llm) {
      fieldErrors[stepNode.id] = {
        ...fieldErrors[stepNode.id],
        llm: 'Please select an LLM model',
      }
      hasStepErrors = true
    }
  }

  if (hasStartErrors || hasStepErrors) {
    return {
      valid: false,
      error: 'Please fix the highlighted field errors',
      fieldErrors,
    }
  }

  // Connectivity validation
  const startOutgoingEdges = edges.filter((e) => e.source === startNode.id)
  if (startOutgoingEdges.length === 0) {
    return {
      valid: false,
      error: 'Start node must be connected to at least one Step',
      fieldErrors,
    }
  }

  for (const stepNode of stepNodes) {
    const stepOutgoingEdges = edges.filter((e) => e.source === stepNode.id)
    if (stepOutgoingEdges.length === 0) {
      return {
        valid: false,
        error: `Step ${stepNode.data?.stepNumber || stepNode.id} must have outgoing connections`,
        fieldErrors,
      }
    }
  }

  return { valid: true, error: null, fieldErrors }
}

interface FlowState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: string | null
  errors: Record<string, Record<string, string>> // nodeId -> { fieldName: errorMessage }
}

const initialState: FlowState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  errors: {},
}

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      console.log('🔄 setNodes called with:', action.payload)
      state.nodes = action.payload
    },

    setEdges: (state, action: PayloadAction<Edge[]>) => {
      console.log('🔄 setEdges called with:', action.payload)
      state.edges = action.payload
    },

    // Direct ReactFlow event handlers
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      console.log('🎯 onNodesChange called with:', action.payload)
      action.payload.forEach((change) => {
        console.log('  📍 Processing change:', change)

        if (change.type === 'position') {
          const node = state.nodes.find((n) => n.id === change.id)
          if (node && change.position) {
            console.log(
              `  🔄 Updating position for node ${change.id}:`,
              change.position
            )
            node.position = change.position
          }
        } else if (change.type === 'dimensions') {
          const node = state.nodes.find((n) => n.id === change.id)
          if (node && change.dimensions) {
            console.log(
              `  📏 Updating dimensions for node ${change.id}:`,
              change.dimensions
            )
            node.width = change.dimensions.width
            node.height = change.dimensions.height
          }
        } else if (change.type === 'remove') {
          console.log(`  🗑️ Removing node ${change.id}`)
          state.nodes = state.nodes.filter((n) => n.id !== change.id)
        } else if (change.type === 'select') {
          const node = state.nodes.find((n) => n.id === change.id)
          if (node) {
            console.log(
              `  ✅ Setting selection for node ${change.id}:`,
              change.selected
            )
            node.selected = change.selected
          }
        }
      })
    },

    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      console.log('🔗 onEdgesChange called with:', action.payload)
      action.payload.forEach((change) => {
        console.log('  📍 Processing edge change:', change)

        if (change.type === 'remove') {
          console.log(`  🗑️ Removing edge ${change.id}`)
          state.edges = state.edges.filter((e) => e.id !== change.id)
        } else if (change.type === 'select') {
          const edge = state.edges.find((e) => e.id === change.id)
          if (edge) {
            console.log(
              `  ✅ Setting selection for edge ${change.id}:`,
              change.selected
            )
            edge.selected = change.selected
          }
        }
      })
    },

    onConnect: (state, action: PayloadAction<Connection>) => {
      console.log('🔌 onConnect called with:', action.payload)
      const newEdge = {
        id: `${action.payload.source}-${action.payload.target}`,
        ...action.payload,
      } as Edge
      console.log('  ➕ Adding new edge:', newEdge)
      state.edges = addEdge(newEdge, state.edges)
    },

    // Additional utility actions
    updateNodeData: (
      state,
      action: PayloadAction<{ nodeId: string; data: Partial<NodeData> }>
    ) => {
      console.log('📝 updateNodeData called:', action.payload)
      const { nodeId, data } = action.payload
      const node = state.nodes.find((n) => n.id === nodeId)
      if (node) {
        console.log(`  🔄 Updating data for node ${nodeId}:`, data)
        node.data = { ...node.data, ...data }
      }
    },

    addNode: (state, action: PayloadAction<Node>) => {
      console.log('➕ addNode called with:', action.payload)
      state.nodes.push(action.payload)
    },

    removeNode: (state, action: PayloadAction<string>) => {
      console.log('🗑️ removeNode called for:', action.payload)
      const nodeId = action.payload
      state.nodes = state.nodes.filter((n) => n.id !== nodeId)
      state.edges = state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      )
      console.log(`  ✅ Removed node ${nodeId} and connected edges`)
    },

    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      console.log('🎯 setSelectedNode called with:', action.payload)
      state.selectedNode = action.payload
    },

    resetFlow: (state) => {
      console.log('🔄 resetFlow called')
      state.nodes = []
      state.edges = []
      state.selectedNode = null
      state.errors = {}
    },

    setFieldError: (
      state,
      action: PayloadAction<{ nodeId: string; field: string; error: string }>
    ) => {
      const { nodeId, field, error } = action.payload
      console.log(`🚨 Setting field error for ${nodeId}.${field}:`, error)

      if (!state.errors[nodeId]) {
        state.errors[nodeId] = {}
      }
      state.errors[nodeId][field] = error
    },

    clearFieldError: (
      state,
      action: PayloadAction<{ nodeId: string; field: string }>
    ) => {
      const { nodeId, field } = action.payload
      console.log(`✅ Clearing field error for ${nodeId}.${field}`)

      if (state.errors[nodeId]) {
        delete state.errors[nodeId][field]
        if (Object.keys(state.errors[nodeId]).length === 0) {
          delete state.errors[nodeId]
        }
      }
    },

    setFieldErrors: (
      state,
      action: PayloadAction<Record<string, Record<string, string>>>
    ) => {
      console.log('🚨 Setting field errors:', action.payload)
      state.errors = action.payload
    },

    clearAllErrors: (state) => {
      console.log('🧹 Clearing all field errors')
      state.errors = {}
    },

    validateFlow: (state) => {
      console.log('🔍 validateFlow called')
      const validation = validateFlowData(state.nodes, state.edges)

      state.errors = validation.fieldErrors

      if (validation.valid) {
        console.log('✅ Validation passed')
      } else {
        console.error('❌ Validation failed:', validation.error)
        // Note: Toast error should be handled in component using this action
      }
    },

    saveFlow: (state) => {
      console.log('💾 saveFlow called')
      const validation = validateFlowData(state.nodes, state.edges)

      state.errors = validation.fieldErrors

      if (!validation.valid) {
        console.error('❌ Save failed:', validation.error)
        return
      }

      const startNode = state.nodes.find((n) => n.type === 'start')
      const startData = startNode?.data as unknown as StartNodeData

      console.log('✅ Validation passed - Flow ready to save:', {
        title: startData.title,
        description: startData.description,
        mode: startData.mode,
        steps: state.nodes.filter((n) => n.type === 'step').length,
        edges: state.edges.length,
      })

      state.errors = {}

      // Future: integrate with workflow save API
    },
  },
})

export const {
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  updateNodeData,
  addNode,
  removeNode,
  setSelectedNode,
  resetFlow,
  setFieldError,
  setFieldErrors,
  clearFieldError,
  clearAllErrors,
  validateFlow,
  saveFlow,
} = flowSlice.actions

export default flowSlice.reducer
