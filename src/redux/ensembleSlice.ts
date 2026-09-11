import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createEnsemblePresetAPI,
  deleteEnsemblePresetAPI,
  getEnsembleDefaultsAPI,
  getEnsemblePresetsAPI,
  type EnsembleDefaults,
} from '@/api/ensemble'
import type { EnsemblePreset } from './types/conversation'
import { userLogin, userLogout } from './asyncThunks/user'

/**
 * What the briefs editor needs from the server: the default instructions
 * each role runs under, and the person's saved presets. The briefs being
 * composed for the next turn live on `conversation.ensemble`.
 */
interface EnsembleState {
  defaults: EnsembleDefaults | null
  presets: EnsemblePreset[]
  loaded: boolean
  saving: boolean
  loading: boolean
  deleting: boolean
  error: string | null
  fetchRequestId: string | null
  saveRequestId: string | null
  deleteRequestId: string | null
}

const initialState: EnsembleState = {
  defaults: null,
  presets: [],
  loaded: false,
  saving: false,
  loading: false,
  deleting: false,
  error: null,
  fetchRequestId: null,
  saveRequestId: null,
  deleteRequestId: null,
}

export const fetchEnsembleBriefs = createAsyncThunk(
  'ensemble/fetchBriefs',
  async () => {
    const [defaults, presets] = await Promise.all([
      getEnsembleDefaultsAPI(),
      getEnsemblePresetsAPI(),
    ])
    return { defaults, presets: presets.results }
  }
)

export const saveEnsemblePreset = createAsyncThunk(
  'ensemble/savePreset',
  async (preset: Omit<EnsemblePreset, 'id'>) =>
    await createEnsemblePresetAPI(preset)
)

export const removeEnsemblePreset = createAsyncThunk(
  'ensemble/removePreset',
  async (id: number) => {
    await deleteEnsemblePresetAPI(id)
    return id
  }
)

const ensembleSlice = createSlice({
  name: 'ensemble',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogout.pending, () => initialState)
      .addCase(userLogin.pending, () => initialState)
      .addCase(fetchEnsembleBriefs.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.fetchRequestId = action.meta.requestId
      })
      .addCase(fetchEnsembleBriefs.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return
        state.defaults = action.payload.defaults
        state.presets = action.payload.presets
        state.loaded = true
        state.loading = false
        state.fetchRequestId = null
      })
      .addCase(fetchEnsembleBriefs.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return
        state.loading = false
        state.fetchRequestId = null
        state.error =
          action.error.message ?? 'Could not load briefs. Please retry.'
      })
      .addCase(saveEnsemblePreset.pending, (state, action) => {
        state.saving = true
        state.error = null
        state.saveRequestId = action.meta.requestId
      })
      .addCase(saveEnsemblePreset.fulfilled, (state, action) => {
        if (state.saveRequestId !== action.meta.requestId) return
        state.saving = false
        state.saveRequestId = null
        state.presets = [
          ...state.presets.filter((p) => p.id !== action.payload.id),
          action.payload,
        ].sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(saveEnsemblePreset.rejected, (state, action) => {
        if (state.saveRequestId !== action.meta.requestId) return
        state.saving = false
        state.saveRequestId = null
        state.error = action.error.message ?? 'Could not save this preset.'
      })
      .addCase(removeEnsemblePreset.pending, (state, action) => {
        state.deleting = true
        state.error = null
        state.deleteRequestId = action.meta.requestId
      })
      .addCase(removeEnsemblePreset.fulfilled, (state, action) => {
        if (state.deleteRequestId !== action.meta.requestId) return
        state.deleting = false
        state.deleteRequestId = null
        state.presets = state.presets.filter((p) => p.id !== action.payload)
      })
      .addCase(removeEnsemblePreset.rejected, (state, action) => {
        if (state.deleteRequestId !== action.meta.requestId) return
        state.deleting = false
        state.deleteRequestId = null
        state.error = action.error.message ?? 'Could not delete this preset.'
      })
  },
})

export default ensembleSlice.reducer
