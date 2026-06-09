import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  createResearchProject,
  getResearchProject,
  getResearchProjects,
  updateResearchProject,
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
    // Delete stays client-side until its backend endpoint lands (a later
    // research-backend increment); list + create + edit are wired to the API.
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
      .addCase(updateResearchProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (p) => p.id === action.payload.id
        )
        if (index !== -1) {
          // Merge: the PATCH response is the list shape; keep the nested
          // workspace arrays (runs, reviewItems, …) already in the store.
          state.projects[index] = {
            ...state.projects[index],
            ...action.payload,
          }
        } else {
          state.projects.unshift(action.payload)
        }
      })
      .addCase(updateResearchProject.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { deleteResearchProject } = researchSlice.actions

export default researchSlice.reducer
