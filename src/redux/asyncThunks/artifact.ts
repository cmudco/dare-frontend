import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getArtifactsAPI,
  getArtifactAPI,
  updateArtifactStatusAPI,
  updateArtifactContentAPI,
} from '@/api/artifacts'
import {
  setStatus,
  loadArtifacts,
  loadArtifact,
  setActiveArtifact,
} from '../artifactSlice'
import type { AppDispatch, RootState } from '../store'
import type { ArtifactStatus, Artifact } from '../types/artifact'

/**
 * Fetch all artifacts for a conversation
 *
 * Used by the artifact history dropdown to show all artifacts
 * in the current conversation with version grouping.
 */
export const fetchConversationArtifacts = createAsyncThunk<
  Artifact[],
  { conversationId: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'artifact/fetchConversationArtifacts',
  async ({ conversationId }, { rejectWithValue, dispatch }) => {
    try {
      const artifacts = await getArtifactsAPI(conversationId)

      // Load all artifacts into Redux state
      dispatch(loadArtifacts(artifacts))

      return artifacts
    } catch (error) {
      console.error('Failed to fetch conversation artifacts:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to fetch conversation artifacts'
      )
    }
  }
)

/**
 * Fetch a single artifact by ID with full content
 */
export const fetchArtifactById = createAsyncThunk<
  Artifact,
  { conversationId: string; artifactId: number },
  { dispatch: AppDispatch; state: RootState }
>(
  'artifact/fetchArtifactById',
  async ({ conversationId, artifactId }, { rejectWithValue, dispatch }) => {
    try {
      const artifact = await getArtifactAPI(conversationId, artifactId)

      // Load artifact into Redux state
      dispatch(loadArtifacts([artifact]))

      return artifact
    } catch (error) {
      console.error('Failed to fetch artifact:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch artifact'
      )
    }
  }
)

/**
 * Pause artifact generation via REST API
 *
 * Uses REST instead of WebSocket because the WebSocket receive handler
 * is blocked during artifact streaming (single-threaded message processing).
 * The REST endpoint updates the DB, and the generation loop checks the DB
 * after each section completes.
 */
export const pauseArtifact = createAsyncThunk<
  void,
  { artifactId: number },
  { dispatch: AppDispatch; state: RootState }
>('artifact/pause', async ({ artifactId }, { rejectWithValue, dispatch }) => {
  try {
    await updateArtifactStatusAPI(artifactId, 'paused')
    // Update local state immediately for responsive UI
    dispatch(
      setStatus({
        artifactId,
        status: 'paused',
      })
    )
  } catch (error) {
    console.error('Failed to pause artifact:', error)
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to pause artifact'
    )
  }
})

/**
 * Update artifact status via REST API
 *
 * Generic status update for any artifact status change.
 */
export const updateArtifactStatus = createAsyncThunk<
  void,
  { artifactId: number; status: ArtifactStatus },
  { dispatch: AppDispatch; state: RootState }
>(
  'artifact/updateStatus',
  async ({ artifactId, status }, { rejectWithValue, dispatch }) => {
    try {
      await updateArtifactStatusAPI(artifactId, status)
      dispatch(
        setStatus({
          artifactId,
          status,
        })
      )
    } catch (error) {
      console.error('Failed to update artifact status:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to update artifact status'
      )
    }
  }
)

/**
 * Update artifact content via REST API (manual edit)
 *
 * Creates a new version with the updated content to preserve history.
 * Sets the new version as the active artifact.
 */
export const updateArtifactContent = createAsyncThunk<
  Artifact,
  { artifactId: number; content: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'artifact/updateContent',
  async ({ artifactId, content }, { rejectWithValue, dispatch }) => {
    try {
      // API returns the new artifact version
      const newArtifact = await updateArtifactContentAPI(artifactId, content)

      // Load new artifact into Redux state
      dispatch(loadArtifact(newArtifact))

      // Set as active artifact to show the new version
      dispatch(setActiveArtifact(newArtifact.id))

      return newArtifact
    } catch (error) {
      console.error('Failed to update artifact content:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to update artifact content'
      )
    }
  }
)
