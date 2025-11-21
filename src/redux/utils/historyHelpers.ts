import { Draft } from '@reduxjs/toolkit'
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react'
import type {
  HistorySnapshot,
  NodeErrors,
  WorkflowBuilderState,
} from '../types/workflowBuilder'

// Constants
export const MAX_HISTORY_SIZE = 50

/**
 * Creates a deep clone snapshot of the current workflow state
 * Used for undo/redo functionality
 */
export const createSnapshot = (
  nodes: Node[],
  edges: Edge[],
  errorsByNodeId: Record<string, NodeErrors>
): HistorySnapshot => ({
  nodes: JSON.parse(JSON.stringify(nodes)),
  edges: JSON.parse(JSON.stringify(edges)),
  errorsByNodeId: JSON.parse(JSON.stringify(errorsByNodeId)),
})

/**
 * Pushes a snapshot to the history past stack
 * Clears the future stack and enforces max history size
 */
export const pushToHistory = (
  state: Draft<WorkflowBuilderState>,
  snapshot: HistorySnapshot
): void => {
  state.history.past.push(snapshot)
  // Clear future when a new action is performed
  state.history.future = []
  // Limit history size
  if (state.history.past.length > MAX_HISTORY_SIZE) {
    state.history.past.shift()
  }
}

/**
 * Checks if a node change is significant enough to save in history
 * Filters out selection, position, and dimension changes
 * @param changes - Array of node changes from ReactFlow
 * @returns true if any change is significant (add/remove)
 */
export const hasSignificantNodeChange = (changes: NodeChange[]): boolean => {
  return changes.some((change) => {
    // Only track add and remove changes
    // Exclude: position, dimensions, select, replace changes
    return change.type === 'remove' || change.type === 'add'
  })
}

/**
 * Checks if an edge change is significant enough to save in history
 * Filters out selection changes
 * @param changes - Array of edge changes from ReactFlow
 * @returns true if any change is significant (add/remove)
 */
export const hasSignificantEdgeChange = (changes: EdgeChange[]): boolean => {
  return changes.some((change) => {
    // Only track add and remove changes
    // Exclude: select, replace changes
    return change.type === 'remove' || change.type === 'add'
  })
}
