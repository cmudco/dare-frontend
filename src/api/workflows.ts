import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  Step,
  Workflow,
  WorkflowRun,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
} from '@/redux/types/workflow'

export const getWorkflowsAPI = async (): Promise<{ results: Workflow[] }> => {
  return await baseRequest<{ results: Workflow[] }>({
    url: 'api/workflows/',
    method: METHOD.GET,
  })
}

export const getWorkflowByIdAPI = async (id: number): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/`,
    method: METHOD.GET,
  })
}

export const createWorkflowAPI = async (
  workflowData: CreateWorkflowDTO
): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: 'api/workflows/',
    method: METHOD.POST,
    data: workflowData,
  })
}

export const updateWorkflowAPI = async (
  id: number,
  workflowData: UpdateWorkflowDTO
): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/`,
    method: METHOD.PUT,
    data: workflowData,
  })
}

export const deleteWorkflowAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/workflows/${id}/`,
    method: METHOD.DELETE,
  })
}

export const createStepAPI = async (stepData: {
  prompt: string
  order: number
  user?: string
}): Promise<Step> => {
  return await baseRequest<Step>({
    url: 'api/steps/',
    method: METHOD.POST,
    data: stepData,
  })
}

export const startWorkflowRunAPI = async (
  workflowId: number
): Promise<WorkflowRun> => {
  return await baseRequest<WorkflowRun>({
    url: 'api/workflow-runs/run-workflow/',
    method: METHOD.POST,
    data: { workflow_id: workflowId },
  })
}

export const getWorkflowRunByIdAPI = async (
  runId: number
): Promise<WorkflowRun> => {
  return await baseRequest<WorkflowRun>({
    url: `api/workflow-runs/${runId}/`,
    method: METHOD.GET,
  })
}

export const cloneWorkflowAPI = async (id: number): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/clone/`,
    method: METHOD.POST,
  })
}

export const exportWorkflowRunPdfAPI = async (
  runId: number
): Promise<{ blob: Blob; filename: string }> => {
  return await baseRequest({
    url: `api/workflow-runs/${runId}/export-pdf/`,
    method: METHOD.GET,
    responseType: 'blob',
  })
}
