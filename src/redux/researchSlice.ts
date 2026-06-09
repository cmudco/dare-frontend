import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  createResearchProject,
  getResearchProject,
  getResearchProjects,
} from '@/redux/asyncThunks/research'
import type { ResearchProject, ResearchState } from './types/research'

const upsertProject = (
  projects: ResearchProject[],
  project: ResearchProject
) => {
  const index = projects.findIndex((p) => p.id === project.id)
  if (index !== -1) {
    projects[index] = project
  } else {
    projects.unshift(project)
  }
}

const initialState: ResearchState = {
  projects: [],
  loading: false,
  error: null,
}

const researchSlice = createSlice({
  name: 'research',
  initialState,
  reducers: {
    // Edit and delete stay client-side until their backend endpoints land
    // (a later research-backend increment); list + create are wired to the API.
    updateResearchProject(state, action: PayloadAction<ResearchProject>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteResearchProject(state, action: PayloadAction<number>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getResearchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getResearchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(getResearchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createResearchProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createResearchProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.unshift(action.payload)
      })
      .addCase(createResearchProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getResearchProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getResearchProject.fulfilled, (state, action) => {
        state.loading = false
        upsertProject(state.projects, action.payload)
      })
      .addCase(getResearchProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { updateResearchProject, deleteResearchProject } =
  researchSlice.actions

export default researchSlice.reducer
