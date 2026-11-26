import { createSlice } from '@reduxjs/toolkit'
import { requestAccess, loadSignupOptions } from './asyncThunks/accessRequest'
import { AccessRequestState } from './types/accessRequest'

const initialState: AccessRequestState = {
  options: null,
  optionsStatus: 'idle',
  optionsRequestId: null,
  requestId: null,
  loading: false,
  error: null,
  response: null,
}

const accessRequestSlice = createSlice({
  name: 'accessRequest',
  initialState,
  reducers: {
    resetAccessRequest: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSignupOptions.pending, (state, action) => {
        state.optionsRequestId = action.meta.requestId
        state.optionsStatus = 'loading'
        state.options = null
      })
      .addCase(loadSignupOptions.fulfilled, (state, action) => {
        if (state.optionsRequestId !== action.meta.requestId) return
        state.options = action.payload
        state.optionsStatus = 'succeeded'
        state.optionsRequestId = null
      })
      .addCase(loadSignupOptions.rejected, (state, action) => {
        if (state.optionsRequestId !== action.meta.requestId) return
        state.optionsStatus = 'failed'
        state.optionsRequestId = null
      })
      .addCase(requestAccess.pending, (state, action) => {
        state.requestId = action.meta.requestId
        state.loading = true
        state.error = null
        state.response = null
      })
      .addCase(requestAccess.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.requestId = null
        state.loading = false
        state.response = action.payload
      })
      .addCase(requestAccess.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.requestId = null
        state.loading = false
        state.error =
          action.payload ?? 'Unable to submit your request. Please try again.'
      })
  },
})

export const { resetAccessRequest } = accessRequestSlice.actions
export default accessRequestSlice.reducer
