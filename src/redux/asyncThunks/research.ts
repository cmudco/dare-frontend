import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  createResearchProjectAPI,
  getResearchProjectAPI,
  getResearchProjectsAPI,
} from '@/api/research'
import type { CreateResearchProjectPayload } from '@/redux/types/research'

export const getResearchProjects = createAsyncThunk(
  'research/getResearchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getResearchProjectsAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchProject = createAsyncThunk(
  'research/getResearchProject',
  async (id: number, { rejectWithValue }) => {
    try {
      return await getResearchProjectAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createResearchProject = createAsyncThunk(
  'research/createResearchProject',
  async (payload: CreateResearchProjectPayload, { rejectWithValue }) => {
    try {
      return await createResearchProjectAPI(payload)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
