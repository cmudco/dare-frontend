import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  addThesisSourceLinkAPI,
  cancelAgentRunAPI,
  createResearchProjectAPI,
  downloadOkfBundleAPI,
  getAgentRunAPI,
  getResearchOkfBundleAPI,
  getResearchProjectAPI,
  getResearchProjectsAPI,
  getThesisSourceLinksAPI,
  removeThesisSourceLinkAPI,
  updateResearchProjectAPI,
} from '@/api/research'
import type {
  CreateResearchProjectPayload,
  UpdateResearchProjectPayload,
} from '@/redux/types/research'

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

export const getAgentRun = createAsyncThunk(
  'research/getAgentRun',
  async (runId: number, { rejectWithValue }) => {
    try {
      return await getAgentRunAPI(runId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const cancelAgentRun = createAsyncThunk(
  'research/cancelAgentRun',
  async (runId: number, { rejectWithValue }) => {
    try {
      return await cancelAgentRunAPI(runId)
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

export const updateResearchProject = createAsyncThunk(
  'research/updateResearchProject',
  async (
    { id, changes }: { id: number; changes: UpdateResearchProjectPayload },
    { rejectWithValue }
  ) => {
    try {
      return await updateResearchProjectAPI(id, changes)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchOkfBundle = createAsyncThunk(
  'research/getResearchOkfBundle',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await getResearchOkfBundleAPI(projectId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const downloadOkfBundle = createAsyncThunk(
  'research/downloadOkfBundle',
  async (projectId: number, { rejectWithValue }) => {
    try {
      await downloadOkfBundleAPI(projectId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getThesisSourceLinks = createAsyncThunk(
  'research/getThesisSourceLinks',
  async (thesisId: number, { rejectWithValue }) => {
    try {
      const links = await getThesisSourceLinksAPI(thesisId)
      return { thesisId, links }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const addThesisSourceLink = createAsyncThunk(
  'research/addThesisSourceLink',
  async (
    {
      thesisId,
      sourceId,
      stance,
    }: { thesisId: number; sourceId: number; stance?: string },
    { rejectWithValue }
  ) => {
    try {
      await addThesisSourceLinkAPI(thesisId, sourceId, stance)
      const links = await getThesisSourceLinksAPI(thesisId)
      return { thesisId, links }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const removeThesisSourceLink = createAsyncThunk(
  'research/removeThesisSourceLink',
  async (
    { thesisId, sourceId }: { thesisId: number; sourceId: number },
    { rejectWithValue }
  ) => {
    try {
      await removeThesisSourceLinkAPI(thesisId, sourceId)
      return { thesisId, sourceId }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
