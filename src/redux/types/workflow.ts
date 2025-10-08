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
}

export interface WorkflowRunStep {
  id: number
  step_node: number
  order: number
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  createdAt: string
  updatedAt: string
  snippets?: WorkflowStepSnippet[]
}

export interface WorkflowRun {
  id: number
  workflow: number
  user: number
  status: WorkflowRunStepStatus
  startedAt: string
  endedAt: string | null
  steps: WorkflowRunStep[]
  workflowTitle: string
  workflowDescription: string
  hasPendingValidation?: boolean
  pendingValidations?: PendingValidation[]
}

export interface Workflow {
  id: number
  user: string
  version?: number
  parent?: number | null
  createdAt?: string
  nodes: Node[]
  edges: Edge[]
  latestRun?: WorkflowRun | null
  lastRunId?: number | null

  // Dynamic properties from StartNodeData
  title: string
  description: string
  mode: WorkflowMode
  viewport?: { x: number; y: number; zoom: number }
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
