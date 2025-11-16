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
 * All output nodes (Chat, Conditional, StructuredOutput) extend this.
 */
export interface BaseOutputNodeData {
  /**
   * The step number/order in the workflow execution
   */
  stepNumber: number

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
 * Route definition for conditional/structured output nodes
 */
export interface NodeRoute {
  name: string
  description: string
}

// Export with different names for backward compatibility
export type ConditionalRoute = NodeRoute
export type StructuredOutputRoute = NodeRoute

/**
 * Conditional node specific data
 */
export interface ConditionalNodeData extends BaseOutputNodeData {
  prompt: number | null
  llm: number | null
  routes: NodeRoute[]
  requireHumanValidation: boolean
  id?: string
}

/**
 * Structured output node specific data
 */
export interface StructuredOutputNodeData extends BaseOutputNodeData {
  prompt: number | null
  llm: number | null
  routes: NodeRoute[]
  requireHumanValidation: boolean
}
