import { type Node, type Edge, type Connection, addEdge } from '@xyflow/react'

interface ConnectionResult {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Simple connection handler - just let React Flow's addEdge do its job
 * Validation is handled by isValidConnection
 */
export const handleConnection = (
  params: Connection,
  nodes: Node[],
  edges: Edge[]
): ConnectionResult => {
  // Just add the edge - React Flow handles duplicate prevention and ID generation
  const newEdges = addEdge(params, edges)
  return { nodes, edges: newEdges }
}
