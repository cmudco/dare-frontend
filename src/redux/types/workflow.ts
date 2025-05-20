import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { LLMModel } from './conversation'
import { MyFile } from './files'
import { Prompt } from './prompt'
import { FormikErrors, FormikTouched } from 'formik'

export enum WorkflowMode {
  Serial = 1,
  Parallel = 2,
}

export interface Step {
  id?: string
  workflow?: string
  prompt: Prompt | null
  file: MyFile | null
  llm: LLMModel | null
  order: number
  createdAt?: string
  maxTokens?: number
  temperature?: number
}

export interface WorkflowRunStep {
  id: string
  step: number
  order: number
  status: WorkflowRunStepStatus
  response: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkflowRun {
  id: string
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
  id: string
  title: string
  description: string
  mode: WorkflowMode
  createdAt?: string
  created_at?: string
  user: string
  steps?: Step[]
  lastRunId?: string | null
  latestRun?: WorkflowRun | null
}

export interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  workflowRuns: WorkflowRun[]
  selectedWorkflowRun: WorkflowRun | null
  loading: boolean
  error: string | null
  isModalOpen: boolean
  savedStepIds: string[]
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
  onRemove: () => void
  onMove: (direction: 'up' | 'down') => void
  onChange: (field: keyof Step, value: unknown) => void
  error?: FormikErrors<Step>
  touched?: FormikTouched<Step>
  totalSteps?: number
  isOpenByDefault?: boolean
}

export interface WorkflowStepsProps {
  steps: Step[]
  setSteps: (steps: Step[]) => void
  errors: FormikErrors<FormValues>
  touched: FormikTouched<FormValues>
}
