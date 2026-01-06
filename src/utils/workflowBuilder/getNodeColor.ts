import type { Node } from '@xyflow/react'
import type { NodeStatesMap } from '@/redux/types/workflow'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

/**
 * Returns a color for the MiniMap based on node execution status.
 * Uses nodeStates from V2 API for O(1) lookup.
 *
 * @param node - The React Flow node
 * @param nodeStates - Optional map of node execution states from current run
 * @returns Hex color string for the node
 */
export const getNodeColor = (
  node: Node,
  nodeStates?: NodeStatesMap
): string => {
  const nodeState = nodeStates?.[node.id]

  if (!nodeState) {
    // No execution state - use type-based coloring
    switch (node.type) {
      case 'start':
        return '#8b5cf6' // Purple for start
      case 'chatOutput':
        return '#6b7280' // Gray for output
      case 'structuredOutput':
        return '#f59e0b' // Amber for routing nodes
      default:
        return '#6366f1' // Indigo for steps
    }
  }

  // Color based on execution status
  switch (nodeState.status) {
    case WorkflowRunStepStatus.Completed:
      return '#10b981' // Green
    case WorkflowRunStepStatus.Running:
      return '#3b82f6' // Blue
    case WorkflowRunStepStatus.Failed:
    case WorkflowRunStepStatus.Error:
      return '#ef4444' // Red
    case WorkflowRunStepStatus.PendingHumanInput:
      return '#f59e0b' // Amber
    case WorkflowRunStepStatus.Pending:
      return '#eab308' // Yellow
    case WorkflowRunStepStatus.Skipped:
      return '#9ca3af' // Gray
    default:
      return '#6366f1' // Indigo
  }
}
