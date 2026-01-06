import { type Node, type Edge } from '@xyflow/react'
import { nanoid } from 'nanoid'
import {
  WORKFLOW_EXPORT_MARKER,
  WORKFLOW_EXPORT_VERSION,
  type ExportedWorkflow,
} from './exportWorkflow'

/**
 * Result of a workflow import operation.
 */
export interface ImportResult {
  /** Whether the import was successful */
  success: boolean
  /** Imported nodes with regenerated IDs */
  nodes: Node[]
  /** Imported edges with updated references */
  edges: Edge[]
  /** Error message if import failed */
  error?: string
}

/**
 * Options for importing a workflow.
 */
export interface ImportOptions {
  /** Center position for placing imported nodes */
  viewportCenter: { x: number; y: number }
  /** Whether to offset positions relative to viewport center */
  offsetToCenter?: boolean
}

/**
 * Type guard to check if an object is a valid ExportedWorkflow.
 *
 * @param obj - Object to validate
 * @returns True if the object is a valid ExportedWorkflow
 */
const isExportedWorkflow = (obj: unknown): obj is ExportedWorkflow => {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const workflow = obj as Record<string, unknown>

  // Check for required marker
  if (workflow[WORKFLOW_EXPORT_MARKER] !== true) {
    return false
  }

  // Check for required fields
  if (typeof workflow.version !== 'number') {
    return false
  }

  if (!Array.isArray(workflow.nodes)) {
    return false
  }

  if (!Array.isArray(workflow.edges)) {
    return false
  }

  return true
}

/**
 * Validates the export version compatibility.
 *
 * @param version - Version number from the exported workflow
 * @returns True if the version is compatible
 */
const isVersionCompatible = (version: number): boolean => {
  // Currently only support exact version match
  // In the future, could support backward compatibility for older versions
  return version <= WORKFLOW_EXPORT_VERSION
}

/**
 * Calculates the bounding box of a set of nodes.
 *
 * @param nodes - Nodes to calculate bounds for
 * @returns Bounding box with min/max coordinates and center
 */
const calculateNodesBounds = (
  nodes: Node[]
): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  centerX: number
  centerY: number
} => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const x = node.position.x
    const y = node.position.y
    // Estimate node dimensions if not available
    const width = (node.width as number) || 300
    const height = (node.height as number) || 200

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

/**
 * Generates a mapping of old node IDs to new unique IDs.
 *
 * @param nodes - Nodes to generate ID mapping for
 * @returns Map of old ID to new ID
 */
const generateIdMapping = (nodes: Node[]): Map<string, string> => {
  const mapping = new Map<string, string>()

  for (const node of nodes) {
    mapping.set(node.id, nanoid())
  }

  return mapping
}

/**
 * Transforms a node with a new ID and updated position.
 *
 * @param node - Original node
 * @param newId - New unique ID for the node
 * @param positionOffset - Offset to apply to the node position
 * @returns Transformed node
 */
const transformNode = (
  node: Node,
  newId: string,
  positionOffset: { x: number; y: number }
): Node => {
  return {
    ...node,
    id: newId,
    position: {
      x: node.position.x + positionOffset.x,
      y: node.position.y + positionOffset.y,
    },
    // Reset selection and dragging state
    selected: false,
    dragging: false,
    // Clear dimensions so React Flow recalculates
    width: undefined,
    height: undefined,
  }
}

/**
 * Transforms an edge with new IDs based on the node ID mapping.
 *
 * @param edge - Original edge
 * @param idMapping - Map of old node IDs to new IDs
 * @returns Transformed edge, or null if source/target not found in mapping
 */
