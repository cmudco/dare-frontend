import { type Node } from '@xyflow/react'

export const updateNodeData = (
  nodeId: string,
  newData: Record<string, unknown>,
  nodes: Node[]
): Node[] => {
  return nodes.map((node) =>
    node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
  )
}
