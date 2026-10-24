import { read, utils } from 'xlsx'

import { PREVIEW_ROW_LIMIT } from './protocol'
import type {
  SheetPreview,
  SpreadsheetParseRequest,
  SpreadsheetParseResult,
} from './protocol'

const post = (result: SpreadsheetParseResult) =>
  (
    self as unknown as { postMessage: (result: SpreadsheetParseResult) => void }
  ).postMessage(result)

self.onmessage = (event: MessageEvent<SpreadsheetParseRequest>) => {
  try {
    // sheetRows stops parsing early, so a 90k-row workbook stays fast; the
    // full extent is still reported through !fullref.
    const workbook = read(event.data.buffer, {
      type: 'array',
      sheetRows: PREVIEW_ROW_LIMIT + 1,
      cellDates: true,
    })
    const sheets: SheetPreview[] = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name]
      const extent = sheet['!fullref'] ?? sheet['!ref']
      const range = extent ? utils.decode_range(extent) : null
      const rows = utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
      })
      return {
        name,
        rows,
        totalRows: range ? range.e.r - range.s.r + 1 : 0,
        totalColumns: range ? range.e.c - range.s.c + 1 : 0,
      }
    })
    post({ ok: true, sheets })
  } catch (error) {
    post({
      ok: false,
      error: error instanceof Error ? error.message : 'Could not read file',
    })
  }
}
