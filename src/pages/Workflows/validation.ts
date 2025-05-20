import { WorkflowMode } from '@/redux/types/workflow'
import * as Yup from 'yup'

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
      maxTokens: Yup.number().nullable(),
      temperature: Yup.number().nullable(),
    })
  ),
})
