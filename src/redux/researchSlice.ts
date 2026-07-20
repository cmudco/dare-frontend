import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  addThesisSourceLink,
  cancelAgentRun,
  createResearchProject,
  getAgentRun,
  getResearchOkfBundle,
  getResearchProject,
  getResearchProjects,
  getThesisSourceLinks,
  removeThesisSourceLink,
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
  currentRun: null,
  okfBundle: null,
  okfBundleLoading: false,
  okfBundleError: null,
  thesisSourceLinks: {},
  thesisSourceLinksLoading: false,
  thesisSourceLinksError: null,
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
    // Reset the run-details slot when leaving the page, so opening another run
    // never flashes the previous one.
    clearCurrentRun(state) {
      state.currentRun = null
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
      .addCase(getAgentRun.fulfilled, (state, action) => {
        state.currentRun = action.payload
      })
      .addCase(cancelAgentRun.fulfilled, (state, action) => {
        state.currentRun = action.payload
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
      .addCase(getResearchOkfBundle.pending, (state) => {
        state.okfBundleLoading = true
        state.okfBundleError = null
      })
      .addCase(getResearchOkfBundle.fulfilled, (state, action) => {
        state.okfBundleLoading = false
        state.okfBundle = action.payload
      })
      .addCase(getResearchOkfBundle.rejected, (state, action) => {
        state.okfBundleLoading = false
        state.okfBundleError = action.payload as string
      })
      .addCase(getThesisSourceLinks.pending, (state) => {
        state.thesisSourceLinksLoading = true
        state.thesisSourceLinksError = null
      })
      .addCase(getThesisSourceLinks.fulfilled, (state, action) => {
        state.thesisSourceLinksLoading = false
        state.thesisSourceLinks[action.payload.thesisId] = action.payload.links
      })
      .addCase(getThesisSourceLinks.rejected, (state, action) => {
        state.thesisSourceLinksLoading = false
        state.thesisSourceLinksError = action.payload as string
      })
      .addCase(addThesisSourceLink.fulfilled, (state, action) => {
        state.thesisSourceLinks[action.payload.thesisId] = action.payload.links
      })
      .addCase(addThesisSourceLink.rejected, (state, action) => {
        state.thesisSourceLinksError = action.payload as string
      })
      .addCase(removeThesisSourceLink.fulfilled, (state, action) => {
        const { thesisId, sourceId } = action.payload
        const links = state.thesisSourceLinks[thesisId]
        if (links) {
          state.thesisSourceLinks[thesisId] = links.filter(
            (l) => l.sourceId !== sourceId
          )
        }
      })
      .addCase(removeThesisSourceLink.rejected, (state, action) => {
        state.thesisSourceLinksError = action.payload as string
      })
  },
})

export const { deleteResearchProject, clearCurrentRun } = researchSlice.actions

export default researchSlice.reducer
