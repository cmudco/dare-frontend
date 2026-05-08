import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getMyFeatureFlags, type FeatureFlagMap } from '@/api/featureFlags'

// Bump the version suffix when flag-naming or shape changes, so users that
// cached an empty/old map (e.g. from a deploy where the boot fetch was
// broken) get a fresh fetch instead of "everything off". Old keys are also
// proactively removed below.
const STORAGE_KEY = 'dare:featureFlags:v2'
const LEGACY_STORAGE_KEYS = ['dare:featureFlags']

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface FeatureFlagsState {
  flags: FeatureFlagMap
  status: Status
  error: string | null
}

function loadCached(): FeatureFlagMap {
  try {
    for (const legacy of LEGACY_STORAGE_KEYS) {
      try {
        localStorage.removeItem(legacy)
      } catch {
        // ignore — quota / private mode
      }
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function persist(flags: FeatureFlagMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {
    // localStorage may be unavailable (private mode, quota); non-fatal.
  }
}

export const fetchFeatureFlags = createAsyncThunk(
  'featureFlags/fetch',
  async () => {
    const response = await getMyFeatureFlags()
    return response.flags ?? {}
  }
)

const initialState: FeatureFlagsState = {
  flags: loadCached(),
  status: 'idle',
  error: null,
}

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    clearFeatureFlags(state) {
      state.flags = {}
      state.status = 'idle'
      state.error = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatureFlags.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFeatureFlags.fulfilled, (state, action) => {
        state.flags = action.payload
        state.status = 'ready'
        state.error = null
        persist(action.payload)
      })
      .addCase(fetchFeatureFlags.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Failed to load feature flags'
      })
  },
})

export const { clearFeatureFlags } = featureFlagsSlice.actions
export default featureFlagsSlice.reducer
