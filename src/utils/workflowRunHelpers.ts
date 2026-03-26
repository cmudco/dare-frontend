import { WorkflowRun, NodeState } from '@/redux/types/workflow'

/**
 * ============================================================================
 * WORKFLOW RUN DATA HELPERS
 * ============================================================================
 *
 * Helpers for retrieving node execution state from workflow runs.
 * All components use nodeStates (O(1) lookup by node ID).
 *
 * DATA FLOW:
 * - NORMAL MODE: Display run from selectedRunIds[nodeId] or currentRun
 * - MANUAL MODE: Display run is always currentRun (active partial run)
 * - RUNNING MODE: Display run is always currentRun with live updates
 */

/**
 * Get the workflow run to display for a specific node.
 * Handles version selection and execution modes automatically.
 */
export function getDisplayRun(
  nodeId: string,
  selectedRunIds: Record<string, number>,
  availableRuns: WorkflowRun[],
  currentRun: WorkflowRun | null
): WorkflowRun | null {
  // If user explicitly selected a version for this node, use it
  if (selectedRunIds[nodeId]) {
    return (
      availableRuns.find((run) => run.id === selectedRunIds[nodeId]) || null
    )
  }

  // Otherwise, default to current run
  return currentRun
}

/**
 * Get node execution state from workflow run.
 * Direct O(1) access by node ID - no step traversal needed.
 *
 * @example
 * ```tsx
 * const nodeState = getNodeState(workflowRun, nodeId)
 * if (nodeState) {
 *   return (
 *     <div>
 *       <Response content={nodeState.response} />
 *       <StatusBadge status={nodeState.status} />
 *     </div>
 *   )
 * }
 * ```
 */
export function getNodeState(
  run: WorkflowRun | null,
  nodeId: string
): NodeState | null {
  if (!run?.nodeStates) return null
  return run.nodeStates[nodeId] ?? null
}
