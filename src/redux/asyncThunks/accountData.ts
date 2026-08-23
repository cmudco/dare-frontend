/**
 * Account Data Thunks
 */
import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  deleteAccountAPI,
  exportAccountDataAPI,
  restoreAccountDataAPI,
} from '@/api/accountData'
import { ExportScope } from '@/redux/types/accountData'
import { triggerBrowserDownload } from '@/utils/download'

/** Download the archive and hand it to the browser. */
export const exportAccountData = createAsyncThunk(
  'accountData/export',
  async (scope: ExportScope, thunkAPI) => {
    try {
      const { blob, filename } = await exportAccountDataAPI(scope)
      const name = filename || `dare-export-${scope}.zip`
      triggerBrowserDownload(blob, name)
      return { scope, filename: name }
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/** Rebuild this account from a previously downloaded archive. */
export const restoreAccountData = createAsyncThunk(
  'accountData/restore',
  async (archive: File, thunkAPI) => {
    try {
      return await restoreAccountDataAPI(archive)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)

/** Permanently erase the account. There is no undo. */
export const deleteAccount = createAsyncThunk(
  'accountData/delete',
  async (confirmation: string, thunkAPI) => {
    try {
      return await deleteAccountAPI(confirmation)
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message)
    }
  }
)
