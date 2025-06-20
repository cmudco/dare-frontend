import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import { Step, Workflow, WorkflowRun } from '@/redux/types/workflow'
import { Prompt } from '@/redux/types/prompt'

export const getWorkflowsAPI = async (): Promise<{ results: Workflow[] }> => {
  return await baseRequest<{ results: Workflow[] }>({
    url: 'api/workflows/',
    method: METHOD.GET,
  })
}

export const getWorkflowByIdAPI = async (id: string): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/`,
    method: METHOD.GET,
  })
}

export const createWorkflowAPI = async (workflowData: {
  title: string
  description: string
  mode: number
  steps_ids?: string[]
}): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: 'api/workflows/',
    method: METHOD.POST,
    data: workflowData,
  })
}

export const updateWorkflowAPI = async (
  id: string,
  workflowData: {
    title?: string
    description?: string
    mode?: number
    steps_ids?: string[]
  }
): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/`,
    method: METHOD.PUT,
    data: workflowData,
  })
}

export const deleteWorkflowAPI = async (id: string): Promise<void> => {
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

export const updateStepAPI = async (
  id: string,
  stepData: Partial<Omit<Step, 'prompt'> & { prompt: string | Prompt }> & {
    user?: string
  }
): Promise<Step> => {
  return await baseRequest<Step>({
    url: `api/steps/${id}/`,
    method: METHOD.PATCH,
    data: stepData,
  })
}

export const deleteStepAPI = async (id: string): Promise<void> => {
  await baseRequest<void>({
    url: `api/steps/${id}/`,
    method: METHOD.DELETE,
  })
}

export const startWorkflowRunAPI = async (
  workflowId: string
): Promise<WorkflowRun> => {
  return await baseRequest<WorkflowRun>({
    url: 'api/workflow-runs/run-workflow/',
    method: METHOD.POST,
    data: { workflow_id: workflowId },
  })
}

export const getWorkflowRunByIdAPI = async (
  runId: string
): Promise<WorkflowRun> => {
  return await baseRequest<WorkflowRun>({
    url: `api/workflow-runs/${runId}/`,
    method: METHOD.GET,
  })
}

export const cloneWorkflowAPI = async (id: string): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${id}/clone/`,
    method: METHOD.POST,
  })
}
