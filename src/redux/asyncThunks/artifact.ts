import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  createSnippetArtifactAPI,
  getArtifactsAPI,
  getArtifactAPI,
  updateArtifactContentAPI,
} from '@/api/artifacts'
import {
  loadArtifacts,
  openArtifactInSidecar,
  setActiveArtifact,
} from '../artifactSlice'
import type { AppDispatch, RootState } from '../store'
import type {
  Artifact,
  ArtifactSidecarTab,
  SnippetArtifactRequest,
} from '../types/artifact'

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

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

/**
 * Save edited code as the artifact's next version and show it.
 */
export const saveArtifactContent = createAsyncThunk<
  Artifact,
  { artifactId: number; content: string },
  { dispatch: AppDispatch; state: RootState; rejectValue: string }
>(
  'artifact/saveArtifactContent',
  async ({ artifactId, content }, { rejectWithValue, dispatch }) => {
    try {
      const artifact = await updateArtifactContentAPI(artifactId, content)
      dispatch(loadArtifacts([artifact]))
      dispatch(setActiveArtifact(artifact.id))
      return artifact
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Could not save your edits'))
    }
  }
)

/**
 * Open a chat code block as an artifact in the sidecar on the given view.
 */
export const openSnippetArtifact = createAsyncThunk<
  Artifact,
  {
    conversationId: string
    request: SnippetArtifactRequest
    tab: ArtifactSidecarTab
  },
  { dispatch: AppDispatch; state: RootState; rejectValue: string }
>(
  'artifact/openSnippetArtifact',
  async ({ conversationId, request, tab }, { rejectWithValue, dispatch }) => {
    try {
      const artifact = await createSnippetArtifactAPI(conversationId, request)
      dispatch(loadArtifacts([artifact]))
      dispatch(openArtifactInSidecar({ artifactId: artifact.id, tab }))
      return artifact
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Could not open this code in the editor')
      )
    }
  }
)
