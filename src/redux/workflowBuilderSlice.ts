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
  BatchFileStatus,
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

const stepStarted = createAction<{
  nodeId: string
  nodeType?: string
  stepNumber?: number
  startedAt?: string
  workflowRunId?: number
}>('workflowSocket/step_started')

const stepStreaming = createAction<{
  nodeId: string
  chunk: string
  workflowRunId?: number
}>('workflowSocket/step_streaming')

const stepCompleted = createAction<{
  nodeId: string
  response: string
  status?: string
  metadata?: {
    snippets?: WorkflowStepSnippet[]
    webSearchSources?: WorkflowStepWebSearchSource[]
  }
  workflowRunId?: number
}>('workflowSocket/step_completed')

const executionComplete = createAction<{
  status: string
  workflowRunId: number
  endedAt?: string
}>('workflowSocket/execution_complete')

const stepError = createAction<{
  nodeId?: string
  error?: string
  workflowRunId?: number
}>('workflowSocket/step_error')

const workflowStatus = createAction<WorkflowRun & { type: 'workflow_status' }>(
  'workflowSocket/workflow_status'
)

const validationRequired = createAction<{
  nodeId: string
  routes: RouteOption[]
  context?: PendingValidationContext
  aiRecommendation?: string
  workflowRunId?: number
}>('workflowSocket/validation_required')

const validationSubmitted = createAction('workflowSocket/validationSubmitted')

const batchStarted = createAction<{
  batchId: number
  totalFiles: number
  workflowId: number
}>('workflowSocket/batch_started')

const batchProgress = createAction<{
  batchId: number
  index: number
  total: number
  fileId: number
  fileName: string
  status: 'running' | 'completed' | 'failed'
  workflowRunId?: number
}>('workflowSocket/batch_progress')

const batchComplete = createAction<{
  batchId: number
  completedCount: number
  failedCount: number
  totalFiles: number
}>('workflowSocket/batch_complete')

const batchSummaryLoaded = createAction<{
  batchId: number
  workflowId: number
  status: string
  totalFiles: number
  completedCount: number
  failedCount: number
  fileStatuses: BatchFileStatus[]
  latestRunId?: number | null
}>('workflowSocket/batch_summary_loaded')

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
      startedAt: null,
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

function isWorkflowRunActive(run: WorkflowRun | null): boolean {
  if (!run) return false
  return (
    run.status === WorkflowRunStepStatus.Running ||
    run.status === WorkflowRunStepStatus.PendingHumanInput
  )
}

function getWorkflowRunWorkflowId(run: WorkflowRun | null): number | null {
  return run && typeof run.workflow === 'number' ? run.workflow : null
}

function isWorkflowRunForWorkflow(
  run: WorkflowRun | null,
  workflowId: number
): boolean {
  return getWorkflowRunWorkflowId(run) === workflowId
}

function getPreferredResponse(
  cachedResponse?: string | null,
  incomingResponse?: string | null
): string | null {
  const cachedText = cachedResponse ?? null
  const incomingText = incomingResponse ?? null

  if (cachedText === null) return incomingText
  if (incomingText === null) return cachedText

  return cachedText.length > incomingText.length ? cachedText : incomingText
}

