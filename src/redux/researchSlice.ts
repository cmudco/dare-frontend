import { createSlice } from '@reduxjs/toolkit'

import {
  approveResearchStagingItem,
  archiveResearchProject,
  cancelResearchAgentRun,
  createResearchSoulFile,
  createResearchAgentRun,
  createResearchStagingItem,
  createResearchProjectWithSources,
  deleteResearchProject,
  deleteResearchSource,
  getResearchAgentRun,
  getResearchAgentRuns,
  getResearchKnowledgeItems,
  getResearchMetadata,
  getResearchProject,
  getResearchProjects,
  getResearchSources,
  getResearchSoulFiles,
  getResearchSoulFileVersions,
  getResearchStagingItems,
  markResearchStagingItemLater,
  rejectResearchStagingItem,
  restoreResearchStagingItem,
  restoreResearchProject,
  selectResearchProjectSoulFile,
  updateResearchSoulFile,
  updateResearchProjectWithSources,
} from '@/redux/asyncThunks/research'
import type {
  ResearchAgentRun,
  ResearchKnowledgeItem,
  ResearchProject,
  ResearchSoulFile,
  ResearchSoulFileVersion,
  ResearchSource,
  ResearchState,
  ResearchStagingItem,
} from './types/research'
import { ResearchReviewStatus } from '@/utils/constants/research'

const initialState: ResearchState = {
  projects: [],
  sources: [],
  stagingItems: [],
  knowledgeItems: [],
  agentRuns: [],
  soulFiles: [],
  soulFileVersions: [],
  metadata: null,
  isLoading: false,
  isLoadingRuns: false,
  isSaving: false,
  isReviewing: false,
  isSavingSoulFile: false,
  error: null,
  hasLoadedProjects: false,
}

const upsertProject = (
  projects: ResearchProject[],
  project: ResearchProject
) => {
  const index = projects.findIndex((item) => item.id === project.id)
  if (index === -1) {
    projects.unshift(project)
    return
  }
  projects[index] = project
}

const upsertSources = (
  sources: ResearchSource[],
  incoming: ResearchSource[]
) => {
  incoming.forEach((source) => {
    const index = sources.findIndex((item) => item.id === source.id)
    if (index === -1) {
      sources.unshift(source)
      return
    }
    sources[index] = source
  })
}

const upsertStagingItem = (
  stagingItems: ResearchStagingItem[],
  item: ResearchStagingItem
) => {
  const index = stagingItems.findIndex(
    (stagingItem) => stagingItem.id === item.id
  )
  if (index === -1) {
    stagingItems.unshift(item)
    return
  }
  stagingItems[index] = item
}

const upsertKnowledgeItem = (
  knowledgeItems: ResearchKnowledgeItem[],
  item: ResearchKnowledgeItem
) => {
  const index = knowledgeItems.findIndex(
    (knowledgeItem) => knowledgeItem.id === item.id
  )
  if (index === -1) {
    knowledgeItems.unshift(item)
    return
  }
  knowledgeItems[index] = item
}

const upsertAgentRun = (
  agentRuns: ResearchAgentRun[],
  item: ResearchAgentRun
) => {
  const index = agentRuns.findIndex((run) => run.id === item.id)
  if (index === -1) {
    agentRuns.unshift(item)
    return
  }
  agentRuns[index] = item
}

const upsertSoulFile = (
  soulFiles: ResearchSoulFile[],
  item: ResearchSoulFile
) => {
  const index = soulFiles.findIndex((soulFile) => soulFile.id === item.id)
  if (index === -1) {
    soulFiles.unshift(item)
    return
  }
  soulFiles[index] = item
}

const upsertSoulFileVersions = (
  soulFileVersions: ResearchSoulFileVersion[],
  incoming: ResearchSoulFileVersion[]
) => {
  incoming.forEach((version) => {
    const index = soulFileVersions.findIndex((item) => item.id === version.id)
    if (index === -1) {
      soulFileVersions.unshift(version)
      return
    }
    soulFileVersions[index] = version
  })
}

const refreshProjectCounts = (state: ResearchState, projectId: number) => {
  const project = state.projects.find((item) => item.id === projectId)
  if (!project) return

  project.pendingReviewCount = state.stagingItems.filter(
    (item) =>
      item.project === projectId && item.status === ResearchReviewStatus.PENDING
  ).length
  project.approvedCount = state.knowledgeItems.filter(
    (item) => item.project === projectId
  ).length
}

