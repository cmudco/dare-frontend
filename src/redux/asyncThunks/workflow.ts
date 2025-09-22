import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getWorkflowsAPI,
  getWorkflowByIdAPI,
  createWorkflowAPI,
  updateWorkflowAPI,
  deleteWorkflowAPI,
  startWorkflowRunAPI,
  getWorkflowRunByIdAPI,
  cloneWorkflowAPI,
} from '@/api/workflows'
import { Workflow, WorkflowRun } from '../types/workflow'

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
      workflowData: {
        title: string
        description: string
        mode: number
        layout?: Record<string, { x: number; y: number }>
        viewport?: { x: number; y: number; zoom: number } | null
        steps: {
          id?: number
          order: number
          prompt: number | null
          files?: number[]
          embeddings?: number[]
          llm?: number | null
          maxTokens?: number | null
          temperature?: number | null
          maxContextSnippets?: number | null
          documentSimilarityThreshold?: number | null
        }[]
      }
    },
    { rejectWithValue }
  ) => {
    try {
      let workflow: Workflow

      if (id) {
        workflow = await updateWorkflowAPI(id, workflowData)
      } else {
        workflow = await createWorkflowAPI(workflowData)
      }

      return workflow
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

export const startWorkflowRun = createAsyncThunk<
  WorkflowRun,
  number,
  { rejectValue: string }
>(
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
