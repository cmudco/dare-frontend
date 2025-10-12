import { type Node, type Edge } from '@xyflow/react'

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
  const hasStart = nodes.some((n) => n.type === 'start')

  if (!hasStart && type !== 'start') {
    return {
      nodes,
      edges,
      shouldShowToast: { type: 'error', message: 'Add a Start node first.' },
    }
  }

  if (hasStart && type === 'start') {
    return {
      nodes,
      edges,
      shouldShowToast: {
        type: 'info',
        message: 'Only one Start node is allowed.',
      },
    }
  }

  if (type === 'step') {
    // Auto-create step + output node pair
    const stepNumber = nodes.filter((n) => n.type === 'step').length + 1
    const stepId = stepNumber.toString() // "1", "2", "3"
    const outputId = `${stepNumber}o` // "1o", "2o", "3o"

    const stepNode: Node = {
      id: stepId,
      type: 'step',
      position,
      data: {
        label: 'step',
        stepNumber,
        apiId: null, // Will be set after save
      },
    }

    const outputNode: Node = {
      id: outputId,
      type: 'chatOutput',
      position: { x: position.x + 400, y: position.y }, // Keep same Y as step for now
      data: {
        label: `Step ${stepNumber} Output`,
        stepNumber,
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
  } else if (type === 'conditional') {
    // Handle conditional node
    const conditionalCount = nodes.filter(
      (n) => n.type === 'conditional'
    ).length
    const conditionalId = `conditional-${conditionalCount + 1}`

    // Get unique step number for conditional node (should be after all regular steps)
    const stepCount = nodes.filter((n) => n.type === 'step').length
    const conditionalStepNumber = stepCount + conditionalCount + 1

    const conditionalNode: Node = {
      id: conditionalId,
      type: 'conditional',
      position,
      data: {
        customPrompt: 'Evaluate the input and choose the appropriate route.',
        routes: [
          { name: 'Route A', description: '' },
          { name: 'Route B', description: '' },
        ],
        requireHumanValidation: false,
        stepNumber: conditionalStepNumber,
      },
    }

    return { nodes: [...nodes, conditionalNode], edges }
  } else {
    // Handle start node with initial data
    const newNode: Node = {
      id: '0', // Start node is always "0"
      type,
      position,
      data:
        type === 'start'
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
