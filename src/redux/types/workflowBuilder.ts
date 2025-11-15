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
}
