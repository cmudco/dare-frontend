import { type NodeTypes, type Node, type Edge } from '@xyflow/react'
import StartNode from '@/pages/Workflows/_builder/nodes/StartNode'
import StepNode from '@/pages/Workflows/_builder/nodes/StepNode'
import ChatOutputNode from '@/pages/Workflows/_builder/nodes/ChatOutputNode'

export const WORKFLOW_NODE_TYPES: NodeTypes = {
  start: StartNode,
  step: StepNode,
  chatOutput: ChatOutputNode,
}

// Theme-aware default edge styling
export const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  style: { stroke: 'hsl(var(--primary))', strokeOpacity: 0.5 },
}

// Initial empty state for workflow builder
export const INITIAL_NODES: Node[] = []
export const INITIAL_EDGES: Edge[] = []
