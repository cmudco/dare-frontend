/**
 * ============================================================================
 * WORKFLOW NODE TYPE DEFINITIONS
 * ============================================================================
 *
 * Shared type definitions for workflow node data structures.
 * Ensures type safety across all node components.
 */

/**
 * Base interface for all output node data.
 * All output nodes (Chat, StructuredOutput) extend this.
 */
export interface BaseOutputNodeData {
  /**
   * Whether the node is collapsed in the UI
   */
  isCollapsed?: boolean
}

/**
 * Chat output node specific data
 * Currently uses all fields from BaseOutputNodeData with no additional fields.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChatOutputNodeData extends BaseOutputNodeData {
  // Note: response, status, error are now read from workflow runs, not stored in node.data
  // This interface is kept for backwards compatibility and type safety
}

/**
 * Route definition for structured output nodes
 */
export interface NodeRoute {
  name: string
  description: string
}

// Export alias for backward compatibility
export type StructuredOutputRoute = NodeRoute

/**
 * Structured output node specific data
 * Routing node that evaluates input and selects a route
 */
export interface StructuredOutputNodeData extends BaseOutputNodeData {
  prompt: number | null
  llm: number | null
  routes: NodeRoute[]
  requireHumanValidation: boolean
  textInput?: string
}
