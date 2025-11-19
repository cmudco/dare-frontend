import { type Node, type Edge } from '@xyflow/react'
import type { WorkflowRun, Workflow } from './workflow'

export interface NodeErrors {
  title?: string
  description?: string
  prompt?: string
  [key: string]: string | undefined
}

export interface HistorySnapshot {
  nodes: Node[]
  edges: Edge[]
  errorsByNodeId: Record<string, NodeErrors>
}

export enum SavingStatus {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}

export interface WorkflowBuilderState {
  nodes: Node[]
  edges: Edge[]
  errorsByNodeId: Record<string, NodeErrors>
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
}
