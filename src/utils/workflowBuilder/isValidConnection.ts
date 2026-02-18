import { type Node, type Edge, type Connection } from '@xyflow/react'
import { WorkflowNodeType } from '@/utils/constants/workflows'

export type Mode = 'sequential' | 'parallel'

// Helper to check if a node is a start-type node
export const isStartNode = (type: string | undefined): boolean => {
  return type === WorkflowNodeType.Start
}

export const getStartNode = (nodes: Node[]): Node | undefined => {
  return nodes.find((n) => isStartNode(n.type))
}

export const getStartNodes = (nodes: Node[]): Node[] => {
  return nodes.filter((n) => isStartNode(n.type))
}

export const getMode = (startNode?: Node): Mode => {
  if (!startNode) return 'sequential'
  return (startNode.data as { mode: Mode }).mode
}

export const getStepNumber = (node?: Node): number | undefined => {
  if (!node) return undefined
  return (node.data as { stepNumber: number }).stepNumber
}

export const isValidConnection = (
  connection: Edge | Connection,
  nodes: Node[],
  edges: Edge[]
): boolean => {
  const sourceNode = nodes.find((n) => n.id === connection.source)
  const targetNode = nodes.find((n) => n.id === connection.target)

  if (!sourceNode || !targetNode) return false

  // Prevent connecting to self
  if (connection.source === connection.target) return false

  const sType = sourceNode.type
  const tType = targetNode.type

  // ── Structured Output rules ──
  if (sType === WorkflowNodeType.StructuredOutput) {
    return (
      tType === WorkflowNodeType.Step ||
      tType === WorkflowNodeType.File ||
      tType === WorkflowNodeType.ChatOutput
    )
  }

  if (tType === WorkflowNodeType.StructuredOutput) {
    const isAllowed =
      isStartNode(sType) ||
      sType === WorkflowNodeType.Step ||
      sType === WorkflowNodeType.File ||
      sType === WorkflowNodeType.ChatOutput
    if (!isAllowed) return false

    // Structured output nodes accept only one input connection
    const existingInputs = edges.filter((e) => e.target === connection.target)
    if (existingInputs.length >= 1) return false

    return true
  }

  // ── Start node rules ──
  if (isStartNode(sType)) {
    return tType === WorkflowNodeType.Step || tType === WorkflowNodeType.File
  }

  if (isStartNode(tType)) {
    // Only chatOutput can connect back to start (workflow chaining)
    return sType === WorkflowNodeType.ChatOutput
  }

  // ── Step node rules ──
  if (sType === WorkflowNodeType.Step) {
    return (
      tType === WorkflowNodeType.Step ||
      tType === WorkflowNodeType.ChatOutput ||
      tType === WorkflowNodeType.File
    )
  }

  // ── File node rules ──
  // File outputs to Step only (self-displaying, no chatOutput pair needed)
  if (sType === WorkflowNodeType.File) {
    return tType === WorkflowNodeType.Step
  }

  // ── ChatOutput rules ──
  if (sType === WorkflowNodeType.ChatOutput) {
    return tType === WorkflowNodeType.Step || isStartNode(tType)
  }

  return false
}
