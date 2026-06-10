import { createAsyncThunk } from '@reduxjs/toolkit'

import { downloadDataExportAPI } from '@/api/dataExport'
import { DataExportDownloadResult } from '@/redux/types/dataExport'
import { DataExportScope } from '@/utils/constants/dataExport'
import { triggerBrowserDownload } from '@/utils/download'

export const downloadDataExport = createAsyncThunk<
  DataExportDownloadResult,
  DataExportScope,
  { rejectValue: string }
>('dataExport/downloadDataExport', async (scope, thunkAPI) => {
  try {
    const { blob, filename } = await downloadDataExportAPI(scope)
    const downloadFilename = filename || `dare-context-export-${scope}.zip`
    triggerBrowserDownload(blob, downloadFilename)
    return {
      scope,
      filename: downloadFilename,
    }
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message)
  }
})
