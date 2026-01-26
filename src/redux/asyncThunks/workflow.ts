import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getWorkflowsAPI,
  getWorkflowByIdAPI,
  createWorkflowAPI,
  updateWorkflowAPI,
  deleteWorkflowAPI,
  getWorkflowRunByIdAPI,
  getWorkflowRunsAPI,
  cloneWorkflowAPI,
  getActivePartialRunAPI,
  toggleManualModeAPI,
  updateWorkflowDisplayOrderAPI,
} from '@/api/workflows'
import {
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  WorkflowDisplayOrder,
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
