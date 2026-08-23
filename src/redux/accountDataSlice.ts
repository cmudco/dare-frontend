/**
 * Account Data Slice
 *
 * Request lifecycle for exporting, restoring and deleting the account.
 */
import { createSlice } from '@reduxjs/toolkit'

import { initialAccountDataState } from './initialState/accountData'
import {
  deleteAccount,
  exportAccountData,
  restoreAccountData,
} from './asyncThunks/accountData'

const accountDataSlice = createSlice({
  name: 'accountData',
  initialState: initialAccountDataState,
  reducers: {
    clearRestoreResult: (state) => {
      state.restoreResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exportAccountData.pending, (state, action) => {
        state.exportingScope = action.meta.arg
      })
      .addCase(exportAccountData.fulfilled, (state) => {
        state.exportingScope = null
      })
      .addCase(exportAccountData.rejected, (state) => {
        state.exportingScope = null
      })
      .addCase(restoreAccountData.pending, (state) => {
        state.restoring = true
        state.restoreResult = null
      })
      .addCase(restoreAccountData.fulfilled, (state, action) => {
        state.restoring = false
        state.restoreResult = action.payload
      })
      .addCase(restoreAccountData.rejected, (state) => {
        state.restoring = false
      })
      .addCase(deleteAccount.pending, (state) => {
        state.deleting = true
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleting = false
      })
      .addCase(deleteAccount.rejected, (state) => {
        state.deleting = false
      })
  },
})

export const { clearRestoreResult } = accountDataSlice.actions
export default accountDataSlice.reducer
