import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createEnsemblePresetAPI,
  deleteEnsemblePresetAPI,
  getEnsembleDefaultsAPI,
  getEnsemblePresetsAPI,
  type EnsembleDefaults,
} from '@/api/ensemble'
import type { EnsemblePreset } from './types/conversation'

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
}

const initialState: EnsembleState = {
  defaults: null,
  presets: [],
  loaded: false,
  saving: false,
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
      .addCase(fetchEnsembleBriefs.fulfilled, (state, action) => {
        state.defaults = action.payload.defaults
        state.presets = action.payload.presets
        state.loaded = true
      })
      .addCase(saveEnsemblePreset.pending, (state) => {
        state.saving = true
      })
      .addCase(saveEnsemblePreset.fulfilled, (state, action) => {
        state.saving = false
        state.presets = [
          ...state.presets.filter((p) => p.name !== action.payload.name),
          action.payload,
        ].sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(saveEnsemblePreset.rejected, (state) => {
        state.saving = false
      })
      .addCase(removeEnsemblePreset.fulfilled, (state, action) => {
        state.presets = state.presets.filter((p) => p.id !== action.payload)
      })
  },
})

export default ensembleSlice.reducer
