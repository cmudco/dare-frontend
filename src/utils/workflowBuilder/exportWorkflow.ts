import { type Node, type Edge } from '@xyflow/react'

/**
 * Workflow export format version.
 * Increment when making breaking changes to the export structure.
 */
export const WORKFLOW_EXPORT_VERSION = 1

/**
 * Marker to identify valid Dare workflow exports.
 * Used to distinguish workflow JSON from other clipboard content.
 */
export const WORKFLOW_EXPORT_MARKER = 'dareWorkflow'

/**
 * Exported workflow structure for clipboard sharing.
 */
export interface ExportedWorkflow {
  /** Marker to identify this as a Dare workflow export */
  [WORKFLOW_EXPORT_MARKER]: true
  /** Export format version for future compatibility */
  version: number
  /** Sanitized nodes (user-specific FKs cleared) */
  nodes: Node[]
  /** Edges connecting the nodes */
  edges: Edge[]
  /** Optional viewport state */
  viewport?: { x: number; y: number; zoom: number } | null
  /** Export metadata */
  exportedAt: string
}

/**
 * Node data fields that contain user-specific foreign key references.
 * These are cleared during export to make workflows shareable as templates.
 */
const USER_SPECIFIC_FK_FIELDS = [
  'prompt',
  'agent',
  'llm',
  'contentFiles',
  'embeddingFiles',
] as const

/**
 * Node data fields that contain runtime state (not part of configuration).
 * These are stripped during export.
 */
const RUNTIME_STATE_FIELDS = [
  'response',
  'error',
  'status',
  'apiId',
  'isCollapsed',
] as const

/**
 * Sanitizes node data by removing user-specific FK references and runtime state.
 * Preserves structural configuration like positions, routes, and text inputs.
 *
 * @param nodeType - The type of node being sanitized
 * @param data - The original node data
 * @returns Sanitized node data safe for export
 */
const sanitizeNodeData = (
  nodeType: string,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const sanitized = { ...data }

  // Clear user-specific foreign key references
  for (const field of USER_SPECIFIC_FK_FIELDS) {
    if (field in sanitized) {
      // Set FK fields to null (arrays to empty)
      if (Array.isArray(sanitized[field])) {
        sanitized[field] = []
      } else {
        sanitized[field] = null
      }
    }
  }

  // Strip runtime state fields
  for (const field of RUNTIME_STATE_FIELDS) {
    if (field in sanitized) {
      delete sanitized[field]
    }
  }

  // Node-type specific sanitization
  switch (nodeType) {
    case 'step':
      // Preserve: stepNumber, maxTokens, temperature, maxContextSnippets,
      // documentSimilarityThreshold, usePreviousStepFiles, usePreviousStepEmbeddings,
      // textInput, enableWebSearch
      break

    case 'start':
      // Preserve: title, description, mode, spareHandle
      break

    case 'chatOutput':
      // Preserve: stepNumber, label
      break

    case 'structuredOutput':
      // Preserve: routes, requireHumanValidation, stepNumber, textInput
      break
  }

  return sanitized
}

/**
 * Sanitizes a single node for export.
 *
 * @param node - The React Flow node to sanitize
 * @returns Sanitized node ready for export
 */
const sanitizeNode = (node: Node): Node => {
  const { data, ...rest } = node

  return {
    ...rest,
    data: sanitizeNodeData(node.type || '', data as Record<string, unknown>),
  }
}

/**
 * Sanitizes an edge for export.
 * Edges don't contain user-specific data, but we ensure consistency.
 *
 * @param edge - The React Flow edge to sanitize
 * @returns Sanitized edge ready for export
 */
const sanitizeEdge = (edge: Edge): Edge => {
  return {
    ...edge,
    // Clear selection state
    selected: false,
  }
}

/**
 * Exports a workflow to a portable JSON format suitable for clipboard sharing.
 *
 * The exported workflow:
 * - Has all user-specific FK references (prompts, agents, LLMs, files) cleared
 * - Has runtime state (responses, errors, status) stripped
 * - Preserves structural configuration (positions, routes, text inputs)
 * - Includes a version number for future compatibility
 * - Includes a marker to identify valid Dare workflow exports
 *
 * @param nodes - React Flow nodes to export
 * @param edges - React Flow edges to export
 * @param viewport - Optional viewport state
 * @returns ExportedWorkflow object ready for JSON serialization
 *
 * @example
 * ```typescript
 * const exported = exportWorkflow(nodes, edges, viewport)
 * await navigator.clipboard.writeText(JSON.stringify(exported, null, 2))
 * ```
 */
export const exportWorkflow = (
  nodes: Node[],
  edges: Edge[],
  viewport?: { x: number; y: number; zoom: number } | null
): ExportedWorkflow => {
  // Sanitize all nodes
  const sanitizedNodes = nodes.map(sanitizeNode)

  // Sanitize all edges
  const sanitizedEdges = edges.map(sanitizeEdge)

  return {
    [WORKFLOW_EXPORT_MARKER]: true,
    version: WORKFLOW_EXPORT_VERSION,
    nodes: sanitizedNodes,
    edges: sanitizedEdges,
    viewport: viewport ?? null,
    exportedAt: new Date().toISOString(),
  }
}

/**
 * Converts an exported workflow to a JSON string for clipboard.
 *
 * @param workflow - The exported workflow object
 * @returns Formatted JSON string
 */
export const exportWorkflowToString = (workflow: ExportedWorkflow): string => {
  return JSON.stringify(workflow, null, 2)
}
