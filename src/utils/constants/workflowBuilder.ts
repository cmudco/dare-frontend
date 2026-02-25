import {
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
} from '@xyflow/react'
import StartNode from '@/pages/Workflows/_builder/nodes/StartNode'
import StepNode from '@/pages/Workflows/_builder/nodes/StepNode'
import ChatOutputNode from '@/pages/Workflows/_builder/nodes/ChatOutputNode'
import StructuredOutputNode from '@/pages/Workflows/_builder/nodes/StructuredOutputNode'
import NotesNode from '@/pages/Workflows/_builder/nodes/NotesNode'
import FileNode from '@/pages/Workflows/_builder/nodes/FileNode'
import ColoredBezierEdge from '@/pages/Workflows/_builder/edges/ColoredBezierEdge'

export const WORKFLOW_NODE_TYPES: NodeTypes = {
  start: StartNode,
  step: StepNode,
  chatOutput: ChatOutputNode,
  structuredOutput: StructuredOutputNode,
  notes: NotesNode,
  file: FileNode,
}

// Edge type registration (custom colored bezier edge as default)
export const WORKFLOW_EDGE_TYPES: EdgeTypes = {
  default: ColoredBezierEdge,
}

// Default edge options — type 'default' maps to our ColoredBezierEdge
export const DEFAULT_EDGE_OPTIONS = {
  type: 'default' as const,
}

// Hex equivalents of HANDLE_COLORS for SVG edge stroke coloring
export const HANDLE_COLOR_HEX: Record<string, string> = {
  '!bg-blue-500': '#3b82f6',
  '!bg-purple-500': '#a855f7',
  '!bg-green-500': '#22c55e',
  '!bg-orange-500': '#f97316',
  '!bg-pink-500': '#ec4899',
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
