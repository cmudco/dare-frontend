import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { type Node, type Edge } from '@xyflow/react'
import { OutputDisplayMode } from './workflowBuilder'

export enum WorkflowMode {
  Sequential = 'sequential',
  Parallel = 'parallel',
}

export interface WorkflowStepSnippet {
  id: number
  file: { id: number; name: string } | null
  text: string
  similarityScore: number
  chunkIndex: number
  vectorDbSource?: string
}

export interface WorkflowStepWebSearchSource {
  id: number
  url: string
  title: string
  citedText: string
  pageAge?: string
  provider: string
}

/**
 * Route definition for structured output nodes.
 * Used in node configuration where description is required.
 */
export interface RouteDef {
  name: string
  description: string
}

/**
 * Route option for socket events and validation.
 * Description is optional since socket events may omit it.
 */
export interface RouteOption {
  name: string
  description?: string
}

/**
 * Context data for pending human validation.
 * Contains AI analysis and reasoning.
 */
export interface PendingValidationContext {
  aiAnalysis?: string
}

/**
 * Pending validation structure for human-in-the-loop validation.
 * Used when a routing node requires human decision.
 */
export interface PendingValidation {
  nodeId: string
  routes: RouteOption[]
  aiRecommendation?: string
  aiAnalysis?: string
  context?: PendingValidationContext
}

// ==========================================
// NODE EXECUTION STATE TYPES
// ==========================================

/**
 * Validation context for structured output nodes.
 *
 * Backend ALWAYS returns availableRoutes as full route objects [{name, description}].
 * This is guaranteed by NodeExecutionStateBuilder.
 */
export interface ValidationContext {
  availableRoutes: RouteDef[] // Always full route objects from backend
  customPrompt: string
  aiRecommendation: string | null
  aiAnalysis: string | null
  stepNumber: number | null
}

/**
 * Node execution state in V2 API.
 * Represents the runtime state of any node in the workflow graph.
 */
/**
 * Metadata for completed routing nodes (structuredOutput).
 * Contains AI analysis that should be displayed even after decision.
 */
export interface RoutingMetadata {
  aiRecommendation: string | null
  aiAnalysis: string | null
  isHumanValidated: boolean
  userChoice: string | null
  selectedRoute: string | null
}

export interface NodeState {
  nodeId: string // Node ID from workflow graph (survives DRF CamelCase key mangling)
  stepId: number | null // Backend step ID (null for display nodes)
  startedAt?: string | null // Server timestamp when execution started
  nodeType: string // 'step' | 'structuredOutput' | 'chatOutput' | 'start'
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  validationContext: ValidationContext | null // Only present when status is PENDING_HUMAN_INPUT
  metadata: RoutingMetadata | null // Present for completed routing nodes with AI analysis
  snippets?: WorkflowStepSnippet[] // RAG snippets retrieved for this step
  webSearchSources?: WorkflowStepWebSearchSource[] // Web search citations for this step
}

/**
 * Map of node IDs to their execution states.
 * All nodes in the workflow graph are guaranteed to be present.
 */
export type NodeStatesMap = Record<string, NodeState>

export interface WorkflowRun {
  id: number
  workflow: number
  user: number
  status: WorkflowRunStepStatus
  startedAt: string
  endedAt: string | null
  workflowTitle: string
  workflowDescription: string
  isPartial?: boolean
  nodeStates?: NodeStatesMap // Graph-based execution state - O(1) access by node_id
  pendingValidation?: PendingValidation | null // Flat pending validation from backend
}

export interface Workflow {
  id: number
  user: string
  version?: number
  parent?: number | null
  createdAt?: string
  displayOrder?: number
  nodes: Node[]
  edges: Edge[]
  latestRun?: WorkflowRun | null
  lastRunId?: number | null

  // Dynamic properties from StartNodeData
  title: string
  description: string
  mode: WorkflowMode
  viewport?: { x: number; y: number; zoom: number }
  manualModeEnabled?: boolean
  outputDisplayMode?: OutputDisplayMode

  // Publishing / sharing fields
  isPublished?: boolean
  publishedAt?: string | null
  isForked?: boolean
  ownerUsername?: string
}

export interface WorkflowState {
  workflows: Workflow[]
  sharedWorkflows: Workflow[]
  selectedWorkflow: Workflow | null
  workflowRuns: WorkflowRun[]
  loading: boolean
  error: string | null
}

export interface WorkflowTableProps {
  searchQuery: string
  activeTab: 'my' | 'library'
}

export interface CreateWorkflowDTO {
  nodes: Node[]
  edges: Edge[]
  viewportX?: number
  viewportY?: number
  viewportZoom?: number
  outputDisplayMode?: OutputDisplayMode
}

export interface UpdateWorkflowDTO {
  nodes?: Node[]
  edges?: Edge[]
  viewportX?: number
  viewportY?: number
  viewportZoom?: number
  outputDisplayMode?: OutputDisplayMode
}

export interface GetActivePartialRunResponse {
  partialRun: WorkflowRun | null
  executedStepNodeIds: string[]
}

export interface WorkflowDisplayOrder {
  id: number
  displayOrder: number
}
