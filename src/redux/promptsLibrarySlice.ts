import { createSlice } from '@reduxjs/toolkit'

import { PromptsLibraryState } from './types/prompt'
import {
  cloneFromLibrary,
  getPromptsLibrary,
  publishPrompt,
  unpublishPrompt,
} from './asyncThunks/promptsLibrary'

const initialState: PromptsLibraryState = {
  publishedPrompts: [],
  loading: false,
  error: null,
}

const promptsLibrarySlice = createSlice({
  name: 'promptsLibrary',
  initialState,
  reducers: {
    clearLibraryError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Get library
    builder.addCase(getPromptsLibrary.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(getPromptsLibrary.fulfilled, (state, action) => {
      state.loading = false
      state.publishedPrompts = action.payload
    })
    builder.addCase(getPromptsLibrary.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Publish prompt
    builder.addCase(publishPrompt.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(publishPrompt.fulfilled, (state, action) => {
      state.loading = false
      state.publishedPrompts.unshift(action.payload)
    })
    builder.addCase(publishPrompt.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Unpublish prompt
    builder.addCase(unpublishPrompt.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(unpublishPrompt.fulfilled, (state, action) => {
      state.loading = false
      state.publishedPrompts = state.publishedPrompts.filter(
        (p) => p.id !== action.payload
      )
    })
    builder.addCase(unpublishPrompt.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Clone from library
    builder.addCase(cloneFromLibrary.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(cloneFromLibrary.fulfilled, (state) => {
      state.loading = false
      // The cloned prompt is added to prompts slice, not here
    })
    builder.addCase(cloneFromLibrary.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearLibraryError } = promptsLibrarySlice.actions

export default promptsLibrarySlice.reducer
