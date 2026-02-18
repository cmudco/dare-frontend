import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit'
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
import {
  WorkflowBuilderState,
  OutputDisplayMode,
} from './types/workflowBuilder'
import { handleConnection } from '@/utils/workflowBuilder/handleConnection'
import { createNode } from '@/utils/workflowBuilder/createNode'
import { removeNodeById as removeNodeByIdHelper } from '@/utils/workflowBuilder/removeNodeById'
import { updateNodeData as updateNodeDataHelper } from '@/utils/workflowBuilder/updateNodeData'
import { getConnectedOutputNodeIds } from '@/utils/workflowBuilder/getConnectedOutputNodeIds'
import { loadWorkflowIntoBuilder } from './asyncThunks/workflowBuilder'
import { getActivePartialRun, getWorkflowRuns } from './asyncThunks/workflow'
import type {
  WorkflowRun,
  NodeStatesMap,
  RouteOption,
  PendingValidationContext,
  WorkflowStepSnippet,
  WorkflowStepWebSearchSource,
} from './types/workflow'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'
import { debugLog } from '@/utils/debugLogger'
import {
  createSnapshot,
  pushToHistory,
  hasSignificantNodeChange,
  hasSignificantEdgeChange,
} from './utils/historyHelpers'

// ════════════════════════════════════════════════════════════════════════════
// SOCKET ACTIONS (dispatched by workflowSocketMiddleware)
// ════════════════════════════════════════════════════════════════════════════

const wsConnecting = createAction('workflowWebsocket/connecting')
const wsConnected = createAction('workflowWebsocket/connected')
const wsDisconnected = createAction('workflowWebsocket/disconnected')

const workflowSubscribed = createAction<{
  workflowId: number
  latestRun: WorkflowRun | null
}>('workflowSocket/workflowSubscribed')

const executionStarted = createAction<{ workflowRunId: number }>(
  'workflowSocket/executionStarted'
)

const singleStepStarted = createAction<{
  workflowRunId: number
  stepNodeId: string
}>('workflowSocket/singleStepStarted')

const stepStarted = createAction<{ nodeId: string; nodeType?: string }>(
  'workflowSocket/step_started'
)

const stepStreaming = createAction<{ nodeId: string; chunk: string }>(
  'workflowSocket/step_streaming'
)

const stepCompleted = createAction<{
  nodeId: string
  response: string
  status?: string
  metadata?: {
    snippets?: WorkflowStepSnippet[]
    webSearchSources?: WorkflowStepWebSearchSource[]
  }
}>('workflowSocket/step_completed')

const executionComplete = createAction<{
  status: string
  workflowRunId: number
  endedAt?: string
}>('workflowSocket/execution_complete')

const stepError = createAction<{ nodeId?: string; error?: string }>(
  'workflowSocket/step_error'
)

const workflowStatus = createAction<WorkflowRun & { type: 'workflow_status' }>(
  'workflowSocket/workflow_status'
)

const validationRequired = createAction<{
  nodeId: string
  routes: RouteOption[]
  context?: PendingValidationContext
  aiRecommendation?: string
}>('workflowSocket/validation_required')

const validationSubmitted = createAction('workflowSocket/validationSubmitted')

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Initialize nodeStates for all workflow nodes with pending status.
 * Called when execution starts so every node has an entry to write to.
 */
