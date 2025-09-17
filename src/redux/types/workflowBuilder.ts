import { type Node, type Edge } from '@xyflow/react'

export interface NodeErrors {
  title?: string
  description?: string
  prompt?: string
  [key: string]: string | undefined
}

export interface WorkflowBuilderState {
  nodes: Node[]
  edges: Edge[]
  errorsByNodeId: Record<string, NodeErrors>
  currentMode: 'sequential' | 'parallel'
  lastWorkflowId: string | undefined
  savedViewport: { x: number; y: number; zoom: number } | null
}
