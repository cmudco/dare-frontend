import { type Node, type Edge } from '@xyflow/react'
import type { WorkflowRun, Workflow, PendingValidation } from './workflow'

export type { PendingValidation }

export interface HistorySnapshot {
  nodes: Node[]
  edges: Edge[]
}

export enum SavingStatus {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}

export type WebSocketConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'

// Output display mode: where to show workflow output during/after execution
export enum OutputDisplayMode {
  Panel = 'panel', // Show output in execution panel (default)
  Nodes = 'nodes', // Show output in output nodes (auto-expand), execution panel stays closed
}

export interface WorkflowBuilderState {
  nodes: Node[]
  edges: Edge[]
  currentMode: 'sequential' | 'parallel'
  lastWorkflowId: number | undefined
  savedViewport: { x: number; y: number; zoom: number } | null
  currentRun: WorkflowRun | null
  isRunning: boolean
  loadedWorkflow: Workflow | null
  history: {
    past: HistorySnapshot[]
    future: HistorySnapshot[]
  }
  manualModeEnabled: boolean
  currentPartialRunId: number | null
  executedStepNodeIds: string[]
  availableRuns: WorkflowRun[]
  selectedRunIds: Record<string, number> // nodeId -> runId mapping
  savingStatus: SavingStatus
  selectedNodeId: string | null // Currently selected node for config panel
  // WebSocket state
  wsConnectionStatus: WebSocketConnectionStatus
  activeNodeId: string | null // Currently executing node (streaming or processing)
  rightPanelTab: 'config' | 'execution' // Active tab in right panel
  showExecutionPanel: boolean // Whether to show the execution panel overlay
  pendingValidation: PendingValidation | null // Human validation required state
  outputDisplayMode: OutputDisplayMode // Where to show output: 'panel' or 'nodes'
  batchRun: BatchRunState
}

export interface BatchFileStatus {
  fileId: number
  fileName: string
  status: 'running' | 'completed' | 'failed'
  workflowRunId?: number
  index: number
}

export interface WorkflowRunMap {
  [runId: number]: WorkflowRun
}

export interface ActiveNodeMap {
  [runId: number]: string | null
}

export interface BatchRunState {
  isActive: boolean
  batchId: number | null
  workflowId: number | null
  latestRunIsBatch: boolean
  dismissedBatchId: number | null
  totalFiles: number
  completedCount: number
  failedCount: number
  currentIndex: number
  fileStatuses: BatchFileStatus[]
  runsById: WorkflowRunMap
  activeNodeIds: ActiveNodeMap
  selectedRunId: number | null
}
