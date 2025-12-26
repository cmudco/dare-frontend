import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Artifact, ArtifactStatus } from './types/artifact'
import { initialArtifactState } from './types/artifact'
import { pauseArtifact, updateArtifactStatus } from './asyncThunks/artifact'

/**
 * Simplified Artifact Redux Slice
 *
 * Handles artifact state for Claude-like artifact generation.
 * No sections, no outlines, no checkpointing - just direct streaming.
 */

export const artifactSlice = createSlice({
  name: 'artifact',
  initialState: initialArtifactState,
  reducers: {
    // ─────────────────────────────────────────────────────────────────────
    // Core State Management
    // ─────────────────────────────────────────────────────────────────────

    /** Update artifact status */
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

    /** Set word count */
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

    /** Set artifact error */
    setArtifactError(
      state,
      action: PayloadAction<{ artifactId?: number; error: string }>
    ) {
      const { artifactId, error } = action.payload
      if (artifactId) {
        const artifact = state.artifacts[String(artifactId)]
        if (artifact) {
          artifact.status = 'error'
          artifact.error = error
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────────
    // UI Controls
    // ─────────────────────────────────────────────────────────────────────

    openSidecar(state) {
      state.sidecarOpen = true
    },

    closeSidecar(state) {
      state.sidecarOpen = false
    },

    toggleSidecar(state) {
      state.sidecarOpen = !state.sidecarOpen
    },

    setActiveArtifact(state, action: PayloadAction<number | null>) {
      state.activeArtifactId = action.payload
      if (action.payload) {
        state.sidecarOpen = true
      }
    },

    setArtifactsEnabled(state, action: PayloadAction<boolean>) {
      state.artifactsEnabled = action.payload
    },

    toggleArtifactsEnabled(state) {
      state.artifactsEnabled = !state.artifactsEnabled
    },

    // ─────────────────────────────────────────────────────────────────────
    // Data Loading (from API)
    // ─────────────────────────────────────────────────────────────────────

    /** Load single artifact from API */
    loadArtifact(state, action: PayloadAction<Artifact>) {
      state.artifacts[String(action.payload.id)] = action.payload
    },

    /** Load multiple artifacts from API */
    loadArtifacts(state, action: PayloadAction<Artifact[]>) {
      action.payload.forEach((artifact) => {
        state.artifacts[String(artifact.id)] = artifact
      })
    },

    // ─────────────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────────────

    clearArtifact(state, action: PayloadAction<number>) {
      const key = String(action.payload)
      delete state.artifacts[key]
      if (state.activeArtifactId === action.payload) {
        state.activeArtifactId = null
        state.sidecarOpen = false
      }
    },

    clearAllArtifacts(state) {
      state.artifacts = {}
      state.activeArtifactId = null
      state.sidecarOpen = false
    },

    resetArtifactState(state) {
      state.artifacts = {}
      state.activeArtifactId = null
      state.sidecarOpen = false
      state.artifactsEnabled = false
      state.pausingArtifactId = null
      state.statusUpdateError = null
    },

    clearStatusUpdateError(state) {
      state.statusUpdateError = null
    },
  },

  extraReducers: (builder) => {
    builder
      // ─────────────────────────────────────────────────────────────────────
      // Async Thunks (pause artifact, update status)
      // ─────────────────────────────────────────────────────────────────────
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
      .addCase(updateArtifactStatus.pending, (state) => {
        state.statusUpdateError = null
      })
      .addCase(updateArtifactStatus.fulfilled, () => {
        // Status already updated via dispatch in thunk
      })
      .addCase(updateArtifactStatus.rejected, (state, action) => {
        state.statusUpdateError = action.payload as string
      })

      // ─────────────────────────────────────────────────────────────────────
      // Socket.IO Handlers (Simplified System)
      // ─────────────────────────────────────────────────────────────────────

      /**
       * artifact_start: New artifact or version created
       * Sent at the beginning of artifact generation
       */
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId: number
            title: string
            messageId?: number
            version?: number
            isNewVersion?: boolean
            parentArtifactId?: number
            artifactGroupId?: number
          }
        } => action.type === 'socket/artifact_start',
        (state, action) => {
          const {
            artifactId,
            title,
            version,
            isNewVersion,
            parentArtifactId,
            artifactGroupId,
          } = action.payload

          state.artifacts[String(artifactId)] = {
            id: artifactId,
            title,
            outline: '',
            content: '',
            artifactType: 'document',
            status: 'generating',
            estimatedSections: 1,
            currentSection: 0,
            progress: 0,
            version: version || 1,
            isModification: isNewVersion || false,
            parentArtifactId: parentArtifactId ?? null,
            artifactGroupId: artifactGroupId ?? null,
          }
          state.activeArtifactId = artifactId
          state.sidecarOpen = true
        }
      )

      /**
       * artifact_stream: Content streaming update
       * Sends full accumulated content (not chunks)
       */
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId: number
            content: string
            streaming?: boolean
          }
        } => action.type === 'socket/artifact_stream',
        (state, action) => {
          const { artifactId, content } = action.payload
          const artifact = state.artifacts[String(artifactId)]
          if (artifact) {
            artifact.content = content
          }
        }
      )

      /**
       * artifact_complete: Generation finished
       */
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId: number
            content?: string
            wordCount?: number
            messageId?: number
          }
        } => action.type === 'socket/artifact_complete',
        (state, action) => {
          const { artifactId, content, wordCount } = action.payload
          const artifact = state.artifacts[String(artifactId)]
          if (artifact) {
            artifact.status = 'completed'
            artifact.progress = 1.0
            artifact.currentSection = 1
            artifact.estimatedSections = 1
            if (content !== undefined) {
              artifact.content = content
            }
            if (wordCount !== undefined) {
              artifact.wordCount = wordCount
            }
          }
        }
      )

      /**
       * artifact_error: Generation failed
       */
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId?: number
            error?: string
          }
        } => action.type === 'socket/artifact_error',
        (state, action) => {
          const { artifactId, error } = action.payload
          if (artifactId) {
            const artifact = state.artifacts[String(artifactId)]
            if (artifact) {
              artifact.status = 'error'
              artifact.error = error ?? 'Unknown error'
            }
          }
        }
      )
  },
})

// Export only the reducers that are actually used
export const {
  setStatus,
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
