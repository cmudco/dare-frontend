import { createSlice } from '@reduxjs/toolkit'
import { requestAccess } from './asyncThunks/accessRequest'
import { AccessRequestState } from './types/accessRequest'

const initialState: AccessRequestState = {
  requestId: null,
  loading: false,
  error: null,
  response: null,
}

const accessRequestSlice = createSlice({
  name: 'accessRequest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

export default accessRequestSlice.reducer
