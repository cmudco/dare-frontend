import { createSlice } from '@reduxjs/toolkit'

import { deleteAccount } from './asyncThunks/accountDeletion'
import { initialAccountDeletionState } from './initialState/accountDeletion'

const accountDeletionSlice = createSlice({
  name: 'accountDeletion',
  initialState: initialAccountDeletionState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleting = false
        state.deleted = true
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload || 'Failed to delete account'
      })
  },
})

export default accountDeletionSlice.reducer
