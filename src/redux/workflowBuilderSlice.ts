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
import { WorkflowBuilderState } from './types/workflowBuilder'
import { handleConnection } from '@/utils/workflowBuilder/handleConnection'
import { createNode } from '@/utils/workflowBuilder/createNode'
import { removeNodeById as removeNodeByIdHelper } from '@/utils/workflowBuilder/removeNodeById'
import { updateNodeData as updateNodeDataHelper } from '@/utils/workflowBuilder/updateNodeData'
import { loadWorkflowIntoBuilder } from './asyncThunks/workflowBuilder'
import { getActivePartialRun, getWorkflowRuns } from './asyncThunks/workflow'
import type { WorkflowRun } from './types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
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
        const currentSnapshot = createSnapshot(state.nodes, state.edges)
        state.history.future.push(currentSnapshot)

        // Restore previous state
        state.nodes = previous.nodes
        state.edges = previous.edges
      }
    },
    redo: (state) => {
      const next = state.history.future.pop()
      if (next) {
        // Save current state to past
        const currentSnapshot = createSnapshot(state.nodes, state.edges)
        state.history.past.push(currentSnapshot)

        // Restore next state
        state.nodes = next.nodes
        state.edges = next.edges
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
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      state.nodes.push(action.payload)
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      // Save state before change
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      state.edges.push(action.payload)
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Node> }>
    ) => {
      // Save state before change
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      const { id, updates } = action.payload
      const nodeIndex = state.nodes.findIndex((node) => node.id === id)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates }
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      // Save state before change
      const snapshot = createSnapshot(state.nodes, state.edges)
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
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      const edgeId = action.payload
      state.edges = state.edges.filter((edge) => edge.id !== edgeId)
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
        const snapshot = createSnapshot(state.nodes, state.edges)
        pushToHistory(state, snapshot)
      }

      // Apply changes using ReactFlow's utility
      state.nodes = applyNodeChanges(action.payload, state.nodes)
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      // Check if this is a significant change (not just selection)
      if (hasSignificantEdgeChange(action.payload)) {
        const snapshot = createSnapshot(state.nodes, state.edges)
        pushToHistory(state, snapshot)
      }

      state.edges = applyEdgeChanges(action.payload, state.edges)
    },
    onConnect: (state, action: PayloadAction<Connection>) => {
      // Save state before change
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
      // Save state before change
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      const { type, position } = action.payload
      const result = createNode(type, position, state.nodes, state.edges)
      state.nodes = result.nodes
      state.edges = result.edges
      // Note: Toast handling will be done in the component via the shouldShowToast return value
    },
    removeNodeWithEdges: (state, action: PayloadAction<{ nodeId: string }>) => {
      // Save state before change
      const snapshot = createSnapshot(state.nodes, state.edges)
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
        runData.status === WorkflowRunStepStatus.Running ||
        runData.status === WorkflowRunStepStatus.PendingHumanInput
      // Nodes read directly from currentRun, no need to mutate node.data
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
      // If enabling manual mode, clear version selections
      if (action.payload) {
        state.selectedRunIds = {}
      }
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
    // Run version management - just track selection, don't mutate node data
    setNodeSelectedRun: (
      state,
      action: PayloadAction<{ nodeId: string; runId: number }>
    ) => {
      const { nodeId, runId } = action.payload
      state.selectedRunIds[nodeId] = runId
      // Don't mutate node.data - nodes will read from the selected run directly
    },
    resetBuilder: (state) => {
      // Preserve wsConnectionStatus since socket connection is managed separately
      // and persists across route changes
      const wsConnectionStatus = state.wsConnectionStatus
      return { ...initialState, wsConnectionStatus }
    },
    setSavingStatus: (
      state,
      action: PayloadAction<WorkflowBuilderState['savingStatus']>
    ) => {
      state.savingStatus = action.payload
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload
    },
    /**
     * Import nodes and edges from an external source (e.g., clipboard paste).
     * This action:
     * - Saves current state to history for undo support
     * - Adds imported nodes/edges to existing canvas (does not replace)
     * - Clears future history (new branch from current state)
     */
    importNodes: (
      state,
      action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
    ) => {
      // Save state before import for undo support
      const snapshot = createSnapshot(state.nodes, state.edges)
      pushToHistory(state, snapshot)

      // Add imported nodes and edges to existing ones
      const { nodes: importedNodes, edges: importedEdges } = action.payload
      state.nodes = [...state.nodes, ...importedNodes]
      state.edges = [...state.edges, ...importedEdges]
    },

    // WebSocket streaming actions
    setWsConnectionStatus: (
      state,
      action: PayloadAction<'disconnected' | 'connecting' | 'connected'>
    ) => {
      state.wsConnectionStatus = action.payload
    },
    setRightPanelTab: (
      state,
      action: PayloadAction<'config' | 'execution'>
    ) => {
      state.rightPanelTab = action.payload
    },
    clearStreamingResponses: (state) => {
      state.streamingResponses = {}
      state.activeStreamingNodeId = null
    },
    setShowExecutionPanel: (state, action: PayloadAction<boolean>) => {
      state.showExecutionPanel = action.payload
    },
    /**
     * Clear all execution-related state.
     * Used when switching between workflows to prevent stale data.
     */
    clearExecutionState: (state) => {
      state.currentRun = null
      state.isRunning = false
      state.currentPartialRunId = null
      state.executedStepNodeIds = []
      state.streamingResponses = {}
      state.activeStreamingNodeId = null
      state.pendingValidation = null
      state.showExecutionPanel = false
      state.availableRuns = []
      state.selectedRunIds = {}
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
          action.payload.currentRun?.status === WorkflowRunStepStatus.Running ||
          action.payload.currentRun?.status ===
            WorkflowRunStepStatus.PendingHumanInput
        state.lastWorkflowId = action.payload.workflow.id
        state.savedViewport = action.payload.viewport ?? null
        // Load manual mode state from workflow
        state.manualModeEnabled =
          action.payload.workflow.manualModeEnabled ?? false
        // Clear history when loading a workflow
        state.history.past = []
        state.history.future = []
        // Reset execution-related state when switching workflows
        state.currentPartialRunId = null
        state.executedStepNodeIds = []
        state.streamingResponses = {}
        state.activeStreamingNodeId = null
        state.pendingValidation = null
        state.showExecutionPanel = false
        state.availableRuns = []
        state.selectedRunIds = {}
      })
      .addCase(getActivePartialRun.fulfilled, (state, action) => {
        const { partialRun, executedStepNodeIds } = action.payload

        if (!partialRun) {
          return
        }

        // Set currentRun to the partial run for consistency with normal runs
        state.currentRun = partialRun
        state.currentPartialRunId = partialRun.id
        state.executedStepNodeIds = executedStepNodeIds
        // Nodes read directly from currentRun, no need to mutate node.data
      })
      .addCase(getWorkflowRuns.fulfilled, (state, action) => {
        // Store all available runs for the workflow
        state.availableRuns = action.payload
      })
      // WebSocket connection events
      .addMatcher(
        (action): action is { type: 'workflowWebsocket/connecting' } =>
          action.type === 'workflowWebsocket/connecting',
        (state) => {
          state.wsConnectionStatus = 'connecting'
        }
      )
      .addMatcher(
        (action): action is { type: 'workflowWebsocket/connected' } =>
          action.type === 'workflowWebsocket/connected',
        (state) => {
          state.wsConnectionStatus = 'connected'
        }
      )
      .addMatcher(
        (action): action is { type: 'workflowWebsocket/disconnected' } =>
          action.type === 'workflowWebsocket/disconnected',
        (state) => {
          state.wsConnectionStatus = 'disconnected'
        }
      )
      // Handle workflow subscription response with execution state
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/workflowSubscribed'
          payload: { workflowId: number; latestRun: WorkflowRun | null }
        } => action.type === 'workflowSocket/workflowSubscribed',
        (state, action) => {
          const { latestRun } = action.payload
          if (latestRun) {
            state.currentRun = latestRun
            state.isRunning =
              latestRun.status === 'running' ||
              latestRun.status === 'pending_human_input'

            // Extract pending validation from nodeStates if status is pending_human_input
            if (
              latestRun.status === 'pending_human_input' &&
              latestRun.nodeStates
            ) {
              state.showExecutionPanel = true

              // Find node with pending_human_input status in nodeStates
              const nodeStatesObj = latestRun.nodeStates as Record<
                string,
                {
                  nodeId: string
                  status: string
                  validationContext?: {
                    availableRoutes?: Array<{
                      name: string
                      description?: string
                    }>
                    aiRecommendation?: string
                    aiAnalysis?: string
                  }
                  metadata?: {
                    aiRecommendation?: string
                    aiAnalysis?: string
                  }
                }
              >

              for (const nodeState of Object.values(nodeStatesObj)) {
                if (
                  nodeState.status === 'pending_human_input' &&
                  nodeState.validationContext
                ) {
                  const { availableRoutes, aiRecommendation, aiAnalysis } =
                    nodeState.validationContext
                  if (availableRoutes && availableRoutes.length > 0) {
                    state.pendingValidation = {
                      nodeId: nodeState.nodeId,
                      routes: availableRoutes,
                      aiRecommendation:
                        nodeState.metadata?.aiRecommendation ||
                        aiRecommendation,
                      context: {
                        aiAnalysis:
                          nodeState.metadata?.aiAnalysis || aiAnalysis,
                      },
                    }
                    break // Only handle first pending validation
                  }
                }
              }
            } else if (latestRun.hasPendingValidation) {
              // Fallback to legacy flag
              state.showExecutionPanel = true
            }
          } else {
            state.currentRun = null
            state.isRunning = false
          }
        }
      )
      // WebSocket workflow execution events
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/executionStarted'
          payload: { workflowRunId: number }
        } => action.type === 'workflowSocket/executionStarted',
        (state, action) => {
          const { workflowRunId } = action.payload
          // Update currentRun with the new run ID so validation uses correct run
          if (state.currentRun) {
            state.currentRun = {
              ...state.currentRun,
              id: workflowRunId,
              status: WorkflowRunStepStatus.Running,
            }
          } else {
            // Create minimal run object if none exists
            state.currentRun = {
              id: workflowRunId,
              status: WorkflowRunStepStatus.Running,
            } as WorkflowRun
          }
          state.isRunning = true
          state.streamingResponses = {}
          state.activeStreamingNodeId = null
          state.showExecutionPanel = true
          state.pendingValidation = null // Clear any previous validation
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/singleStepStarted'
          payload: { workflowRunId: number; stepNodeId: string }
        } => action.type === 'workflowSocket/singleStepStarted',
        (state, action) => {
          const { workflowRunId, stepNodeId } = action.payload
          // Update currentRun with the new/existing partial run ID
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
              status: WorkflowRunStepStatus.Running,
              isPartial: true,
            } as WorkflowRun
          }
          state.currentPartialRunId = workflowRunId
          state.isRunning = true
          state.activeStreamingNodeId = stepNodeId
          state.showExecutionPanel = true
          state.pendingValidation = null
          // Don't clear streaming responses - keep previous step results
          if (!state.streamingResponses[stepNodeId]) {
            state.streamingResponses[stepNodeId] = { content: '' }
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/step_started'
          payload: { nodeId: string }
        } => action.type === 'workflowSocket/step_started',
        (state, action) => {
          const { nodeId } = action.payload
          state.activeStreamingNodeId = nodeId
          state.streamingResponses[nodeId] = { content: '' }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/step_streaming'
          payload: { nodeId: string; chunk: string }
        } => action.type === 'workflowSocket/step_streaming',
        (state, action) => {
          const { nodeId, chunk } = action.payload
          if (state.streamingResponses[nodeId] !== undefined) {
            state.streamingResponses[nodeId].content += chunk
          } else {
            state.streamingResponses[nodeId] = { content: chunk }
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/step_completed'
          payload: {
            nodeId: string
            response: string
            metadata?: {
              snippets?: Array<{
                id: number
                file: { id: number; name: string } | null
                text: string
                similarity_score: number
                chunk_index: number
                vector_db_source: string
              }>
              webSearchSources?: Array<{
                id: number
                url: string
                title: string
                cited_text: string
                page_age?: string
                provider: string
              }>
            }
          }
        } => action.type === 'workflowSocket/step_completed',
        (state, action) => {
          const { nodeId, response, metadata } = action.payload
          // Update streaming response with final content and metadata
          state.streamingResponses[nodeId] = {
            content: response,
            snippets: metadata?.snippets,
            webSearchSources: metadata?.webSearchSources,
          }
          // Clear active streaming node
          if (state.activeStreamingNodeId === nodeId) {
            state.activeStreamingNodeId = null
          }
          // Add to executed steps for manual mode tracking
          if (
            state.manualModeEnabled &&
            !state.executedStepNodeIds.includes(nodeId)
          ) {
            state.executedStepNodeIds.push(nodeId)
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/execution_complete'
          payload: { status: string; workflowRunId: number; endedAt?: string }
        } => action.type === 'workflowSocket/execution_complete',
        (state, action) => {
          const { status, endedAt } = action.payload
          state.isRunning = status === 'pending_human_input'
          state.activeStreamingNodeId = null

          // Update currentRun status to reflect completion
          if (state.currentRun) {
            state.currentRun = {
              ...state.currentRun,
              status: status as typeof state.currentRun.status,
              endedAt: endedAt || state.currentRun.endedAt,
            }
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/step_error'
          payload: { nodeId?: string }
        } => action.type === 'workflowSocket/step_error',
        (state, action) => {
          const { nodeId } = action.payload
          if (nodeId && state.activeStreamingNodeId === nodeId) {
            state.activeStreamingNodeId = null
          }
        }
      )
      // Handle workflow status updates (including pending validations)
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/workflow_status'
          payload: WorkflowRun & {
            type: 'workflow_status'
            has_pending_validation?: boolean
            pending_validations?: Array<{
              node_id: string
              available_routes: Array<{ name: string; description?: string }>
              ai_recommendation?: string
              ai_analysis?: string
            }>
          }
        } => action.type === 'workflowSocket/workflow_status',
        (state, action) => {
          const {
            status,
            has_pending_validation,
            pending_validations,
            ...runData
          } = action.payload

          // Set current run from the full workflow status data
          // Remove the 'type' field which is only for socket event identification
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { type: _eventType, ...workflowRunData } =
            runData as WorkflowRun & { type: string }
          state.currentRun = { ...workflowRunData, status } as WorkflowRun

          // Show execution panel when we receive workflow status
          state.showExecutionPanel = true

          // Update running state based on status
          state.isRunning =
            status === 'running' || status === 'pending_human_input'

          // Handle pending validations from status update
          if (
            has_pending_validation &&
            pending_validations &&
            pending_validations.length > 0
          ) {
            const firstValidation = pending_validations[0]
            state.pendingValidation = {
              nodeId: firstValidation.node_id,
              routes: firstValidation.available_routes,
              aiRecommendation: firstValidation.ai_recommendation,
              context: {
                aiAnalysis: firstValidation.ai_analysis,
              },
            }
          } else if (status !== 'pending_human_input') {
            // Clear pending validation if status is no longer waiting
            state.pendingValidation = null
          }
        }
      )
      .addMatcher(
        (
          action
        ): action is {
          type: 'workflowSocket/validation_required'
          payload: {
            nodeId: string
            routes: Array<{ name: string; description?: string }>
            context?: Record<string, unknown>
            aiRecommendation?: string
          }
        } => action.type === 'workflowSocket/validation_required',
        (state, action) => {
          // Workflow is paused waiting for human input
          state.isRunning = true // Still considered "running" but waiting
          state.activeStreamingNodeId = null
          state.pendingValidation = {
            nodeId: action.payload.nodeId,
            routes: action.payload.routes,
            context: action.payload.context,
            aiRecommendation: action.payload.aiRecommendation,
          }
        }
      )
      // Clear validation when submitted
      .addMatcher(
        (action): action is { type: 'workflowSocket/validationSubmitted' } =>
          action.type === 'workflowSocket/validationSubmitted',
        (state) => {
          state.pendingValidation = null
        }
      )
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
  setCurrentMode,
  setLastWorkflowId,
  setSavedViewport,
  onNodesChange,
  onEdgesChange,
  onConnect,
  createNodeAtPosition,
  removeNodeWithEdges,
  updateNodeDataById,
  updateStepApiIds,
  updateWorkflowRunStatus,
  collapseAllNodes,
  expandAllNodes,
  toggleNodeCollapse,
  setManualMode,
  setCurrentPartialRunId,
  markStepExecuted,
  resetPartialRun,
  setNodeSelectedRun,
  resetBuilder,
  setSavingStatus,
  importNodes,
  setSelectedNodeId,
  setWsConnectionStatus,
  setRightPanelTab,
  clearStreamingResponses,
  setShowExecutionPanel,
  clearExecutionState,
} = workflowBuilderSlice.actions

export default workflowBuilderSlice.reducer
