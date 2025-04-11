import { LLMModel } from './conversation'
import { MyFile } from './files'
import { Prompt } from './prompt'
import * as Yup from 'yup'

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
}

export interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  loading: boolean
  error: string | null
  isModalOpen: boolean
  savedStepIds: string[]
  tempSteps: Step[]
}

export interface WorkflowTableProps {
  searchQuery: string
}

export interface FormValues {
  title: string
  description: string
  mode: number
  steps: Step[]
}

export const workflowValidationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string()
    .required('Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  mode: Yup.number()
    .required('Mode is required')
    .oneOf(
      [WorkflowMode.Serial, WorkflowMode.Parallel],
      'Mode must be either Serial or Parallel'
    ),
  steps: Yup.array().of(
    Yup.object().shape({
      prompt: Yup.mixed().nullable().required('Prompt is required'),
      order: Yup.number().required('Order is required'),
      file: Yup.object().required('File is required'),
      llm: Yup.object().required('LLM is required'),
    })
  ),
})

export interface FormErrors {
  title?: string
  description?: string
  mode?: string
  steps?: StepError[] | undefined
}

export interface FormTouched {
  title?: boolean
  description?: boolean
  mode?: boolean
  steps?: StepTouched[] | undefined
}

export interface StepError {
  prompt?: string
  order?: string
  file?: string
  llm?: string
}

export interface StepTouched {
  prompt?: boolean
  order?: boolean
  file?: boolean
  llm?: boolean
}
