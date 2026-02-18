/**
 * DARE Tools Redux slice
 *
 * Manages available DARE tools state.
 * Tool selection is managed by conversationSlice (on activeConversation.selectedDareToolSlugs).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialDareToolsState } from './initialState/dareTools'
import { getDareTools } from './asyncThunks/dareTools'
import { DareTool } from './types/dareTools'

const dareToolsSlice = createSlice({
  name: 'dareTools',
  initialState: initialDareToolsState,
  reducers: {
    clearDareToolsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDareTools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getDareTools.fulfilled,
        (state, action: PayloadAction<DareTool[]>) => {
          state.loading = false
          state.tools = action.payload
          state.fetched = true
        }
      )
      .addCase(getDareTools.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.fetched = true // Mark as fetched even on error to prevent infinite retries
      })
  },
})

export const { clearDareToolsError } = dareToolsSlice.actions

export default dareToolsSlice.reducer
