import { type Node, type Edge } from '@xyflow/react'
import { CreateWorkflowDTO } from '@/redux/types/workflow'

export const serializeWorkflow = (
  nodes: Node[],
  edges: Edge[],
  viewport?: { x: number; y: number; zoom: number } | null
): CreateWorkflowDTO | null => {
  return {
    nodes,
    edges,
    viewport_x: viewport?.x,
    viewport_y: viewport?.y,
    viewport_zoom: viewport?.zoom,
  }
}
