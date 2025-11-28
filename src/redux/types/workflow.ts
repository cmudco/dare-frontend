import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { MyFile } from './files'
import { FormikErrors, FormikTouched } from 'formik'
import { type Node, type Edge } from '@xyflow/react'

export enum WorkflowMode {
  Serial = 1,
  Parallel = 2,
}

export interface WorkflowStepSnippet {
  id: number
  file: MyFile
  text: string
  similarityScore: number
  chunkIndex: number
  vectorDbSource?: string
}

export interface ConditionalRoute {
  name: string
  description: string
}

export interface PendingValidation {
  nodeId: string
  stepNumber: number
  customPrompt: string
  availableRoutes: ConditionalRoute[]
  currentResponse: string
  stepId: number
  aiRecommendation?: string
  aiAnalysis?: string
}

export interface WorkflowRunStep {
  id: number
  stepNode: number
  order: number
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  metadata?: {
    routingDecision?: string
    analysis?: string
    aiRecommendation?: string
    availableRoutes?: ConditionalRoute[] // Route objects for both Conditional and StructuredOutput nodes
    isHumanValidated?: boolean
    fullResponse?: string
    pendingHumanDecision?: boolean
    userChoice?: string
    selectedRoute?: string // For structured output nodes
    rawResponse?: string // For structured output nodes
  } | null
  createdAt: string
  updatedAt: string
  snippets?: WorkflowStepSnippet[]
}

// ==========================================
// V2 API TYPES (GRAPH-BASED NODE STATES)
// ==========================================

/**
 * Validation context for conditional/structured output nodes.
 * Normalized structure across both node types.
 */
export interface ValidationContext {
  availableRoutes: ConditionalRoute[]
  customPrompt: string
  aiRecommendation: string | null
  aiAnalysis: string | null
  stepNumber: number | null
}

/**
 * Node execution state in V2 API.
 * Represents the runtime state of any node in the workflow graph.
 */
export interface NodeState {
  nodeId: string // Node ID from the workflow graph (included to survive DRF CamelCase key mangling)
  stepId: number | null // WorkflowRunStep ID (null for display nodes)
  nodeType: string // 'step' | 'conditional' | 'structuredOutput' | 'chatOutput' | 'start'
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  validationContext: ValidationContext | null // Only present when status is PENDING_HUMAN_INPUT
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
  steps: WorkflowRunStep[] // V1 API (legacy)
  workflowTitle: string
  workflowDescription: string
  hasPendingValidation?: boolean
  pendingValidations?: PendingValidation[]
  isPartial?: boolean
  nodeStates?: NodeStatesMap // V2 API (graph-based) - Direct O(1) access by node_id
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
}

export interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  workflowRuns: WorkflowRun[]
  selectedWorkflowRun: WorkflowRun | null
  loading: boolean
  error: string | null
  // LEGACY: Commenting out modal state
  // isModalOpen: boolean
  savedNodeIds: string[]
  tempNodes: Node[]
  tempEdges: Edge[]
}

export interface FormValues {
  title: string
  description: string
  mode: number
  nodes: Node[]
  edges: Edge[]
}

export interface WorkflowTableProps {
  searchQuery: string
}

export interface WorkflowFieldsProps {
  values: FormValues
  errors: FormikErrors<FormValues>
  touched: FormikTouched<FormValues>
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  setFieldValue: <K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) => void
  isEditMode: boolean
}

export interface WorkflowFooterProps {
  loading: boolean
  isValid: boolean
  dirty: boolean
  unsavedNodes: number
  nodesCount: number
}

export interface CreateWorkflowDTO {
  nodes: Node[] // Direct React Flow nodes
  edges: Edge[] // Direct React Flow edges
  viewport_x?: number
  viewport_y?: number
  viewport_zoom?: number
}

export interface UpdateWorkflowDTO {
  nodes?: Node[] // Direct React Flow nodes
  edges?: Edge[] // Direct React Flow edges
  viewport_x?: number
  viewport_y?: number
  viewport_zoom?: number
}

export interface SingleStepResult {
  stepId: number
  nodeId: string
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  metadata: {
    routingDecision?: string
    analysis?: string
    aiRecommendation?: string
    availableRoutes?: ConditionalRoute[]
    isHumanValidated?: boolean
    fullResponse?: string
    pendingHumanDecision?: boolean
    userChoice?: string
    selectedRoute?: string
    rawResponse?: string
  } | null
}

export interface SingleStepExecutionResponse {
  success: boolean
  workflowRunId: number
  stepResult: SingleStepResult | null
  missingDependencies: string[]
  error: string | null
}

/**
 * V2 API response for execute-single-step endpoint.
 * Returns full WorkflowRun with nodeStates instead of custom stepResult.
 */
export interface SingleStepExecutionResponseV2 {
  success: boolean
  workflowRun: WorkflowRun // Full run with nodeStates
  missingDependencies: string[]
  error: string | null
}

export interface ExecuteSingleStepRequest {
  workflowId: number
  stepNodeId: string
  workflowRunId?: number | null
}

export interface PartialRunStep {
  id: number
  stepNode: number
  order: number
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  metadata: {
    routingDecision?: string
    analysis?: string
    aiRecommendation?: string
    availableRoutes?: ConditionalRoute[]
    isHumanValidated?: boolean
    fullResponse?: string
    pendingHumanDecision?: boolean
    userChoice?: string
    selectedRoute?: string
    rawResponse?: string
  } | null
  createdAt: string
  updatedAt: string
  nodeId: string // Enriched field from backend containing the workflow node ID
}

export interface GetActivePartialRunResponse {
  partialRun: WorkflowRun | null
  executedStepNodeIds: string[]
}

export interface RestorePartialRunPayload {
  partialRunId: number
  executedStepNodeIds: string[]
  steps: Array<{
    stepNode: string
    response: string | null
    status: WorkflowRunStepStatus
    error: string | null
  }>
}

export interface WorkflowDisplayOrder {
  id: number
  displayOrder: number
}
