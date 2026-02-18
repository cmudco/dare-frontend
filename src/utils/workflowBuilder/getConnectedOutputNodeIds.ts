import type { Node, Edge } from '@xyflow/react'
import { WorkflowNodeType } from '@/utils/constants/workflows'

/**
 * Find output nodes connected to a source node via edges.
 * Used to propagate streaming data to output nodes in 'nodes' display mode.
 */
export function getConnectedOutputNodeIds(
  sourceNodeId: string,
  edges: Edge[],
  nodes: Node[]
): string[] {
  return edges
    .filter((edge) => edge.source === sourceNodeId)
    .map((edge) => edge.target)
    .filter((targetId) => {
      const node = nodes.find((n) => n.id === targetId)
      return node?.type === WorkflowNodeType.ChatOutput
    })
}
