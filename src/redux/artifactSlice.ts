import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Artifact, ArtifactStatus } from './types/artifact'
import { initialArtifactState } from './types/artifact'
import { pauseArtifact, updateArtifactStatus } from './asyncThunks/artifact'

export const artifactSlice = createSlice({
  name: 'artifact',
  initialState: initialArtifactState,
  reducers: {
    // Initialize a new artifact
    initArtifact(
      state,
      action: PayloadAction<{
        id: number
        title: string
        outline: string
        estimatedSections: number
      }>
    ) {
      const { id, title, outline, estimatedSections } = action.payload
      const key = String(id)
      state.artifacts[key] = {
        id,
        title,
        outline,
        content: '',
        artifactType: 'document',
        status: 'generating',
        estimatedSections,
        currentSection: 0,
        progress: 0,
        version: 1,
        isModification: false,
      }
      state.activeArtifactId = id
      state.sidecarOpen = true
    },

    // Initialize modification of an existing artifact
    // Creates a NEW artifact entry with complete data from the event
    // No longer depends on parent artifact being in Redux state
    initModifyArtifact(
      state,
      action: PayloadAction<{
        id: number // NEW artifact ID
        parentArtifactId: number // Original artifact ID
        artifactGroupId: number
        title: string
        outline: string // New sections only
        fullOutline: string // Complete outline
        totalEstimatedSections: number // Total sections
        currentSection: number // Inherited from parent
        existingContent: string // Content from parent
        newVersion: number
      }>
    ) {
      const {
        id,
        parentArtifactId,
        artifactGroupId,
        title,
        fullOutline,
        totalEstimatedSections,
        currentSection,
        existingContent,
        newVersion,
      } = action.payload
      const key = String(id)
      const parentKey = String(parentArtifactId)
      const parentArtifact = state.artifacts[parentKey]

      // Create NEW artifact entry with COMPLETE data from event
      state.artifacts[key] = {
        id,
        title,
        outline: fullOutline, // Use complete outline from event
        content: existingContent, // Use content from event, not parent state
        artifactType: parentArtifact?.artifactType || 'document',
        status: 'generating',
        estimatedSections: totalEstimatedSections, // Use total from event
        currentSection: currentSection, // Use value from event
        progress: 0,
        version: newVersion,
        isModification: true,
        parentArtifactId,
        artifactGroupId,
        language: parentArtifact?.language,
      }

      // Set the new artifact as active
      state.activeArtifactId = id
      state.sidecarOpen = true
    },

    // Append content chunk to artifact
    appendContent(
      state,
      action: PayloadAction<{ artifactId: number; chunk: string }>
    ) {
      const { artifactId, chunk } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.content += chunk
      }
    },

    // Update artifact progress
    updateProgress(
      state,
      action: PayloadAction<{ artifactId: number; progress: number }>
    ) {
      const { artifactId, progress } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.progress = progress
      }
    },

    // Update current section
    setCurrentSection(
      state,
      action: PayloadAction<{ artifactId: number; section: number }>
    ) {
      const { artifactId, section } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.currentSection = section
      }
    },

    // Update artifact status
    setStatus(
      state,
      action: PayloadAction<{ artifactId: number; status: ArtifactStatus }>
    ) {
      const { artifactId, status } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.status = status
      }
    },

    // Set sections remaining (for paused state)
    setSectionsRemaining(
      state,
      action: PayloadAction<{
        artifactId: number
        sectionsRemaining: number
      }>
    ) {
      const { artifactId, sectionsRemaining } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        // Calculate current section from remaining
        artifact.currentSection = artifact.estimatedSections - sectionsRemaining
      }
    },

    // Set word count
    setWordCount(
      state,
      action: PayloadAction<{ artifactId: number; wordCount: number }>
    ) {
      const { artifactId, wordCount } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.wordCount = wordCount
      }
    },

    // Set artifact error
    setArtifactError(
      state,
      action: PayloadAction<{ artifactId?: number; error: string }>
    ) {
      const { artifactId, error } = action.payload
      const key = artifactId !== undefined ? String(artifactId) : undefined
      if (key && state.artifacts[key]) {
        state.artifacts[key].status = 'error'
        state.artifacts[key].error = error
      }
    },

    // Sidecar controls
    openSidecar(state) {
      state.sidecarOpen = true
    },

    closeSidecar(state) {
      state.sidecarOpen = false
    },

    toggleSidecar(state) {
      state.sidecarOpen = !state.sidecarOpen
    },

    // Set active artifact
    setActiveArtifact(state, action: PayloadAction<number | null>) {
      state.activeArtifactId = action.payload
      if (action.payload) {
        state.sidecarOpen = true
      }
    },

    // Toggle artifacts mode enabled
    setArtifactsEnabled(state, action: PayloadAction<boolean>) {
      state.artifactsEnabled = action.payload
    },

    toggleArtifactsEnabled(state) {
      state.artifactsEnabled = !state.artifactsEnabled
    },

    // Load artifact from API response
    loadArtifact(state, action: PayloadAction<Artifact>) {
      state.artifacts[String(action.payload.id)] = action.payload
    },

    // Load multiple artifacts
    loadArtifacts(state, action: PayloadAction<Artifact[]>) {
      action.payload.forEach((artifact) => {
        state.artifacts[String(artifact.id)] = artifact
      })
    },

    // Clear artifact
    clearArtifact(state, action: PayloadAction<number>) {
      const key = String(action.payload)
      delete state.artifacts[key]
      if (state.activeArtifactId === action.payload) {
        state.activeArtifactId = null
        state.sidecarOpen = false
      }
    },

    // Clear all artifacts for a conversation
    clearAllArtifacts(state) {
      state.artifacts = {}
      state.activeArtifactId = null
      state.sidecarOpen = false
    },

    // Reset artifact state (on logout or conversation change)
    resetArtifactState(state) {
      state.artifacts = {}
      state.activeArtifactId = null
      state.sidecarOpen = false
      state.artifactsEnabled = false
      state.pausingArtifactId = null
      state.statusUpdateError = null
    },

    // Clear status update error
    clearStatusUpdateError(state) {
      state.statusUpdateError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // pauseArtifact
      .addCase(pauseArtifact.pending, (state, action) => {
        state.pausingArtifactId = action.meta.arg.artifactId
        state.statusUpdateError = null
      })
      .addCase(pauseArtifact.fulfilled, (state) => {
        state.pausingArtifactId = null
      })
      .addCase(pauseArtifact.rejected, (state, action) => {
        state.pausingArtifactId = null
        state.statusUpdateError = action.payload as string
      })
      // updateArtifactStatus
      .addCase(updateArtifactStatus.pending, (state) => {
        state.statusUpdateError = null
      })
      .addCase(updateArtifactStatus.fulfilled, () => {
        // Status already updated via dispatch in thunk
      })
      .addCase(updateArtifactStatus.rejected, (state, action) => {
        state.statusUpdateError = action.payload as string
      })
  },
})

export const {
  initArtifact,
  initModifyArtifact,
  appendContent,
  updateProgress,
  setCurrentSection,
  setStatus,
  setSectionsRemaining,
  setWordCount,
  setArtifactError,
  openSidecar,
  closeSidecar,
  toggleSidecar,
  setActiveArtifact,
  setArtifactsEnabled,
  toggleArtifactsEnabled,
  loadArtifact,
  loadArtifacts,
  clearArtifact,
  clearAllArtifacts,
  resetArtifactState,
  clearStatusUpdateError,
} = artifactSlice.actions

export default artifactSlice.reducer
