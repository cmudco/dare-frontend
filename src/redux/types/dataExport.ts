import { DataExportScope } from '@/utils/constants/dataExport'

export interface DataExportDownloadResult {
  scope: DataExportScope
  filename: string
}

export interface DataExportState {
  fullDownloading: boolean
  memoriesDownloading: boolean
  error: string | null
}