function initializeNodeStates(nodes: Node[]): NodeStatesMap {
  const states: NodeStatesMap = {}
  for (const node of nodes) {
    states[node.id] = {
      nodeId: node.id,
      stepId: null,
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
 * Ensure a nodeState entry exists for a given nodeId.
 * Creates a minimal entry if missing (defensive for late-arriving events).
 */
function ensureNodeState(
  nodeStates: NodeStatesMap,
  nodeId: string,
  nodeType = 'unknown'
): void {
  if (!nodeStates[nodeId]) {
    nodeStates[nodeId] = {
      nodeId,
      stepId: null,
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

/**
 * Propagate execution state to connected output nodes (nodes display mode only).
 * Output nodes mirror their source step's response.
 */
function propagateToOutputNodes(
  state: WorkflowBuilderState,
  sourceNodeId: string,
  update: {
    response?: string
    append?: string
    status?: WorkflowRunStepStatus
    snippets?: WorkflowStepSnippet[]
    webSearchSources?: WorkflowStepWebSearchSource[]
  }
): void {
  if (state.outputDisplayMode !== OutputDisplayMode.Nodes) return
  if (!state.currentRun?.nodeStates) return

  const outputNodeIds = getConnectedOutputNodeIds(
    sourceNodeId,
    state.edges,
    state.nodes
  )
  for (const outputNodeId of outputNodeIds) {
    ensureNodeState(
      state.currentRun.nodeStates,
      outputNodeId,
      WorkflowNodeType.ChatOutput
    )
    const outputState = state.currentRun.nodeStates[outputNodeId]

    if (update.response !== undefined) {
      outputState.response = update.response
    }
    if (update.append !== undefined) {
      outputState.response = (outputState.response || '') + update.append
    }
    if (update.status !== undefined) {
      outputState.status = update.status
    }
    if (update.snippets !== undefined) {
      outputState.snippets = update.snippets
    }
    if (update.webSearchSources !== undefined) {
      outputState.webSearchSources = update.webSearchSources
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════════════════════════

const workflowBuilderSlice = createSlice({
  name: 'workflowBuilder',
  initialState,
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
          return { ...node, data: { ...node.data, apiId: stepApiIds[node.id] } }
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

    // ── Execution State ──────────────────────────────────────────────────
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
      action: PayloadAction<WorkflowBuilderState['savingStatus']>
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
    setRightPanelTab: (
      state,
      action: PayloadAction<'config' | 'execution'>
    ) => {
      state.rightPanelTab = action.payload
    },
    setShowExecutionPanel: (state, action: PayloadAction<boolean>) => {
      state.showExecutionPanel = action.payload
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
      return { ...initialState, wsConnectionStatus }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Async Thunks ─────────────────────────────────────────────────
      .addCase(loadWorkflowIntoBuilder.fulfilled, (state, action) => {
        debugLog('📂 loadWorkflowIntoBuilder.fulfilled:', {
          workflowId: action.payload.workflow.id,
        })

        // Static workflow data from REST
        state.nodes = action.payload.nodes
        state.edges = action.payload.edges
        state.loadedWorkflow = action.payload.workflow
        state.lastWorkflowId = action.payload.workflow.id
        state.savedViewport = action.payload.viewport ?? null
        state.manualModeEnabled =
          action.payload.workflow.manualModeEnabled ?? false
        state.outputDisplayMode =
          action.payload.workflow.outputDisplayMode ?? OutputDisplayMode.Panel

        // Clear history when loading a workflow
        state.history.past = []
        state.history.future = []

        // Reset execution state — socket is the source of truth for execution
        state.activeNodeId = null
        state.availableRuns = []
        state.selectedRunIds = {}
      })
      .addCase(getActivePartialRun.fulfilled, (state, action) => {
        const { partialRun, executedStepNodeIds } = action.payload
        if (!partialRun) return

        state.currentRun = partialRun
        state.currentPartialRunId = partialRun.id
        state.executedStepNodeIds = executedStepNodeIds
      })
      .addCase(getWorkflowRuns.fulfilled, (state, action) => {
        state.availableRuns = action.payload
      })

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

      // ── Workflow Subscription ────────────────────────────────────────
      .addCase(workflowSubscribed, (state, action) => {
        const { latestRun, workflowId } = action.payload
        debugLog('🔔 workflowSocket/workflowSubscribed:', {
          workflowId,
          runId: latestRun?.id,
          runStatus: latestRun?.status,
        })

        if (latestRun) {
          state.currentRun = latestRun
          state.isRunning =
            latestRun.status === 'running' ||
            latestRun.status === 'pending_human_input'

          state.pendingValidation = latestRun.pendingValidation ?? null
          if (state.pendingValidation) {
            state.showExecutionPanel = true
          }
        } else {
          state.currentRun = null
          state.isRunning = false
          state.pendingValidation = null
        }
      })

      // ── Execution Lifecycle ──────────────────────────────────────────
      .addCase(executionStarted, (state, action) => {
        const { workflowRunId } = action.payload
        debugLog('🚀 executionStarted, runId:', workflowRunId)

        const baseRun = state.currentRun || ({} as WorkflowRun)
        state.currentRun = {
          ...baseRun,
          id: workflowRunId,
          status: WorkflowRunStepStatus.Running,
          nodeStates: initializeNodeStates(state.nodes),
        }
        state.isRunning = true
        state.activeNodeId = null
        state.pendingValidation = null

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }
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
            status: WorkflowRunStepStatus.Running,
            isPartial: true,
            nodeStates: initializeNodeStates(state.nodes),
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

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }
      })

      // ── Step Execution Events ────────────────────────────────────────
      .addCase(stepStarted, (state, action) => {
        const { nodeId, nodeType } = action.payload
        state.activeNodeId = nodeId

        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId, nodeType)
        state.currentRun.nodeStates[nodeId].status =
          WorkflowRunStepStatus.Running
        state.currentRun.nodeStates[nodeId].response = ''

        propagateToOutputNodes(state, nodeId, {
          status: WorkflowRunStepStatus.Running,
          response: '',
        })
      })
      .addCase(stepStreaming, (state, action) => {
        const { nodeId, chunk } = action.payload
        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId)
        state.currentRun.nodeStates[nodeId].response =
          (state.currentRun.nodeStates[nodeId].response || '') + chunk

        propagateToOutputNodes(state, nodeId, { append: chunk })
      })
      .addCase(stepCompleted, (state, action) => {
        const { nodeId, response, metadata } = action.payload
        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId)
        const nodeState = state.currentRun.nodeStates[nodeId]
        nodeState.response = response
        nodeState.status = WorkflowRunStepStatus.Completed
        nodeState.snippets = metadata?.snippets || []
        nodeState.webSearchSources = metadata?.webSearchSources || []

        propagateToOutputNodes(state, nodeId, {
          response,
          status: WorkflowRunStepStatus.Completed,
          snippets: metadata?.snippets,
          webSearchSources: metadata?.webSearchSources,
        })

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
        const { status, endedAt } = action.payload
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
        const { nodeId } = action.payload
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _eventType, ...workflowRunData } =
          runData as WorkflowRun & { type: string }
        state.currentRun = { ...workflowRunData, status } as WorkflowRun

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }

        state.isRunning =
          status === 'running' || status === 'pending_human_input'

        if (pendingValidation) {
          state.pendingValidation = pendingValidation
        } else if (status !== 'pending_human_input') {
          state.pendingValidation = null
        }
      })

      // ── Human Validation ─────────────────────────────────────────────
      .addCase(validationRequired, (state, action) => {
        state.isRunning = true
        state.activeNodeId = null
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
  expandAllOutputNodes,
  collapseAllOutputNodes,
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
  setShowExecutionPanel,
  setOutputDisplayMode,
  toggleOutputDisplayMode,
  clearExecutionState,
} = workflowBuilderSlice.actions

export default workflowBuilderSlice.reducer