const researchSlice = createSlice({
  name: 'research',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getResearchMetadata.fulfilled, (state, action) => {
        state.metadata = action.payload
      })
      .addCase(getResearchProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getResearchProjects.fulfilled, (state, action) => {
        state.projects = action.payload
        state.isLoading = false
        state.hasLoadedProjects = true
      })
      .addCase(getResearchProjects.rejected, (state, action) => {
        state.isLoading = false
        state.hasLoadedProjects = true
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to load research projects.'
      })
      .addCase(getResearchProject.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload)
      })
      .addCase(createResearchProjectWithSources.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createResearchProjectWithSources.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload.project)
        upsertSources(state.sources, action.payload.sources)
        state.isSaving = false
      })
      .addCase(createResearchProjectWithSources.rejected, (state, action) => {
        state.isSaving = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to create research project.'
      })
      .addCase(updateResearchProjectWithSources.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateResearchProjectWithSources.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload.project)
        upsertSources(state.sources, action.payload.sources)
        state.isSaving = false
      })
      .addCase(updateResearchProjectWithSources.rejected, (state, action) => {
        state.isSaving = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to update research project.'
      })
      .addCase(archiveResearchProject.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload)
      })
      .addCase(restoreResearchProject.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload)
      })
      .addCase(selectResearchProjectSoulFile.pending, (state) => {
        state.isSavingSoulFile = true
        state.error = null
      })
      .addCase(selectResearchProjectSoulFile.fulfilled, (state, action) => {
        upsertProject(state.projects, action.payload)
        state.isSavingSoulFile = false
      })
      .addCase(selectResearchProjectSoulFile.rejected, (state, action) => {
        state.isSavingSoulFile = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to select soul file.'
      })
      .addCase(deleteResearchProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload
        )
        state.sources = state.sources.filter(
          (source) => source.project !== action.payload
        )
        state.stagingItems = state.stagingItems.filter(
          (item) => item.project !== action.payload
        )
        state.knowledgeItems = state.knowledgeItems.filter(
          (item) => item.project !== action.payload
        )
        state.agentRuns = state.agentRuns.filter(
          (run) => run.project !== action.payload
        )
      })
      .addCase(getResearchSoulFiles.fulfilled, (state, action) => {
        state.soulFiles = action.payload
      })
      .addCase(createResearchSoulFile.pending, (state) => {
        state.isSavingSoulFile = true
        state.error = null
      })
      .addCase(createResearchSoulFile.fulfilled, (state, action) => {
        upsertSoulFile(state.soulFiles, action.payload)
        if (action.payload.currentVersion) {
          upsertSoulFileVersions(state.soulFileVersions, [
            action.payload.currentVersion,
          ])
        }
        state.isSavingSoulFile = false
      })
      .addCase(createResearchSoulFile.rejected, (state, action) => {
        state.isSavingSoulFile = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to create soul file.'
      })
      .addCase(updateResearchSoulFile.pending, (state) => {
        state.isSavingSoulFile = true
        state.error = null
      })
      .addCase(updateResearchSoulFile.fulfilled, (state, action) => {
        upsertSoulFile(state.soulFiles, action.payload)
        if (action.payload.currentVersion) {
          upsertSoulFileVersions(state.soulFileVersions, [
            action.payload.currentVersion,
          ])
        }
        state.isSavingSoulFile = false
      })
      .addCase(updateResearchSoulFile.rejected, (state, action) => {
        state.isSavingSoulFile = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to update soul file.'
      })
      .addCase(getResearchSoulFileVersions.fulfilled, (state, action) => {
        const soulFileId = action.meta.arg
        state.soulFileVersions = state.soulFileVersions.filter(
          (version) => version.soulFile !== soulFileId
        )
        state.soulFileVersions.push(...action.payload)
      })
      .addCase(getResearchSources.fulfilled, (state, action) => {
        const projectId = action.meta.arg
        state.sources = state.sources.filter(
          (source) => source.project !== projectId
        )
        state.sources.push(...action.payload)
      })
      .addCase(deleteResearchSource.fulfilled, (state, action) => {
        state.sources = state.sources.filter(
          (source) => source.id !== action.payload
        )
      })
      .addCase(getResearchStagingItems.fulfilled, (state, action) => {
        const projectId = action.meta.arg
        state.stagingItems = state.stagingItems.filter(
          (item) => item.project !== projectId
        )
        state.stagingItems.push(...action.payload)
        refreshProjectCounts(state, projectId)
      })
      .addCase(createResearchStagingItem.pending, (state) => {
        state.isReviewing = true
        state.error = null
      })
      .addCase(createResearchStagingItem.fulfilled, (state, action) => {
        upsertStagingItem(state.stagingItems, action.payload)
        refreshProjectCounts(state, action.payload.project)
        state.isReviewing = false
      })
      .addCase(createResearchStagingItem.rejected, (state, action) => {
        state.isReviewing = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to create staging item.'
      })
      .addCase(approveResearchStagingItem.pending, (state) => {
        state.isReviewing = true
        state.error = null
      })
      .addCase(approveResearchStagingItem.fulfilled, (state, action) => {
        upsertStagingItem(state.stagingItems, action.payload.stagingItem)
        upsertKnowledgeItem(state.knowledgeItems, action.payload.knowledgeItem)
        refreshProjectCounts(state, action.payload.stagingItem.project)
        state.isReviewing = false
      })
      .addCase(approveResearchStagingItem.rejected, (state, action) => {
        state.isReviewing = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to approve staging item.'
      })
      .addCase(rejectResearchStagingItem.pending, (state) => {
        state.isReviewing = true
        state.error = null
      })
      .addCase(rejectResearchStagingItem.fulfilled, (state, action) => {
        upsertStagingItem(state.stagingItems, action.payload)
        refreshProjectCounts(state, action.payload.project)
        state.isReviewing = false
      })
      .addCase(rejectResearchStagingItem.rejected, (state, action) => {
        state.isReviewing = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to reject staging item.'
      })
      .addCase(markResearchStagingItemLater.pending, (state) => {
        state.isReviewing = true
        state.error = null
      })
      .addCase(markResearchStagingItemLater.fulfilled, (state, action) => {
        upsertStagingItem(state.stagingItems, action.payload)
        refreshProjectCounts(state, action.payload.project)
        state.isReviewing = false
      })
      .addCase(markResearchStagingItemLater.rejected, (state, action) => {
        state.isReviewing = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to save staging item for later.'
      })
      .addCase(restoreResearchStagingItem.pending, (state) => {
        state.isReviewing = true
        state.error = null
      })
      .addCase(restoreResearchStagingItem.fulfilled, (state, action) => {
        upsertStagingItem(state.stagingItems, action.payload)
        refreshProjectCounts(state, action.payload.project)
        state.isReviewing = false
      })
      .addCase(restoreResearchStagingItem.rejected, (state, action) => {
        state.isReviewing = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to restore staging item.'
      })
      .addCase(getResearchKnowledgeItems.fulfilled, (state, action) => {
        const projectId = action.meta.arg
        state.knowledgeItems = state.knowledgeItems.filter(
          (item) => item.project !== projectId
        )
        state.knowledgeItems.push(...action.payload)
        refreshProjectCounts(state, projectId)
      })
      .addCase(getResearchAgentRuns.pending, (state) => {
        state.isLoadingRuns = true
        state.error = null
      })
      .addCase(getResearchAgentRuns.fulfilled, (state, action) => {
        const projectId = action.meta.arg
        state.agentRuns = state.agentRuns.filter(
          (run) => run.project !== projectId
        )
        state.agentRuns.push(...action.payload)
        state.isLoadingRuns = false
      })
      .addCase(getResearchAgentRuns.rejected, (state, action) => {
        state.isLoadingRuns = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to load research run logs.'
      })
      .addCase(getResearchAgentRun.fulfilled, (state, action) => {
        upsertAgentRun(state.agentRuns, action.payload)
      })
      .addCase(createResearchAgentRun.pending, (state) => {
        state.isLoadingRuns = true
        state.error = null
      })
      .addCase(createResearchAgentRun.fulfilled, (state, action) => {
        upsertAgentRun(state.agentRuns, action.payload)
        state.isLoadingRuns = false
      })
      .addCase(createResearchAgentRun.rejected, (state, action) => {
        state.isLoadingRuns = false
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to create research run.'
      })
      .addCase(cancelResearchAgentRun.fulfilled, (state, action) => {
        upsertAgentRun(state.agentRuns, action.payload)
      })
  },
})

export default researchSlice.reducer
