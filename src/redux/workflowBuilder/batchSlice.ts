import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { BatchState, BatchFileStatus } from '../types/workflowBuilder'
import type { BatchRunState } from '../types/workflowBuilder'
import type { WorkflowRun, NodeStatesMap } from '../types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import {
  batchStarted,
  batchProgress,
  batchComplete,
  batchSummaryLoaded,
  stepStarted,
  stepStreaming,
  stepCompleted,
  executionComplete,
  stepError,
  workflowStatus,
  executionStarted,
  singleStepStarted,
} from './actions'

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function createEmptyBatchRunState(): BatchRunState {
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

function ensureNodeState(
  nodeStates: NodeStatesMap,
  nodeId: string,
  nodeType = 'unknown'
): void {
  if (!nodeStates[nodeId]) {
    nodeStates[nodeId] = {
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

function createBatchRunStub(
  batchRun: BatchRunState,
  workflowRunId: number
): WorkflowRun {
  return {
    id: workflowRunId,
    workflow: batchRun.workflowId || 0,
    user: 0,
    status: WorkflowRunStepStatus.Running,
    startedAt: new Date().toISOString(),
    endedAt: null,
    workflowTitle: '',
    workflowDescription: '',
    isPartial: false,
    nodeStates: {},
  } as WorkflowRun
}

function ensureBatchRun(
  batchRun: BatchRunState,
  workflowRunId: number
): WorkflowRun {
  if (!batchRun.runsById[workflowRunId]) {
    batchRun.runsById[workflowRunId] = createBatchRunStub(
      batchRun,
      workflowRunId
    )
  }
  return batchRun.runsById[workflowRunId]
}

// ════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ════════════════════════════════════════════════════════════════════════════

export const batchInitialState: BatchState = {
  batchRun: createEmptyBatchRunState(),
}

// ════════════════════════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════════════════════════

const batchSlice = createSlice({
  name: 'workflowBuilder/batch',
  initialState: batchInitialState,
  reducers: {
    setSelectedBatchRunId: (state, action: PayloadAction<number | null>) => {
      state.batchRun.selectedRunId = action.payload
    },
    setBatchProgressDismissed: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.batchRun.dismissedBatchId = action.payload
    },
    clearBatchState: (state) => {
      state.batchRun = createEmptyBatchRunState()
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Reset batch on execution events ────────────────────────────────
      .addCase(executionStarted, (state) => {
        state.batchRun.selectedRunId = null
        state.batchRun.latestRunIsBatch = false
      })
      .addCase(singleStepStarted, (state) => {
        state.batchRun.selectedRunId = null
        state.batchRun.latestRunIsBatch = false
      })

      // ── Batch Execution ──────────────────────────────────────────────
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
          ensureBatchRun(state.batchRun, workflowRunId)
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
      })

      // ── Step events for batch runs ───────────────────────────────────
      // These handlers only process events that belong to batch runs.
      // Non-batch events are ignored here (handled by executionSlice).
      .addCase(stepStarted, (state, action) => {
        const { nodeId, nodeType, startedAt, workflowRunId } = action.payload
        if (!workflowRunId || !state.batchRun.runsById[workflowRunId]) {
          if (!state.batchRun.isActive || !workflowRunId) {
            return
          }
        }

        const run = ensureBatchRun(state.batchRun, workflowRunId as number)
        if (run.nodeStates) {
          ensureNodeState(run.nodeStates, nodeId, nodeType)
          run.nodeStates[nodeId].status = WorkflowRunStepStatus.Running
          run.nodeStates[nodeId].response = ''
          if (startedAt) {
            run.nodeStates[nodeId].startedAt = startedAt
          }
        }
        state.batchRun.activeNodeIds[workflowRunId as number] = nodeId
      })
      .addCase(stepStreaming, (state, action) => {
        const { nodeId, chunk, workflowRunId } = action.payload
        if (!workflowRunId || !state.batchRun.runsById[workflowRunId]) return

        const run = state.batchRun.runsById[workflowRunId]
        if (!run.nodeStates) return
        ensureNodeState(run.nodeStates, nodeId)
        run.nodeStates[nodeId].response =
          (run.nodeStates[nodeId].response || '') + chunk
        state.batchRun.activeNodeIds[workflowRunId] = nodeId
      })
      .addCase(stepCompleted, (state, action) => {
        const { nodeId, response, metadata, workflowRunId } = action.payload
        if (!workflowRunId || !state.batchRun.runsById[workflowRunId]) return

        const run = state.batchRun.runsById[workflowRunId]
        if (!run.nodeStates) return
        ensureNodeState(run.nodeStates, nodeId)
        const nodeState = run.nodeStates[nodeId]
        nodeState.response = response
        nodeState.status = WorkflowRunStepStatus.Completed
        nodeState.snippets = metadata?.snippets ?? []
        nodeState.webSearchSources = metadata?.webSearchSources ?? []
        state.batchRun.activeNodeIds[workflowRunId] = null
      })
      .addCase(executionComplete, (state, action) => {
        const { status, endedAt, workflowRunId } = action.payload
        if (!state.batchRun.runsById[workflowRunId]) return

        const run = state.batchRun.runsById[workflowRunId]
        run.status = status as typeof run.status
        run.endedAt = endedAt || run.endedAt
        state.batchRun.activeNodeIds[workflowRunId] = null
        // latestRunIsBatch is NOT cleared here — individual file runs completing does not
        // mean the batch is done. Only batchComplete should flip this flag.
      })
      .addCase(stepError, (state, action) => {
        const { nodeId, workflowRunId } = action.payload
        if (
          !workflowRunId ||
          !nodeId ||
          !state.batchRun.runsById[workflowRunId]
        )
          return

        const run = state.batchRun.runsById[workflowRunId]
        if (run.nodeStates?.[nodeId]) {
          run.nodeStates[nodeId].status = WorkflowRunStepStatus.Failed
          run.nodeStates[nodeId].error = action.payload.error || null
        }
        state.batchRun.activeNodeIds[workflowRunId] = null
      })
      .addCase(workflowStatus, (state, action) => {
        const { status, ...runData } = action.payload
        const workflowRunId = action.payload.id

        // Accept updates for any run that belongs to the current batch,
        // even if it hasn't been added to runsById yet (e.g. after page reload
        // where batchSummaryLoaded restored fileStatuses but not runsById).
        const isKnownBatchRun = state.batchRun.fileStatuses.some(
          (fs) => fs.workflowRunId === workflowRunId
        )
        if (!isKnownBatchRun) return

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _eventType, ...workflowRunData } =
          runData as WorkflowRun & { type: string }

        state.batchRun.runsById[workflowRunId] = {
          ...workflowRunData,
          status,
        } as WorkflowRun
      })
  },
})

export { createEmptyBatchRunState }

export const {
  setSelectedBatchRunId,
  setBatchProgressDismissed,
  clearBatchState,
} = batchSlice.actions

export default batchSlice.reducer
