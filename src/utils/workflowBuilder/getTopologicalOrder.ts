import type { Node, Edge } from '@xyflow/react'
import { WorkflowNodeType } from '@/utils/constants/workflows'

/**
 * Type priority map matching the backend's Kahn's algorithm.
 * See: dare-backend/core/services/workflow_execution_service.py lines 289
 */
const TYPE_ORDER: Record<string, number> = {
  [WorkflowNodeType.Start]: 0,
  [WorkflowNodeType.File]: 1,
  [WorkflowNodeType.Step]: 2,
  [WorkflowNodeType.StructuredOutput]: 3,
  [WorkflowNodeType.ChatOutput]: 4,
}

/** Node types that are not executable (decorative only). */
const NON_EXECUTABLE_TYPES = new Set<string>([WorkflowNodeType.Notes])

/** Node types that can be manually executed in manual mode. */
const MANUALLY_EXECUTABLE_TYPES = new Set<string>([
  WorkflowNodeType.Step,
  WorkflowNodeType.StructuredOutput,
  WorkflowNodeType.File,
])

/**
 * Get nodes in topological order using Kahn's algorithm.
 * Mirrors the backend's _get_ordered_nodes() exactly.
 */
export function getTopologicalOrder(nodes: Node[], edges: Edge[]): string[] {
  const executableNodes = nodes.filter(
    (n) => n.type && !NON_EXECUTABLE_TYPES.has(n.type)
  )

  const nodeTypeMap = new Map(executableNodes.map((n) => [n.id, n.type || '']))
  const nodeIds = new Set(executableNodes.map((n) => n.id))

  // Build in-degree map
  const inDegree = new Map<string, number>()
  for (const id of nodeIds) {
    inDegree.set(id, 0)
  }
  for (const edge of edges) {
    if (nodeIds.has(edge.target)) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    }
  }

  // Initialize queue with nodes that have no incoming edges
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const result: string[] = []

  while (queue.length > 0) {
    // Sort queue by type priority (matching backend)
    queue.sort(
      (a, b) =>
        (TYPE_ORDER[nodeTypeMap.get(a) || ''] ?? 99) -
        (TYPE_ORDER[nodeTypeMap.get(b) || ''] ?? 99)
    )

    const nodeId = queue.shift()!
    result.push(nodeId)

    // Decrement in-degree for successors
    for (const edge of edges) {
      if (edge.source === nodeId && nodeIds.has(edge.target)) {
        const newDeg = (inDegree.get(edge.target) || 1) - 1
        inDegree.set(edge.target, newDeg)
        if (newDeg === 0) {
          queue.push(edge.target)
        }
      }
    }
  }

  return result
}

/**
 * Get the next executable node ID in manual mode.
 * Skips already-executed nodes and non-manually-executable types.
 */
export function getNextExecutableNodeId(
  topologicalOrder: string[],
  executedStepNodeIds: string[],
  nodes: Node[]
): string | null {
  const executedSet = new Set(executedStepNodeIds)
  const nodeTypeMap = new Map(nodes.map((n) => [n.id, n.type || '']))

  for (const nodeId of topologicalOrder) {
    if (executedSet.has(nodeId)) continue
    const nodeType = nodeTypeMap.get(nodeId) || ''
    if (MANUALLY_EXECUTABLE_TYPES.has(nodeType)) {
      return nodeId
    }
  }

  return null
}
