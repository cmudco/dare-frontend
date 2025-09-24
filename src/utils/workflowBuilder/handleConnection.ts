import { type Node, type Edge, type Connection, addEdge } from '@xyflow/react'
import { getStartNode, getMode } from './isValidConnection'

interface ConnectionResult {
  nodes: Node[]
  edges: Edge[]
}

export const handleConnection = (
  params: Connection,
  nodes: Node[],
  edges: Edge[]
): ConnectionResult => {
  const startNode = getStartNode(nodes)
  const modeValue = getMode(startNode)
  const sourceNode = nodes.find((n) => n.id === params.source)
  const targetNode = nodes.find((n) => n.id === params.target)

  // Normalize Start -> Step direction even if user dragged Step -> Start
  const involvesStartAndStep =
    (sourceNode?.type === 'start' && targetNode?.type === 'step') ||
    (sourceNode?.type === 'step' && targetNode?.type === 'start')

  if (involvesStartAndStep) {
    const normalized: Connection = {
      source: startNode?.id as string,
      target: (sourceNode?.type === 'step'
        ? params.source
        : params.target) as string,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    }

    if (modeValue === 'parallel') {
      const handleUsed =
        params.source === startNode?.id
          ? params.sourceHandle
          : params.targetHandle
      normalized.sourceHandle = handleUsed || null
      const newEdges = addEdge(normalized, edges)
      return { nodes, edges: newEdges }
    } else {
      normalized.sourceHandle = null
    }

    const afterAdd = addEdge(normalized, edges)
    return { nodes, edges: afterAdd }
  }

  // Handle Step -> Output with cloning logic for reused outputs
  const srcNode = nodes.find((n) => n.id === params.source)
  const tgtNode = nodes.find((n) => n.id === params.target)
  const isStepToOutput =
    srcNode?.type === 'step' && tgtNode?.type === 'chatOutput'

  if (isStepToOutput && params.target) {
    const outputAlreadyUsedByAnotherStep = edges.some((e) => {
      if (e.target !== params.target) return false
      const sourceOfExisting = nodes.find((n) => n.id === e.source)
      return sourceOfExisting?.type === 'step'
    })

    if (outputAlreadyUsedByAnotherStep) {
      const srcPos = srcNode.position
      const tgtPos = tgtNode.position
      const newOutputId = `${nodes.length + 1}`
      const newOutputNode: Node = {
        id: newOutputId,
        type: 'chatOutput',
        position: { x: tgtPos.x, y: srcPos.y },
        data: tgtNode.data,
      }

      const newNodes = [...nodes, newOutputNode]

      const newEdge: Edge = {
        id: `e-${params.source}-${newOutputId}`,
        source: params.source!,
        target: newOutputId,
        type: 'smoothstep',
      }

      const newEdges = [...edges, newEdge]
      return { nodes: newNodes, edges: newEdges }
    }
  }

  // Default connection with clean naming
  const cleanEdge = {
    ...params,
    id: `e-${params.source}-${params.target}`,
    sourceHandle: params.sourceHandle ?? null,
    targetHandle: params.targetHandle ?? null,
  }
  const normalizedEdges = edges.map((edge) => ({
    ...edge,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
  }))
  const newEdges = addEdge(cleanEdge, normalizedEdges)
  return { nodes, edges: newEdges }
}
