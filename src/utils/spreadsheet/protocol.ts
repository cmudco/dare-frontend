/** Data rows parsed per sheet; big workbooks preview their first rows only. */
export const PREVIEW_ROW_LIMIT = 500

const SPREADSHEET_EXTENSIONS = ['xlsx', 'xlsm', 'xls', 'ods', 'csv', 'tsv']

export const isSpreadsheetFile = (fileName: string): boolean =>
  SPREADSHEET_EXTENSIONS.includes(
    fileName.split('.').pop()?.toLowerCase() ?? ''
  )

export interface SheetPreview {
  name: string
  /** Cell text, header row first, at most PREVIEW_ROW_LIMIT rows. */
  rows: string[][]
  totalRows: number
  totalColumns: number
}

export interface SpreadsheetParseRequest {
  buffer: ArrayBuffer
}

export type SpreadsheetParseResult =
  | { ok: true; sheets: SheetPreview[] }
  | { ok: false; error: string }
