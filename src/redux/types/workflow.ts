import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { LLMModel } from './conversation'
import { MyFile } from './files'
import { Prompt } from './prompt'
import { FormikErrors, FormikTouched } from 'formik'

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

export interface Step {
  id?: number
  workflow?: number
  prompt: Prompt | null
  files: MyFile[]
  embeddings: MyFile[]
  usePreviousStepFiles?: boolean
  usePreviousStepEmbeddings?: boolean
  llm: LLMModel | null
  order: number
  createdAt?: string
  user?: number
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
}

export interface WorkflowRunStep {
  id: number
  step: number
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
}

export interface Workflow {
  id: number
  title: string
  description: string
  mode: WorkflowMode
  version?: number
  parent?: number | null
  createdAt?: string
  created_at?: string
  user: string
  steps?: Step[]
  lastRunId?: number | null
  latestRun?: WorkflowRun | null
  layout?: Record<string, { x: number; y: number }>
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
  savedStepIds: number[]
  tempSteps: Step[]
}

export interface FormValues {
  title: string
  description: string
  mode: number
  steps: Step[]
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
  unsavedSteps: number
  stepsCount: number
}

export interface WorkflowStepProps {
  index: number
  step: Step
  prompts: Prompt[]
  files: MyFile[]
  llms: LLMModel[]
  totalSteps: number
  onStepChange: (index: number, field: keyof Step, value: unknown) => void
  onStepRemove: (index: number) => void
  onStepReorder: (fromIndex: number, toIndex: number) => void
  error?: FormikErrors<Step>
  touched?: FormikTouched<Step>
}

export interface WorkflowStepsProps {
  steps: Step[]
  setSteps: (steps: Step[]) => void
  errors: FormikErrors<FormValues>
  touched: FormikTouched<FormValues>
}

export interface CreateStepDTO {
  order: number
  prompt: number | null
  files?: number[]
  embeddings?: number[]
  usePreviousStepFiles?: boolean
  usePreviousStepEmbeddings?: boolean
  llm?: number | null
  maxTokens?: number | null
  temperature?: number | null
  maxContextSnippets?: number | null
  documentSimilarityThreshold?: number | null
}

export interface CreateWorkflowDTO {
  title: string
  description: string
  mode: number
  steps: CreateStepDTO[]
}

export interface UpdateWorkflowDTO {
  title?: string
  description?: string
  mode?: number
  steps?: CreateStepDTO[]
  layout?: Record<string, { x: number; y: number }>
  viewport?: { x: number; y: number; zoom: number } | null
}
