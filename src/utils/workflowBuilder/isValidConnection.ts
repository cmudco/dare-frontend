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

  // Structured Output node is now independent - can connect TO any node (step, chatOutput, etc.)
  if (sType === WorkflowNodeType.StructuredOutput) {
    // Allow structured output to connect to step nodes, chatOutput, or other nodes
    return (
      tType === WorkflowNodeType.Step || tType === WorkflowNodeType.ChatOutput
    )
  }

  // Allow connections TO structured output node FROM start, step, or chatOutput nodes
  if (tType === WorkflowNodeType.StructuredOutput) {
    const isAllowed =
      isStartNode(sType) ||
      sType === WorkflowNodeType.Step ||
      sType === WorkflowNodeType.ChatOutput
    if (!isAllowed) return false

    // Structured output nodes accept only one input connection
    const existingInputs = edges.filter((e) => e.target === connection.target)
    if (existingInputs.length >= 1) return false

    return true
  }

  // Allow Start <-> Step regardless of drag direction
  // Backend uses edge-based execution, so no frontend restrictions needed
  if (
    (isStartNode(sType) && tType === WorkflowNodeType.Step) ||
    (sType === WorkflowNodeType.Step && isStartNode(tType))
  ) {
    return true
  }

  if (sType === WorkflowNodeType.Step) {
    // Allow step -> chatOutput connections
    if (tType === WorkflowNodeType.ChatOutput) {
      return true
    }

    // Allow step -> step connections (backend handles execution order via edges)
    if (tType === WorkflowNodeType.Step) {
      return true
    }

    return false
  }

  if (sType === WorkflowNodeType.ChatOutput) {
    // Allow chatOutput -> step connections
    if (tType === WorkflowNodeType.Step) return true

    // Allow chatOutput -> start connections for workflow chaining
    // This enables sequential workflow chains where output from Chain 1
    // becomes input to Chain 2
    if (isStartNode(tType)) return true

    return false
  }

  return false
}
