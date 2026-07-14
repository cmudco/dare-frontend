import { createAsyncThunk } from '@reduxjs/toolkit'
import { getArtifactsAPI, getArtifactAPI } from '@/api/artifacts'
import { loadArtifacts } from '../artifactSlice'
import type { AppDispatch, RootState } from '../store'
import type { Artifact } from '../types/artifact'

/**
 * Fetch all artifacts for a conversation
 */
export const fetchConversationArtifacts = createAsyncThunk<
  Artifact[],
  { conversationId: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'artifact/fetchConversationArtifacts',
  async ({ conversationId }, { rejectWithValue, dispatch, getState }) => {
    try {
      const artifacts = await getArtifactsAPI(conversationId)
      // The list endpoint omits `content`; never clobber content that
      // streaming or a detail fetch already put in the store.
      const existing = getState().artifact.artifacts
      const merged = artifacts.map((artifact) => {
        const prev = existing[String(artifact.id)]
        return prev?.content && artifact.content === undefined
          ? { ...artifact, content: prev.content }
          : artifact
      })
      dispatch(loadArtifacts(merged))
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
 * Fetch a single artifact by ID
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