function mergeNodeStates(
  cachedNodeStates?: NodeStatesMap,
  incomingNodeStates?: NodeStatesMap
): NodeStatesMap | undefined {
  if (!cachedNodeStates) return incomingNodeStates
  if (!incomingNodeStates) return cachedNodeStates

  const mergedNodeStates: NodeStatesMap = {}
  const nodeIds = new Set([
    ...Object.keys(cachedNodeStates),
    ...Object.keys(incomingNodeStates),
  ])

  for (const nodeId of nodeIds) {
    const cachedNodeState = cachedNodeStates[nodeId]
    const incomingNodeState = incomingNodeStates[nodeId]

    if (!cachedNodeState && incomingNodeState) {
      mergedNodeStates[nodeId] = incomingNodeState
      continue
    }

    if (cachedNodeState && !incomingNodeState) {
      mergedNodeStates[nodeId] = cachedNodeState
      continue
    }

    if (!cachedNodeState || !incomingNodeState) {
      continue
    }

    mergedNodeStates[nodeId] = {
      ...cachedNodeState,
      ...incomingNodeState,
      response: getPreferredResponse(
        cachedNodeState.response,
        incomingNodeState.response
      ),
      snippets: incomingNodeState.snippets ?? cachedNodeState.snippets ?? [],
      webSearchSources:
        incomingNodeState.webSearchSources ??
        cachedNodeState.webSearchSources ??
        [],
      metadata:
        incomingNodeState.metadata !== undefined
          ? incomingNodeState.metadata
          : (cachedNodeState.metadata ?? null),
      validationContext:
        incomingNodeState.validationContext !== undefined
          ? incomingNodeState.validationContext
          : (cachedNodeState.validationContext ?? null),
    }
  }

  return mergedNodeStates
}

function mergeWorkflowRuns(
  cachedRun: WorkflowRun | null,
  incomingRun: WorkflowRun | null
): WorkflowRun | null {
  if (!cachedRun) return incomingRun
  if (!incomingRun) return cachedRun

  if (cachedRun.id !== incomingRun.id) {
    return incomingRun.id > cachedRun.id ? incomingRun : cachedRun
  }

  return {
    ...cachedRun,
    ...incomingRun,
    nodeStates: mergeNodeStates(cachedRun.nodeStates, incomingRun.nodeStates),
    pendingValidation:
      incomingRun.pendingValidation !== undefined
        ? incomingRun.pendingValidation
        : (cachedRun.pendingValidation ?? null),
  }
}

