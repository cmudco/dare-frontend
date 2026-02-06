import { type NodeTypes, type Node, type Edge } from '@xyflow/react'
import StartNode from '@/pages/Workflows/_builder/nodes/StartNode'
import StepNode from '@/pages/Workflows/_builder/nodes/StepNode'
import ChatOutputNode from '@/pages/Workflows/_builder/nodes/ChatOutputNode'
import StructuredOutputNode from '@/pages/Workflows/_builder/nodes/StructuredOutputNode'
import NotesNode from '@/pages/Workflows/_builder/nodes/NotesNode'
import FileNode from '@/pages/Workflows/_builder/nodes/FileNode'

export const WORKFLOW_NODE_TYPES: NodeTypes = {
  start: StartNode,
  step: StepNode,
  chatOutput: ChatOutputNode,
  structuredOutput: StructuredOutputNode,
  notes: NotesNode,
  file: FileNode,
}

// Theme-aware default edge styling
export const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  style: { stroke: 'hsl(var(--primary))', strokeOpacity: 0.5 },
}

// Shared handle id prefix for route-based outputs
export const ROUTE_HANDLE_PREFIX = 'output-'

// Handle configuration for step nodes
export const HANDLE_COUNT = 5
export const HANDLE_NUMBERS = [1, 2, 3, 4, 5] as const

// Input handle colors (with !important for overriding React Flow styles)
export const HANDLE_COLORS = [
  '!bg-blue-500',
  '!bg-purple-500',
  '!bg-green-500',
  '!bg-orange-500',
  '!bg-pink-500',
] as const

// Output route colors (for structured output nodes)
export const ROUTE_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-pink-500',
] as const

// Initial empty state for workflow builder
export const INITIAL_NODES: Node[] = []
export const INITIAL_EDGES: Edge[] = []
