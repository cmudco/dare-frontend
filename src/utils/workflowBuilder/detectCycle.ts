import { type Connection, type Edge } from '@xyflow/react'

/**
 * Return true when accepting the proposed connection would create a cycle
 * in the workflow graph.
 *
 * Strategy: the new edge runs `source -> target`. A cycle exists when
 * `target` can already reach `source` through the existing edges — dropping
 * the new edge would close the loop. We run an iterative DFS from `target`
 * and short-circuit the moment we hit `source`.
 *
 * Mirrors the backend cycle detection added in
 * `workflows/handlers/utils/workflow_validator.py::_detect_cycles`.
 */
export const wouldCreateCycle = (
  connection: Connection,
  edges: Edge[]
): boolean => {
  const { source, target } = connection
  if (!source || !target) return false
  if (source === target) return true

  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    const neighbors = adjacency.get(edge.source)
    if (neighbors) {
      neighbors.push(edge.target)
    } else {
      adjacency.set(edge.source, [edge.target])
    }
  }

  const stack: string[] = [target]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const node = stack.pop() as string
    if (node === source) return true
    if (visited.has(node)) continue
    visited.add(node)

    const neighbors = adjacency.get(node)
    if (neighbors) {
      for (const next of neighbors) stack.push(next)
    }
  }

  return false
}