function createEmptyBatchRunState(): WorkflowBuilderState['batchRun'] {
  return {
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

function clearExecutionStateFields(state: WorkflowBuilderState): void {
  state.currentRun = null
  state.isRunning = false
  state.currentPartialRunId = null
  state.executedStepNodeIds = []
  state.activeNodeId = null
  state.pendingValidation = null
  state.showExecutionPanel = false
  state.availableRuns = []
  state.selectedRunIds = {}
  state.batchRun = createEmptyBatchRunState()
}

function getRunningNodeId(run: WorkflowRun | null): string | null {
  if (!run?.nodeStates) return null

  return (
    Object.keys(run.nodeStates).find(
      (nodeId) =>
        run.nodeStates?.[nodeId]?.status === WorkflowRunStepStatus.Running
    ) || null
  )
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

function createBatchRunStub(
  state: WorkflowBuilderState,
  workflowRunId: number
) {
  const workflowId = state.loadedWorkflow?.id || state.lastWorkflowId || 0
  const workflowTitle = state.loadedWorkflow?.title || ''
  const workflowDescription = state.loadedWorkflow?.description || ''

  return {
    id: workflowRunId,
    workflow: workflowId,
    user: 0,
    status: WorkflowRunStepStatus.Running,
    startedAt: new Date().toISOString(),
    endedAt: null,
    workflowTitle,
    workflowDescription,
    isPartial: false,
    nodeStates: initializeNodeStates(state.nodes),
  } as WorkflowRun
}

function ensureBatchRun(
  state: WorkflowBuilderState,
  workflowRunId: number
): WorkflowRun {
  if (!state.batchRun.runsById[workflowRunId]) {
    state.batchRun.runsById[workflowRunId] = createBatchRunStub(
      state,
      workflowRunId
    )
  }
  return state.batchRun.runsById[workflowRunId]
}

function isBatchRunEvent(
  state: WorkflowBuilderState,
  workflowRunId?: number
): boolean {
  if (!workflowRunId) return false
  if (state.batchRun.runsById[workflowRunId]) return true
  if (
    state.batchRun.isActive &&
    workflowRunId !== state.currentRun?.id &&
    workflowRunId !== state.currentPartialRunId
  ) {
    return true
  }
  return state.batchRun.fileStatuses.some(
    (status) => status.workflowRunId === workflowRunId
  )
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
      clearExecutionStateFields(state)
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

    setSelectedBatchRunId: (state, action: PayloadAction<number | null>) => {
      state.batchRun.selectedRunId = action.payload
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
    setBatchProgressDismissed: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.batchRun.dismissedBatchId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Async Thunks ─────────────────────────────────────────────────
      .addCase(loadWorkflowIntoBuilder.fulfilled, (state, action) => {
        debugLog('📂 loadWorkflowIntoBuilder.fulfilled:', {
          workflowId: action.payload.workflow.id,
        })

        const previousWorkflowId = state.lastWorkflowId
        const incomingWorkflowId = action.payload.workflow.id
        const cachedRunForWorkflow = isWorkflowRunForWorkflow(
          state.currentRun,
          incomingWorkflowId
        )
          ? state.currentRun
          : null
        const isWorkflowSwitch =
          previousWorkflowId !== undefined &&
          previousWorkflowId !== incomingWorkflowId

        if (isWorkflowSwitch) {
          clearExecutionStateFields(state)
        }

        // Static workflow data from REST
        state.nodes = action.payload.nodes
        state.edges = action.payload.edges
        state.loadedWorkflow = action.payload.workflow
        state.lastWorkflowId = incomingWorkflowId
        state.savedViewport = action.payload.viewport ?? null
        state.manualModeEnabled =
          action.payload.workflow.manualModeEnabled ?? false
        state.outputDisplayMode =
          action.payload.workflow.outputDisplayMode ?? OutputDisplayMode.Panel

        // Clear history when loading a workflow
        state.history.past = []
        state.history.future = []
        state.availableRuns = []
        state.selectedRunIds = {}
        const hasBatchRunForWorkflow =
          state.batchRun.workflowId === incomingWorkflowId

        if (!hasBatchRunForWorkflow) {
          state.batchRun = createEmptyBatchRunState()
        }

        if (!cachedRunForWorkflow) {
          state.currentPartialRunId = null
          state.executedStepNodeIds = []
          state.pendingValidation = null
          state.activeNodeId = null
        }

        state.currentRun = mergeWorkflowRuns(
          cachedRunForWorkflow,
          action.payload.currentRun
        )
        state.pendingValidation = state.currentRun?.pendingValidation ?? null
        state.activeNodeId = getRunningNodeId(state.currentRun)
        state.isRunning =
          isWorkflowRunActive(state.currentRun) || state.batchRun.isActive

        if (
          state.isRunning &&
          state.outputDisplayMode === OutputDisplayMode.Panel
        ) {
          state.showExecutionPanel = true
        } else if (!state.isRunning && !state.pendingValidation) {
          state.showExecutionPanel = false
        }

        // Restore execution UI after outputDisplayMode is set from workflow.
        // Handles case where socket subscription fired before REST loaded the workflow.
        if (state.isRunning && state.currentRun) {
          if (state.outputDisplayMode === OutputDisplayMode.Panel) {
            state.showExecutionPanel = true
          }

          if (!state.activeNodeId) {
            const runningNodeId = getRunningNodeId(state.currentRun)
            if (runningNodeId) {
              state.activeNodeId = runningNodeId
            }
          }
        }
      })
      .addCase(getActivePartialRun.fulfilled, (state, action) => {
        const { partialRun, executedStepNodeIds } = action.payload
        if (!partialRun) return

        state.currentRun = mergeWorkflowRuns(state.currentRun, partialRun)
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
          const cachedRun = isWorkflowRunForWorkflow(
            state.currentRun,
            workflowId
          )
            ? state.currentRun
            : null
          state.currentRun = mergeWorkflowRuns(cachedRun, latestRun)
          state.isRunning =
            isWorkflowRunActive(state.currentRun) || state.batchRun.isActive

          state.pendingValidation = state.currentRun?.pendingValidation ?? null
          if (state.pendingValidation) {
            state.showExecutionPanel = true
          }

          // Restore UI visibility for running workflows on reconnect
          if (
            state.isRunning &&
            state.outputDisplayMode === OutputDisplayMode.Panel
          ) {
            state.showExecutionPanel = true
          }

          // Restore active node from nodeStates so the streaming indicator shows
          const runningNodeId = getRunningNodeId(state.currentRun)
          if (runningNodeId) {
            state.activeNodeId = runningNodeId
          }
        } else {
          state.currentRun = null
          state.isRunning = state.batchRun.isActive
          state.pendingValidation = null
          state.activeNodeId = null
        }
      })

      // ── Execution Lifecycle ──────────────────────────────────────────
      .addCase(executionStarted, (state, action) => {
        const { workflowRunId } = action.payload
        debugLog('🚀 executionStarted, runId:', workflowRunId)

        const baseRun = state.currentRun || ({} as WorkflowRun)
        const workflowId = state.loadedWorkflow?.id || state.lastWorkflowId || 0
        state.currentRun = {
          ...baseRun,
          id: workflowRunId,
          workflow: workflowId,
          status: WorkflowRunStepStatus.Running,
          workflowTitle:
            baseRun.workflowTitle || state.loadedWorkflow?.title || '',
          workflowDescription:
            baseRun.workflowDescription ||
            state.loadedWorkflow?.description ||
            '',
          nodeStates: initializeNodeStates(state.nodes),
        }
        state.isRunning = true
        state.activeNodeId = null
        state.pendingValidation = null
        state.batchRun.selectedRunId = null
        state.batchRun.latestRunIsBatch = false

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }
      })
      .addCase(singleStepStarted, (state, action) => {
        const { workflowRunId, stepNodeId } = action.payload
        const workflowId = state.loadedWorkflow?.id || state.lastWorkflowId || 0

        if (state.currentRun) {
          state.currentRun = {
            ...state.currentRun,
            id: workflowRunId,
            workflow: workflowId,
            status: WorkflowRunStepStatus.Running,
            isPartial: true,
          }
        } else {
          state.currentRun = {
            id: workflowRunId,
            workflow: workflowId,
            user: 0,
            status: WorkflowRunStepStatus.Running,
            startedAt: new Date().toISOString(),
            endedAt: null,
            workflowTitle: state.loadedWorkflow?.title || '',
            workflowDescription: state.loadedWorkflow?.description || '',
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
        state.batchRun.selectedRunId = null
        state.batchRun.latestRunIsBatch = false

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }
      })

      // ── Step Execution Events ────────────────────────────────────────
      .addCase(stepStarted, (state, action) => {
        const { nodeId, nodeType, startedAt, workflowRunId } = action.payload

        if (isBatchRunEvent(state, workflowRunId)) {
          const run = ensureBatchRun(state, workflowRunId as number)
          if (run.nodeStates) {
            ensureNodeState(run.nodeStates, nodeId, nodeType)
            run.nodeStates[nodeId].status = WorkflowRunStepStatus.Running
            run.nodeStates[nodeId].response = ''
            if (startedAt) {
              run.nodeStates[nodeId].startedAt = startedAt
            }
          }
          state.batchRun.activeNodeIds[workflowRunId as number] = nodeId
          return
        }

        state.activeNodeId = nodeId

        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId, nodeType)
        state.currentRun.nodeStates[nodeId].status =
          WorkflowRunStepStatus.Running
        state.currentRun.nodeStates[nodeId].response = ''
        if (startedAt) {
          state.currentRun.nodeStates[nodeId].startedAt = startedAt
        }

        propagateToOutputNodes(state, nodeId, {
          status: WorkflowRunStepStatus.Running,
          response: '',
        })
      })
      .addCase(stepStreaming, (state, action) => {
        const { nodeId, chunk, workflowRunId } = action.payload

        if (isBatchRunEvent(state, workflowRunId)) {
          const run = ensureBatchRun(state, workflowRunId as number)
          if (!run.nodeStates) return
          ensureNodeState(run.nodeStates, nodeId)
          run.nodeStates[nodeId].response =
            (run.nodeStates[nodeId].response || '') + chunk
          state.batchRun.activeNodeIds[workflowRunId as number] = nodeId
          return
        }

        if (!state.currentRun?.nodeStates) return

        ensureNodeState(state.currentRun.nodeStates, nodeId)
        state.currentRun.nodeStates[nodeId].response =
          (state.currentRun.nodeStates[nodeId].response || '') + chunk

        propagateToOutputNodes(state, nodeId, { append: chunk })
      })
      .addCase(stepCompleted, (state, action) => {
        const { nodeId, response, metadata, workflowRunId } = action.payload

        if (isBatchRunEvent(state, workflowRunId)) {
          const run = ensureBatchRun(state, workflowRunId as number)
          if (!run.nodeStates) return
          ensureNodeState(run.nodeStates, nodeId)
          const nodeState = run.nodeStates[nodeId]
          nodeState.response = response
          nodeState.status = WorkflowRunStepStatus.Completed
          nodeState.snippets = metadata?.snippets || []
          nodeState.webSearchSources = metadata?.webSearchSources || []
          state.batchRun.activeNodeIds[workflowRunId as number] = null
          return
        }

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
        const { status, endedAt, workflowRunId } = action.payload

        if (isBatchRunEvent(state, workflowRunId)) {
          const run = ensureBatchRun(state, workflowRunId as number)
          run.status = status as typeof run.status
          run.endedAt = endedAt || run.endedAt
          state.batchRun.activeNodeIds[workflowRunId as number] = null
          return
        }

        state.isRunning =
          status === 'pending_human_input' || state.batchRun.isActive
        state.activeNodeId = null
        state.batchRun.latestRunIsBatch = false

        if (state.currentRun) {
          state.currentRun = {
            ...state.currentRun,
            status: status as typeof state.currentRun.status,
            endedAt: endedAt || state.currentRun.endedAt,
          }
        }
      })
      .addCase(stepError, (state, action) => {
        const { nodeId, workflowRunId } = action.payload

        if (isBatchRunEvent(state, workflowRunId) && nodeId) {
          const run = ensureBatchRun(state, workflowRunId as number)
          if (run.nodeStates?.[nodeId]) {
            run.nodeStates[nodeId].status = WorkflowRunStepStatus.Failed
            run.nodeStates[nodeId].error = action.payload.error || null
          }
          state.batchRun.activeNodeIds[workflowRunId as number] = null
          return
        }

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
        const workflowRunId = action.payload.id

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _eventType, ...workflowRunData } =
          runData as WorkflowRun & { type: string }

        if (isBatchRunEvent(state, workflowRunId)) {
          state.batchRun.runsById[workflowRunId] = {
            ...workflowRunData,
            status,
          } as WorkflowRun
          return
        }

        const incomingRun = { ...workflowRunData, status } as WorkflowRun
        state.currentRun = mergeWorkflowRuns(state.currentRun, incomingRun)

        if (state.outputDisplayMode === OutputDisplayMode.Panel) {
          state.showExecutionPanel = true
        }

        state.isRunning =
          isWorkflowRunActive(state.currentRun) || state.batchRun.isActive

        state.pendingValidation = pendingValidation ?? null
        state.activeNodeId = getRunningNodeId(state.currentRun)
      })

      // ── Human Validation ─────────────────────────────────────────────
      .addCase(validationRequired, (state, action) => {
        if (isBatchRunEvent(state, action.payload.workflowRunId)) {
          return
        }
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

      // ── Batch Execution ─────────────────────────────────────────────
      .addCase(batchStarted, (state, action) => {
        state.batchRun = {
          isActive: true,
          batchId: action.payload.batchId,
          workflowId: action.payload.workflowId,
          latestRunIsBatch: true,
          dismissedBatchId: null,
          totalFiles: action.payload.totalFiles,
          completedCount: 0,
          failedCount: 0,
          currentIndex: 0,
          fileStatuses: [],
          runsById: {},
          activeNodeIds: {},
          selectedRunId: null,
        }
        state.isRunning = true
      })
      .addCase(batchProgress, (state, action) => {
        const {
          batchId,
          index,
          total,
          fileId,
          fileName,
          status,
          workflowRunId,
        } = action.payload

        if (state.batchRun.batchId !== batchId) {
          state.batchRun.batchId = batchId
        }

        state.batchRun.isActive = true
        state.batchRun.totalFiles = total
        state.batchRun.currentIndex = index
        state.isRunning = true

        const existing = state.batchRun.fileStatuses.find(
          (item) => item.fileId === fileId
        )
        const previousStatus = existing?.status

        const updatedStatus: BatchFileStatus = {
          fileId,
          fileName,
          status,
          workflowRunId,
          index,
        }

        if (existing) {
          Object.assign(existing, updatedStatus)
        } else {
          state.batchRun.fileStatuses.push(updatedStatus)
        }

        if (status === 'completed' && previousStatus !== 'completed') {
          state.batchRun.completedCount += 1
        }
        if (status === 'failed' && previousStatus !== 'failed') {
          state.batchRun.failedCount += 1
        }

        if (workflowRunId) {
          ensureBatchRun(state, workflowRunId)
          if (!state.batchRun.selectedRunId) {
            state.batchRun.selectedRunId = workflowRunId
          }
        }

        state.batchRun.fileStatuses.sort((a, b) => a.index - b.index)
      })
      .addCase(batchComplete, (state, action) => {
        state.batchRun.isActive = false
        state.batchRun.completedCount = action.payload.completedCount
        state.batchRun.failedCount = action.payload.failedCount
        state.batchRun.totalFiles = action.payload.totalFiles
        state.isRunning =
          isWorkflowRunActive(state.currentRun) || state.batchRun.isActive
      })
      .addCase(batchSummaryLoaded, (state, action) => {
        const {
          batchId,
          workflowId,
          status,
          totalFiles,
          completedCount,
          failedCount,
          fileStatuses,
          latestRunId,
        } = action.payload

        const isActive = status === 'running'
        const sortedStatuses = [...fileStatuses].sort(
          (a, b) => a.index - b.index
        )
        const batchRunIds = new Set(
          sortedStatuses
            .map((statusItem) => statusItem.workflowRunId)
            .filter((runId): runId is number => typeof runId === 'number')
        )
        const latestRunIsBatch =
          typeof latestRunId === 'number' && batchRunIds.has(latestRunId)
        const lastBatchRunId =
          [...sortedStatuses]
            .reverse()
            .find((statusItem) => statusItem.workflowRunId)?.workflowRunId ??
          null
        state.batchRun = {
          isActive,
          batchId,
          workflowId,
          latestRunIsBatch,
          dismissedBatchId: state.batchRun.dismissedBatchId,
          totalFiles,
          completedCount,
          failedCount,
          currentIndex: completedCount + failedCount,
          fileStatuses: sortedStatuses,
          runsById: state.batchRun.runsById,
          activeNodeIds: state.batchRun.activeNodeIds,
          selectedRunId: latestRunIsBatch
            ? latestRunId || lastBatchRunId
            : null,
        }

        state.isRunning =
          isWorkflowRunActive(state.currentRun) || state.batchRun.isActive
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
  setSelectedBatchRunId,
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
  setBatchProgressDismissed,
} = workflowBuilderSlice.actions

export { batchSummaryLoaded }

export default workflowBuilderSlice.reducer
