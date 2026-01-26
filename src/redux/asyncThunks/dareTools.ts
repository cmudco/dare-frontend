/**
 * DARE Tools async thunks
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { getDareToolsAPI, getDareToolExecutionsAPI } from '@/api/dareTools'
import { DareTool, DareToolExecution } from '@/redux/types/dareTools'

/**
 * Fetch all available DARE tools
 */
export const getDareTools = createAsyncThunk<DareTool[], void>(
  'dareTools/getDareTools',
  async (_, { rejectWithValue }) => {
    try {
      return await getDareToolsAPI()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch DARE tools'
      )
    }
  }
)

/**
 * Fetch DARE tool execution history
 */
export const getDareToolExecutions = createAsyncThunk<
  DareToolExecution[],
  { tool?: string; status?: string } | void
>('dareTools/getDareToolExecutions', async (params, { rejectWithValue }) => {
  try {
    return await getDareToolExecutionsAPI(params || undefined)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to fetch DARE tool executions'
    )
  }
})
