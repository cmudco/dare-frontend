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
  async ({ conversationId }, { rejectWithValue, dispatch }) => {
    try {
      const artifacts = await getArtifactsAPI(conversationId)
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
