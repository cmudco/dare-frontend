import { type Node, type Edge } from '@xyflow/react'
import type { WorkflowRun, Workflow } from './workflow'
import type {
  StepSnippet,
  StepWebSearchSource,
} from '../middleware/workflowSocketMiddleware'

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

// Pending validation state for human-in-the-loop
export interface PendingValidation {
  nodeId: string
  routes: Array<{ name: string; description?: string }>
  context?: Record<string, unknown>
  aiRecommendation?: string
}

// Rich streaming response with content and citation metadata
export interface StreamingResponse {
  content: string
  snippets?: StepSnippet[]
  webSearchSources?: StepWebSearchSource[]
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
  viewMode: boolean // True when viewing completed runs, false when editing/running
  savingStatus: SavingStatus
  selectedNodeId: string | null // Currently selected node for config panel
  // WebSocket streaming state
  wsConnectionStatus: WebSocketConnectionStatus
  streamingResponses: Record<string, StreamingResponse> // nodeId -> accumulated streaming content with metadata
  activeStreamingNodeId: string | null // Currently streaming node
  rightPanelTab: 'config' | 'execution' // Active tab in right panel
  showExecutionPanel: boolean // Whether to show the execution panel overlay
  pendingValidation: PendingValidation | null // Human validation required state
}
