import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  createProjectAPI,
  deleteProjectAPI,
  getProjectsAPI,
  updateProjectAPI,
} from '@/api/projects'
import { updateConversationAPI } from '@/api/conversation'
import type {
  DeleteProjectRequest,
  MoveConversationsRequest,
  MoveConversationsResult,
  Project,
  ProjectDraft,
  ProjectUpdate,
} from '../types/project'

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>('project/fetchProjects', async (_, thunkAPI) => {
  try {
    return await getProjectsAPI()
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const createProject = createAsyncThunk<
  Project,
  ProjectDraft,
  { rejectValue: string }
>('project/createProject', async (draft, thunkAPI) => {
  try {
    return await createProjectAPI(draft)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const updateProject = createAsyncThunk<
  Project,
  { projectId: number; update: ProjectUpdate },
  { rejectValue: string }
>('project/updateProject', async ({ projectId, update }, thunkAPI) => {
  try {
    return await updateProjectAPI(projectId, update)
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

export const deleteProject = createAsyncThunk<
  DeleteProjectRequest,
  DeleteProjectRequest,
  { rejectValue: string }
>('project/deleteProject', async (request, thunkAPI) => {
  try {
    await deleteProjectAPI(request.projectId, request.deleteConversations)
    return request
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})

// Moves are independent PATCHes: report partial failure instead of hiding the
// chats that did move. Counts are server-derived, so membership changes refetch them.
export const moveConversationsToProject = createAsyncThunk<
  MoveConversationsResult,
  MoveConversationsRequest
>(
  'project/moveConversations',
  async ({ conversationIds, projectId }, thunkAPI) => {
    const results = await Promise.allSettled(
      conversationIds.map((conversationId) =>
        updateConversationAPI(conversationId, { project: projectId })
      )
    )
    thunkAPI.dispatch(fetchProjects())
    return {
      moved: results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value),
      failedCount: results.filter((result) => result.status === 'rejected')
        .length,
    }
  }
)
