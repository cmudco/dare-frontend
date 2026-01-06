import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getWorkflowsAPI,
  getWorkflowByIdAPI,
  createWorkflowAPI,
  updateWorkflowAPI,
  deleteWorkflowAPI,
  startWorkflowRunAPI,
  getWorkflowRunByIdAPI,
  getWorkflowRunsAPI,
  cloneWorkflowAPI,
  executeSingleStepAPI,
  getActivePartialRunAPI,
  toggleManualModeAPI,
  updateWorkflowDisplayOrderAPI,
  // V2 API functions
  getWorkflowRunByIdV2API,
  executeSingleStepV2API,
  submitHumanValidationV2API,
} from '@/api/workflows'
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  ExecuteSingleStepRequest,
  WorkflowDisplayOrder,
  WorkflowRun,
  SingleStepExecutionResponseV2,
} from '@/redux/types/workflow'

export const getWorkflows = createAsyncThunk(
  'workflows/getWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWorkflowsAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getWorkflowById = createAsyncThunk(
  'workflows/getWorkflowById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await getWorkflowByIdAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createOrUpdateWorkflow = createAsyncThunk(
  'workflows/createOrUpdateWorkflow',
  async (
    {
      id,
      workflowData,
    }: {
      id?: number
      workflowData: CreateWorkflowDTO | UpdateWorkflowDTO
    },
    { rejectWithValue }
  ) => {
    try {
      if (id) {
        return await updateWorkflowAPI(id, workflowData as UpdateWorkflowDTO)
      } else {
        return await createWorkflowAPI(workflowData as CreateWorkflowDTO)
      }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteWorkflow = createAsyncThunk(
  'workflows/deleteWorkflow',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteWorkflowAPI(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const startWorkflowRun = createAsyncThunk(
  'workflows/startWorkflowRun',
  async (workflowId: number, { rejectWithValue }) => {
    try {
      const response = await startWorkflowRunAPI(workflowId)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getWorkflowRunById = createAsyncThunk(
  'workflows/getWorkflowRunById',
  async (runId: number, { rejectWithValue }) => {
    try {
      return await getWorkflowRunByIdAPI(runId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getWorkflowRuns = createAsyncThunk(
  'workflows/getWorkflowRuns',
  async (workflowId: number, { rejectWithValue }) => {
    try {
      const response = await getWorkflowRunsAPI(workflowId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const cloneWorkflow = createAsyncThunk(
  'workflows/cloneWorkflow',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cloneWorkflowAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const executeSingleStep = createAsyncThunk(
  'workflows/executeSingleStep',
  async (request: ExecuteSingleStepRequest, { rejectWithValue }) => {
    try {
      const response = await executeSingleStepAPI(request)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getActivePartialRun = createAsyncThunk(
  'workflows/getActivePartialRun',
  async (workflowId: number, { rejectWithValue }) => {
    try {
      const response = await getActivePartialRunAPI(workflowId)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const toggleManualMode = createAsyncThunk(
  'workflows/toggleManualMode',
  async (
    {
      workflowId,
      manualModeEnabled,
    }: { workflowId: number; manualModeEnabled: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleManualModeAPI(workflowId, manualModeEnabled)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateWorkflowDisplayOrder = createAsyncThunk(
  'workflows/updateWorkflowDisplayOrder',
  async (updates: WorkflowDisplayOrder[], { rejectWithValue }) => {
    try {
      await updateWorkflowDisplayOrderAPI(updates)
      return updates
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// ==========================================
// V2 API ASYNC THUNKS (GRAPH-BASED NODE STATES)
// ==========================================

/**
 * Get workflow run by ID using V2 API with nodeStates.
 * Returns WorkflowRun with nodeStates map for direct O(1) node access.
 */
export const getWorkflowRunByIdV2 = createAsyncThunk<
  WorkflowRun,
  number,
  { rejectValue: string }
>('workflows/getWorkflowRunByIdV2', async (runId, { rejectWithValue }) => {
  try {
    return await getWorkflowRunByIdV2API(runId)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

/**
 * Execute single step using V2 API.
 * Returns full WorkflowRun with nodeStates instead of custom stepResult.
 */
export const executeSingleStepV2 = createAsyncThunk<
  SingleStepExecutionResponseV2,
  ExecuteSingleStepRequest,
  { rejectValue: string }
>('workflows/executeSingleStepV2', async (request, { rejectWithValue }) => {
  try {
    return await executeSingleStepV2API(request)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

/**
 * Submit human validation using V2 API.
 * Returns full WorkflowRun with updated nodeStates.
 */
export const submitHumanValidationV2 = createAsyncThunk<
  WorkflowRun,
  { workflowRunId: number; nodeId: string; chosenRoute: string },
  { rejectValue: string }
>(
  'workflows/submitHumanValidationV2',
  async ({ workflowRunId, nodeId, chosenRoute }, { rejectWithValue }) => {
    try {
      return await submitHumanValidationV2API(
        workflowRunId,
        nodeId,
        chosenRoute
      )
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
