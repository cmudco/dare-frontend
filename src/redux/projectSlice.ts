import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'
import type { Project } from './types/project'
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from './asyncThunks/project'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ProjectState {
  projects: Project[]
  status: RequestStatus
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  status: 'idle',
  error: null,
}

const upsert = (state: ProjectState, project: Project) => {
  const index = state.projects.findIndex((p) => p.id === project.id)
  if (index === -1) {
    state.projects.unshift(project)
  } else {
    state.projects[index] = project
  }
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Could not load projects.'
      })
      .addCase(createProject.fulfilled, (state, action) => {
        upsert(state, action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        upsert(state, action.payload)
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload.projectId
        )
      })
  },
})

export const selectProjects = (state: RootState) => state.project.projects
export const selectProjectsStatus = (state: RootState) => state.project.status
export const selectProjectsError = (state: RootState) => state.project.error

export const selectProjectById = createSelector(
  [
    selectProjects,
    (_: RootState, projectId: number | null | undefined) => projectId,
  ],
  (projects, projectId) =>
    projectId == null
      ? undefined
      : projects.find((project) => project.id === projectId)
)

export const selectProjectConversations = createSelector(
  [
    (state: RootState) => state.conversation.conversations,
    (_: RootState, projectId: number) => projectId,
  ],
  (conversations, projectId) =>
    conversations.filter((conversation) => conversation.project === projectId)
)

export default projectSlice.reducer
