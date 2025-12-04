import { createAsyncThunk } from '@reduxjs/toolkit'
import { updateArtifactStatusAPI } from '@/api/artifacts'
import { setStatus } from '../artifactSlice'
import type { AppDispatch, RootState } from '../store'
import type { ArtifactStatus } from '../types/artifact'

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
  { artifactId: string },
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
  { artifactId: string; status: ArtifactStatus },
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
