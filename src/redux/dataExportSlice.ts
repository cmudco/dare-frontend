import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { downloadDataExport } from './asyncThunks/dataExport'
import { initialDataExportState } from './initialState/dataExport'
import { DataExportDownloadResult } from './types/dataExport'
import { DataExportScope } from '@/utils/constants/dataExport'

const dataExportSlice = createSlice({
  name: 'dataExport',
  initialState: initialDataExportState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadDataExport.pending, (state, action) => {
        state.error = null
        if (action.meta.arg === DataExportScope.FULL) {
          state.fullDownloading = true
        } else {
          state.memoriesDownloading = true
        }
      })
      .addCase(
        downloadDataExport.fulfilled,
        (state, action: PayloadAction<DataExportDownloadResult>) => {
          if (action.payload.scope === DataExportScope.FULL) {
            state.fullDownloading = false
          } else {
            state.memoriesDownloading = false
          }
        }
      )
      .addCase(downloadDataExport.rejected, (state, action) => {
        const scope = action.meta.arg
        if (scope === DataExportScope.FULL) {
          state.fullDownloading = false
        } else {
          state.memoriesDownloading = false
        }
        state.error = action.payload || 'Failed to download data export'
      })
  },
})

export default dataExportSlice.reducer
