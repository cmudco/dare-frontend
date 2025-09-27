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
    let nextEdges = [...edges, stepToOutputEdge]

    // Enhanced logic: Skip auto-wiring when both start and aggregator exist
    const start = nodes.find((n) => n.type === 'start')
    const aggregator = nodes.find((n) => n.type === 'aggregator')
    const mode: 'sequential' | 'parallel' = start
      ? (start.data as { mode: 'sequential' | 'parallel' }).mode
      : 'sequential'

    // Only auto-wire if aggregator doesn't exist (traditional workflow)
    if (mode === 'sequential' && !aggregator) {
      const prevStepNumber = stepNumber - 1
      if (prevStepNumber >= 1) {
        // Previous output node ID follows pattern: "{prevStepNumber}o"
        const prevOutputId = `${prevStepNumber}o`

        // Check if previous output exists and connection doesn't already exist
        const prevOutputExists = nodes.some((n) => n.id === prevOutputId)
        const connectionExists = edges.some(
          (e) => e.source === prevOutputId && e.target === stepId
        )

        if (prevOutputExists && !connectionExists) {
          nextEdges = [
            ...nextEdges,
            {
              id: `e-${prevOutputId}-${stepId}`,
              source: prevOutputId,
              target: stepId,
              type: 'smoothstep',
            },
          ]
        }
      }
    }

    return { nodes: nextNodes, edges: nextEdges }
  } else if (type === 'aggregator') {
    // Handle aggregator node - only one per workflow
    const hasAggregator = nodes.some((n) => n.type === 'aggregator')

    if (hasAggregator) {
      return {
        nodes,
        edges,
        shouldShowToast: {
          type: 'info',
          message: 'Only one Aggregator node is allowed per workflow.',
        },
      }
    }

    const aggregatorNode: Node = {
      id: 'aggregator',
      type: 'aggregator',
      position,
      data: {
        stepNumber: 1,
        scoringMode: 'quantitative',
        customPrompt:
          'Evaluate the quality of the responses and provide a score based on accuracy, relevance, and clarity.',
      },
    }

    return { nodes: [...nodes, aggregatorNode], edges }
  } else if (type === 'conditional') {
    // Handle conditional node
    const conditionalCount = nodes.filter(
      (n) => n.type === 'conditional'
    ).length
    const conditionalId = `conditional-${conditionalCount + 1}`

    // Get unique step number for conditional node (should be after all regular steps and aggregators)
    const stepCount = nodes.filter((n) => n.type === 'step').length
    const aggregatorCount = nodes.filter((n) => n.type === 'aggregator').length
    const conditionalStepNumber =
      stepCount + aggregatorCount + conditionalCount + 1

    const conditionalNode: Node = {
      id: conditionalId,
      type: 'conditional',
      position,
      data: {
        customPrompt: 'Evaluate the input and choose the appropriate route.',
        routeAName: 'Route A',
        routeBName: 'Route B',
        routeADescription: '',
        routeBDescription: '',
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
