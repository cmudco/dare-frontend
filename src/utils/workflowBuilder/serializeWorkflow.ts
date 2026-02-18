import { type Node, type Edge } from '@xyflow/react'
import { CreateWorkflowDTO, UpdateWorkflowDTO } from '@/redux/types/workflow'
import { OutputDisplayMode } from '@/redux/types/workflowBuilder'

export const serializeWorkflow = (
  nodes: Node[],
  edges: Edge[],
  viewport?: { x: number; y: number; zoom: number } | null,
  outputDisplayMode?: OutputDisplayMode
): CreateWorkflowDTO | UpdateWorkflowDTO | null => {
  return {
    nodes,
    edges,
    viewportX: viewport?.x,
    viewportY: viewport?.y,
    viewportZoom: viewport?.zoom,
    outputDisplayMode,
  }
}
