import { type Node, type Edge } from '@xyflow/react'

interface NodeCreationResult {
  nodes: Node[]
  edges: Edge[]
  shouldShowToast?: { type: 'error' | 'info', message: string }
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
      shouldShowToast: { type: 'error', message: 'Add a Start node first.' }
    }
  }

  if (hasStart && type === 'start') {
    return {
      nodes,
      edges,
      shouldShowToast: { type: 'info', message: 'Only one Start node is allowed.' }
    }
  }

  if (type === 'step') {
    // Auto-create step + output node pair
    const stepNumber = nodes.filter((n) => n.type === 'step').length + 1
    const stepId = `${nodes.length + 1}`
    const outputId = `${nodes.length + 2}`

    const stepNode: Node = {
      id: stepId,
      type: 'step',
      position,
      data: { label: 'step', stepNumber },
    }

    const outputNode: Node = {
      id: outputId,
      type: 'chatOutput',
      position: { x: position.x + 400, y: position.y },
      data: { label: `Step ${stepNumber} Output` },
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

    // If in sequential mode, auto-wire previous output -> this step
    const start = nodes.find((n) => n.type === 'start')
    const mode: 'sequential' | 'parallel' =
      (start?.data as { mode?: 'sequential' | 'parallel' } | undefined)
        ?.mode === 'parallel'
        ? 'parallel'
        : 'sequential'

    if (mode === 'sequential') {
      const prevStepNumber = stepNumber - 1
      if (prevStepNumber >= 1) {
        // Find previous step node by stepNumber
        const prevStep = nodes.find(
          (n) =>
            n.type === 'step' &&
            Number(
              (n.data as { stepNumber?: number } | undefined)?.stepNumber
            ) === prevStepNumber
        )
        if (prevStep) {
          // Find its output node via existing edge source=prevStep.id -> target chatOutput
          const prevStepToOutput = edges.find(
            (e) =>
              e.source === prevStep.id &&
              nodes.find((n) => n.id === e.target)?.type === 'chatOutput'
          )
          const prevOutputId = prevStepToOutput?.target
          if (prevOutputId) {
            const exists = edges.some(
              (e) => e.source === prevOutputId && e.target === stepId
            )
            if (!exists) {
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
      }
    }

    return { nodes: nextNodes, edges: nextEdges }
  } else {
    // Handle start node with initial data
    const newNode: Node = {
      id: `${nodes.length + 1}`,
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

export const removeNodeById = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[], edges: Edge[] } => {
  const updatedNodes = nodes.filter((node) => node.id !== nodeId)
  const updatedEdges = edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  )

  return { nodes: updatedNodes, edges: updatedEdges }
}

export const updateNodeData = (
  nodeId: string,
  newData: Record<string, unknown>,
  nodes: Node[]
): Node[] => {
  return nodes.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, ...newData } }
      : node
  )
}