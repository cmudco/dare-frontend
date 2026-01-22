import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Artifact, ArtifactType } from './types/artifact'
import { initialArtifactState } from './types/artifact'

/**
 * Artifact Redux Slice
 *
 * Manages artifacts created by DARE tools (charts, diagrams).
 * Clean implementation inspired by Claude Artifacts.
 */

export const artifactSlice = createSlice({
  name: 'artifact',
  initialState: initialArtifactState,
  reducers: {
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
    // Data Management
    // ─────────────────────────────────────────────────────────────────────

    /** Add or update single artifact */
    setArtifact(state, action: PayloadAction<Artifact>) {
      state.artifacts[String(action.payload.id)] = action.payload
    },

    /** Load multiple artifacts (from API) */
    loadArtifacts(state, action: PayloadAction<Artifact[]>) {
      action.payload.forEach((artifact) => {
        state.artifacts[String(artifact.id)] = artifact
      })
    },

    /** Set artifact error */
    setArtifactError(
      state,
      action: PayloadAction<{ artifactId: number; error: string }>
    ) {
      const { artifactId, error } = action.payload
      const artifact = state.artifacts[String(artifactId)]
      if (artifact) {
        artifact.status = 'error'
        artifact.error = error
      }
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

    resetArtifactState() {
      return initialArtifactState
    },
  },

  extraReducers: (builder) => {
    builder
      // ─────────────────────────────────────────────────────────────────────
      // Socket.IO: artifact_created
      // ─────────────────────────────────────────────────────────────────────
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId: number
            messageId?: number
            artifactGroupId?: number
            filename: string
            title: string
            contentType: string
            content: string
            artifactType: ArtifactType
            version?: number
            metadata?: Record<string, unknown>
          }
        } => action.type === 'socket/artifact_created',
        (state, action) => {
          const {
            artifactId,
            messageId,
            artifactGroupId,
            filename,
            title,
            contentType,
            content,
            artifactType,
            version,
            metadata,
          } = action.payload

          state.artifacts[String(artifactId)] = {
            id: artifactId,
            messageId,
            title,
            content,
            artifactType,
            status: 'completed',
            filename,
            contentType,
            version: version ?? 1,
            artifactGroupId,
            sourceTool: metadata?.sourceTool as string | undefined,
            metadata,
          }

          // Auto-open sidecar
          state.activeArtifactId = artifactId
          state.sidecarOpen = true
        }
      )
      // ─────────────────────────────────────────────────────────────────────
      // Socket.IO: artifact_updated
      // ─────────────────────────────────────────────────────────────────────
      .addMatcher(
        (
          action
        ): action is {
          type: string
          payload: {
            artifactId: number
            parentArtifactId: number
            artifactGroupId: number
            messageId?: number
            filename: string
            title: string
            contentType: string
            content: string
            artifactType: ArtifactType
            version: number
            metadata?: Record<string, unknown>
          }
        } => action.type === 'socket/artifact_updated',
        (state, action) => {
          const {
            artifactId,
            parentArtifactId,
            artifactGroupId,
            messageId,
            filename,
            title,
            contentType,
            content,
            artifactType,
            version,
            metadata,
          } = action.payload

          // Store the new version
          state.artifacts[String(artifactId)] = {
            id: artifactId,
            messageId,
            title,
            content,
            artifactType,
            status: 'completed',
            filename,
            contentType,
            version,
            parentArtifactId,
            artifactGroupId,
            sourceTool: metadata?.sourceTool as string | undefined,
            metadata,
          }

          // Auto-switch to the new version
          state.activeArtifactId = artifactId
          state.sidecarOpen = true
        }
      )
  },
})

export const {
  openSidecar,
  closeSidecar,
  toggleSidecar,
  setActiveArtifact,
  setArtifactsEnabled,
  toggleArtifactsEnabled,
  setArtifact,
  loadArtifacts,
  setArtifactError,
  clearArtifact,
  clearAllArtifacts,
  resetArtifactState,
} = artifactSlice.actions

export default artifactSlice.reducer
