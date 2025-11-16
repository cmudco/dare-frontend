import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  Workflow,
  WorkflowRun,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  ExecuteSingleStepRequest,
  SingleStepExecutionResponse,
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

export const submitHumanValidationAPI = async (
  runId: number,
  nodeId: string,
  chosenRoute: string
): Promise<{
  message: string
  chosenRoute: string
  nodeId: string
  workflowRunId: number
}> => {
  return await baseRequest({
    url: `api/workflow-runs/${runId}/submit-human-validation/`,
    method: METHOD.POST,
    data: {
      nodeId,
      chosenRoute,
    },
  })
}

export const getPendingValidationsAPI = async (
  runId: number
): Promise<{
  workflowRunId: number
  pendingValidations: Array<{
    nodeId: string
    stepNumber: number
    customPrompt: string
    availableRoutes: Array<{ name: string; description: string }>
    currentResponse: string
    stepId: number
  }>
  count: number
}> => {
  return await baseRequest({
    url: `api/workflow-runs/${runId}/pending-validations/`,
    method: METHOD.GET,
  })
}

export const executeSingleStepAPI = async (
  request: ExecuteSingleStepRequest
): Promise<SingleStepExecutionResponse> => {
  return await baseRequest<SingleStepExecutionResponse>({
    url: 'api/workflow-runs/execute-single-step/',
    method: METHOD.POST,
    data: {
      workflow_id: request.workflowId,
      step_node_id: request.stepNodeId,
      workflow_run_id: request.workflowRunId,
    },
  })
}