const transformEdge = (
  edge: Edge,
  idMapping: Map<string, string>
): Edge | null => {
  const newSource = idMapping.get(edge.source)
  const newTarget = idMapping.get(edge.target)

  // Both source and target must exist in the mapping
  if (!newSource || !newTarget) {
    console.warn(
      `Edge ${edge.id} references unknown nodes: source=${edge.source}, target=${edge.target}`
    )
    return null
  }

  const newEdgeId = `e-${newSource}-${newTarget}`

  return {
    ...edge,
    id: newEdgeId,
    source: newSource,
    target: newTarget,
    // Reset selection state
    selected: false,
  }
}

/**
 * Parses and validates a JSON string as a workflow export.
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed ExportedWorkflow or error
 */
export const parseWorkflowJson = (
  jsonString: string
):
  | { success: true; workflow: ExportedWorkflow }
  | { success: false; error: string } => {
  // Try to parse as JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { success: false, error: 'Invalid JSON format' }
  }

  // Validate structure
  if (!isExportedWorkflow(parsed)) {
    return {
      success: false,
      error:
        'Not a valid Dare workflow export. Missing required fields or marker.',
    }
  }

  // Check version compatibility
  if (!isVersionCompatible(parsed.version)) {
    return {
      success: false,
      error: `Incompatible workflow version: ${parsed.version}. Maximum supported version: ${WORKFLOW_EXPORT_VERSION}`,
    }
  }

  return { success: true, workflow: parsed }
}

/**
 * Imports a workflow from an ExportedWorkflow object.
 *
 * This function:
 * - Regenerates all node IDs to avoid collisions
 * - Updates edge source/target references
 * - Offsets node positions to center them at the viewport
 *
 * @param workflow - The exported workflow to import
 * @param options - Import options including viewport center
 * @returns ImportResult with transformed nodes and edges
 *
 * @example
 * ```typescript
 * const parseResult = parseWorkflowJson(clipboardContent)
 * if (parseResult.success) {
 *   const importResult = importWorkflow(parseResult.workflow, {
 *     viewportCenter: { x: 400, y: 300 }
 *   })
 *   if (importResult.success) {
 *     dispatch(importNodes({ nodes: importResult.nodes, edges: importResult.edges }))
 *   }
 * }
 * ```
 */
export const importWorkflow = (
  workflow: ExportedWorkflow,
  options: ImportOptions
): ImportResult => {
  const { nodes: sourceNodes, edges: sourceEdges } = workflow
  const { viewportCenter, offsetToCenter = true } = options

  // Handle empty workflow
  if (sourceNodes.length === 0) {
    return {
      success: true,
      nodes: [],
      edges: [],
    }
  }

  // Generate ID mapping for all nodes
  const idMapping = generateIdMapping(sourceNodes)

  // Calculate position offset to center nodes at viewport
  let positionOffset = { x: 0, y: 0 }

  if (offsetToCenter) {
    const bounds = calculateNodesBounds(sourceNodes)
    positionOffset = {
      x: viewportCenter.x - bounds.centerX,
      y: viewportCenter.y - bounds.centerY,
    }
  }

  // Transform nodes with new IDs and positions
  const transformedNodes = sourceNodes.map((node) => {
    const newId = idMapping.get(node.id)!
    return transformNode(node, newId, positionOffset)
  })

  // Transform edges with updated references
  const transformedEdges: Edge[] = []
  for (const edge of sourceEdges) {
    const transformed = transformEdge(edge, idMapping)
    if (transformed) {
      transformedEdges.push(transformed)
    }
  }

  return {
    success: true,
    nodes: transformedNodes,
    edges: transformedEdges,
  }
}

/**
 * Convenience function to parse and import a workflow from a JSON string.
 *
 * @param jsonString - JSON string containing the exported workflow
 * @param options - Import options
 * @returns ImportResult
 */
export const importWorkflowFromString = (
  jsonString: string,
  options: ImportOptions
): ImportResult => {
  const parseResult = parseWorkflowJson(jsonString)

  if (!parseResult.success) {
    return {
      success: false,
      nodes: [],
      edges: [],
      error: parseResult.error,
    }
  }

  return importWorkflow(parseResult.workflow, options)
}
