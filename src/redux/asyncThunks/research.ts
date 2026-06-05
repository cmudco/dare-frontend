import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  approveResearchStagingItemAPI,
  archiveResearchProjectAPI,
  cancelResearchAgentRunAPI,
  createResearchAgentRunAPI,
  createResearchProjectAPI,
  createResearchSourceAPI,
  createResearchStagingItemAPI,
  deleteResearchProjectAPI,
  deleteResearchSourceAPI,
  getResearchAgentRunAPI,
  getResearchAgentRunsAPI,
  getResearchKnowledgeItemsAPI,
  getResearchMetadataAPI,
  getResearchProjectAPI,
  getResearchProjectsAPI,
  getResearchSourcesAPI,
  getResearchSoulFilesAPI,
  getResearchSoulFileVersionsAPI,
  getResearchStagingItemsAPI,
  markResearchStagingItemLaterAPI,
  rejectResearchStagingItemAPI,
  restoreResearchStagingItemAPI,
  restoreResearchProjectAPI,
  selectResearchProjectSoulFileAPI,
  updateResearchSoulFileAPI,
  createResearchSoulFileAPI,
  updateResearchProjectAPI,
} from '@/api/research'
import type {
  ResearchAgentRunDraft,
  ResearchProjectSoulFileSelection,
  ResearchProjectMutation,
  ResearchProjectUpdateMutation,
  ResearchReviewReasonPayload,
  ResearchSoulFileDraft,
  ResearchSoulFileUpdateMutation,
  ResearchSourceDraft,
  ResearchStagingItemDraft,
} from '@/redux/types/research'

const createSourcesForProject = async (
  projectId: number,
  sources: ResearchSourceDraft[]
) => {
  if (sources.length === 0) return []
  return await Promise.all(
    sources.map((source) => createResearchSourceAPI(projectId, source))
  )
}

export const getResearchMetadata = createAsyncThunk(
  'research/getResearchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      return await getResearchMetadataAPI()
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

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

export const createResearchProjectWithSources = createAsyncThunk(
  'research/createResearchProjectWithSources',
  async (
    { project, sources }: ResearchProjectMutation,
    { rejectWithValue }
  ) => {
    try {
      const createdProject = await createResearchProjectAPI(project)
      const createdSources = await createSourcesForProject(
        createdProject.id,
        sources
      )
      const refreshedProject = await getResearchProjectAPI(createdProject.id)
      return { project: refreshedProject, sources: createdSources }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateResearchProjectWithSources = createAsyncThunk(
  'research/updateResearchProjectWithSources',
  async (
    { id, project, sources }: ResearchProjectUpdateMutation,
    { rejectWithValue }
  ) => {
    try {
      await updateResearchProjectAPI(id, project)
      const createdSources = await createSourcesForProject(id, sources)
      const refreshedProject = await getResearchProjectAPI(id)
      return { project: refreshedProject, sources: createdSources }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const archiveResearchProject = createAsyncThunk(
  'research/archiveResearchProject',
  async (id: number, { rejectWithValue }) => {
    try {
      return await archiveResearchProjectAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const restoreResearchProject = createAsyncThunk(
  'research/restoreResearchProject',
  async (id: number, { rejectWithValue }) => {
    try {
      return await restoreResearchProjectAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteResearchProject = createAsyncThunk(
  'research/deleteResearchProject',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteResearchProjectAPI(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const selectResearchProjectSoulFile = createAsyncThunk(
  'research/selectResearchProjectSoulFile',
  async (
    { projectId, soulFileId }: ResearchProjectSoulFileSelection,
    { rejectWithValue }
  ) => {
    try {
      return await selectResearchProjectSoulFileAPI(projectId, soulFileId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchSoulFiles = createAsyncThunk(
  'research/getResearchSoulFiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getResearchSoulFilesAPI()
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createResearchSoulFile = createAsyncThunk(
  'research/createResearchSoulFile',
  async (soulFile: ResearchSoulFileDraft, { rejectWithValue }) => {
    try {
      return await createResearchSoulFileAPI(soulFile)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateResearchSoulFile = createAsyncThunk(
  'research/updateResearchSoulFile',
  async (
    { id, soulFile }: ResearchSoulFileUpdateMutation,
    { rejectWithValue }
  ) => {
    try {
      return await updateResearchSoulFileAPI(id, soulFile)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchSoulFileVersions = createAsyncThunk(
  'research/getResearchSoulFileVersions',
  async (soulFileId: number, { rejectWithValue }) => {
    try {
      const response = await getResearchSoulFileVersionsAPI(soulFileId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchSources = createAsyncThunk(
  'research/getResearchSources',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await getResearchSourcesAPI(projectId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteResearchSource = createAsyncThunk(
  'research/deleteResearchSource',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteResearchSourceAPI(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchStagingItems = createAsyncThunk(
  'research/getResearchStagingItems',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await getResearchStagingItemsAPI(projectId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createResearchStagingItem = createAsyncThunk(
  'research/createResearchStagingItem',
  async (item: ResearchStagingItemDraft, { rejectWithValue }) => {
    try {
      return await createResearchStagingItemAPI(item)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const approveResearchStagingItem = createAsyncThunk(
  'research/approveResearchStagingItem',
  async (id: number, { rejectWithValue }) => {
    try {
      return await approveResearchStagingItemAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const rejectResearchStagingItem = createAsyncThunk(
  'research/rejectResearchStagingItem',
  async ({ id, reason }: ResearchReviewReasonPayload, { rejectWithValue }) => {
    try {
      return await rejectResearchStagingItemAPI(id, reason)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const markResearchStagingItemLater = createAsyncThunk(
  'research/markResearchStagingItemLater',
  async ({ id, reason }: ResearchReviewReasonPayload, { rejectWithValue }) => {
    try {
      return await markResearchStagingItemLaterAPI(id, reason)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const restoreResearchStagingItem = createAsyncThunk(
  'research/restoreResearchStagingItem',
  async (id: number, { rejectWithValue }) => {
    try {
      return await restoreResearchStagingItemAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchKnowledgeItems = createAsyncThunk(
  'research/getResearchKnowledgeItems',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await getResearchKnowledgeItemsAPI(projectId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchAgentRuns = createAsyncThunk(
  'research/getResearchAgentRuns',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await getResearchAgentRunsAPI(projectId)
      return response.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const getResearchAgentRun = createAsyncThunk(
  'research/getResearchAgentRun',
  async (id: number, { rejectWithValue }) => {
    try {
      return await getResearchAgentRunAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createResearchAgentRun = createAsyncThunk(
  'research/createResearchAgentRun',
  async (run: ResearchAgentRunDraft, { rejectWithValue }) => {
    try {
      return await createResearchAgentRunAPI(run)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const cancelResearchAgentRun = createAsyncThunk(
  'research/cancelResearchAgentRun',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cancelResearchAgentRunAPI(id)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
