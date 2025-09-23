import { type Node, type Edge } from '@xyflow/react'

export const removeNodeById = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  const updatedNodes = nodes.filter((node) => node.id !== nodeId)
  const updatedEdges = edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  )

  return { nodes: updatedNodes, edges: updatedEdges }
}
