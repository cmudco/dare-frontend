import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  Workflow,
  WorkflowRun,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  GetActivePartialRunResponse,
  WorkflowDisplayOrder,
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

export const getWorkflowRunByIdAPI = async (
  runId: number
): Promise<WorkflowRun> => {
  return await baseRequest<WorkflowRun>({
    url: `api/workflow-runs/${runId}/`,
    method: METHOD.GET,
  })
}

export const getWorkflowRunsAPI = async (
  workflowId: number
): Promise<{ results: WorkflowRun[] }> => {
  return await baseRequest<{ results: WorkflowRun[] }>({
    url: `api/workflow-runs/?workflow=${workflowId}`,
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

export const getActivePartialRunAPI = async (
  workflowId: number
): Promise<GetActivePartialRunResponse> => {
  return await baseRequest<GetActivePartialRunResponse>({
    url: `api/workflow-runs/get-active-partial-run/?workflow_id=${workflowId}`,
    method: METHOD.GET,
  })
}

export const toggleManualModeAPI = async (
  workflowId: number,
  manualModeEnabled: boolean
): Promise<Workflow> => {
  return await baseRequest<Workflow>({
    url: `api/workflows/${workflowId}/toggle-manual-mode/`,
    method: METHOD.PATCH,
    data: { manual_mode_enabled: manualModeEnabled },
  })
}

export const updateWorkflowDisplayOrderAPI = async (
  updates: WorkflowDisplayOrder[]
): Promise<void> => {
  await baseRequest<void>({
    url: 'api/workflows/update-display-order/',
    method: METHOD.PATCH,
    data: updates,
  })
}
