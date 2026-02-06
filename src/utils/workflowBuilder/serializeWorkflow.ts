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
    viewport_x: viewport?.x,
    viewport_y: viewport?.y,
    viewport_zoom: viewport?.zoom,
    output_display_mode: outputDisplayMode,
  }
}
