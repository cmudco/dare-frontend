import { type Node, type Edge } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { WorkflowNodeType } from '@/utils/constants/workflows'

interface NodeCreationResult {
  nodes: Node[]
  edges: Edge[]
  shouldShowToast?: { type: 'error' | 'info'; message: string }
}

export const createNode = (
  type: string,
  position: { x: number; y: number },
  nodes: Node[],
  edges: Edge[]
): NodeCreationResult => {
  const hasStart = nodes.some((n) => n.type === WorkflowNodeType.Start)

  if (!hasStart && type !== WorkflowNodeType.Start) {
    return {
      nodes,
      edges,
      shouldShowToast: { type: 'error', message: 'Add a Start node first.' },
    }
  }

  if (type === WorkflowNodeType.Step) {
    // Auto-create step + output node pair
    const stepNumber =
      nodes.filter((n) => n.type === WorkflowNodeType.Step).length + 1
    const stepId = nanoid() // UUID for React Flow (guaranteed unique)
    const outputId = nanoid() // UUID for output node (guaranteed unique)

    const stepNode: Node = {
      id: stepId,
      type: 'step',
      position,
      data: {
        label: 'step',
        stepNumber, // Keep stepNumber for display/execution order only
        apiId: null, // Will be set after save
      },
    }

    const outputNode: Node = {
      id: outputId,
      type: 'chatOutput',
      position: { x: position.x + 400, y: position.y }, // Keep same Y as step for now
      data: {
        label: `Step ${stepNumber} Output`,
        stepNumber, // Keep stepNumber for display only
      },
    }

    // Create edge connecting step to output
    const stepToOutputEdge: Edge = {
      id: `e-${stepId}-${outputId}`,
      source: stepId,
      target: outputId,
      type: 'smoothstep',
    }

    const nextNodes = [...nodes, stepNode, outputNode]
    const nextEdges = [...edges, stepToOutputEdge]

    return { nodes: nextNodes, edges: nextEdges }
  } else if (type === WorkflowNodeType.StructuredOutput) {
    const structuredOutputId = nanoid() // UUID for React Flow (guaranteed unique)

    const stepCount = nodes.filter(
      (n) => n.type === WorkflowNodeType.Step
    ).length
    const existingStructuredOutputCount = nodes.filter(
      (n) => n.type === WorkflowNodeType.StructuredOutput
    ).length
    const structuredOutputStepNumber =
      stepCount + existingStructuredOutputCount + 1

    const structuredOutputNode: Node = {
      id: structuredOutputId,
      type: 'structuredOutput',
      position,
      data: {
        routes: [
          { name: '1', description: 'First route' },
          { name: '2', description: 'Second route' },
        ],
        stepNumber: structuredOutputStepNumber, // Keep stepNumber for display/execution order only
      },
    }

    return { nodes: [...nodes, structuredOutputNode], edges }
  } else {
    // Handle start node and other node types with UUID
    const nodeId = nanoid() // UUID for React Flow (guaranteed unique)

    const newNode: Node = {
      id: nodeId,
      type,
      position,
      data:
        type === WorkflowNodeType.Start
          ? {
              title: '',
              description: '',
              mode: 'sequential',
              spareHandle: true,
            }
          : { label: type },
    }

    return { nodes: [...nodes, newNode], edges }
  }
}
