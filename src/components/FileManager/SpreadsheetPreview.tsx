import { useEffect, useState } from 'react'

import { AlertCircle, Download } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import type {
  SheetPreview,
  SpreadsheetParseResult,
} from '@/utils/spreadsheet/protocol'

interface SpreadsheetPreviewProps {
  blob: Blob
  onDownload: () => void
}

type PreviewState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; sheets: SheetPreview[] }

/** Read-only table preview of an Excel or CSV file, parsed off the main thread. */
const SpreadsheetPreview = ({ blob, onDownload }: SpreadsheetPreviewProps) => {
  const [state, setState] = useState<PreviewState>({ status: 'loading' })
  const [activeSheet, setActiveSheet] = useState(0)

  useEffect(() => {
    const worker = new Worker(
      new URL('../../utils/spreadsheet/spreadsheet.worker.ts', import.meta.url),
      { type: 'module' }
    )
    worker.onmessage = (event: MessageEvent<SpreadsheetParseResult>) => {
      const result = event.data
      if (result.ok) {
        const firstWithData = result.sheets.findIndex((s) => s.rows.length > 0)
        setActiveSheet(Math.max(firstWithData, 0))
        setState({ status: 'ready', sheets: result.sheets })
      } else {
        setState({ status: 'error', error: result.error })
      }
    }
    setState({ status: 'loading' })
    blob
      .arrayBuffer()
      .then((buffer) => worker.postMessage({ buffer }, [buffer]))
    return () => worker.terminate()
  }, [blob])

  if (state.status === 'loading') {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
        <span className='ml-3 text-muted-foreground'>Reading spreadsheet…</span>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className='flex items-center justify-center gap-2 py-12 text-muted-foreground'>
        <AlertCircle className='h-5 w-5' />
        <span>Couldn't preview this spreadsheet: {state.error}</span>
      </div>
    )
  }

  const sheet = state.sheets[activeSheet]
  const [header = [], ...body] = sheet?.rows ?? []
  const shownRows = body.length
  const dataRows = Math.max((sheet?.totalRows ?? 0) - 1, 0)

  return (
    <div className='flex h-full flex-col gap-2'>
      <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
        {state.sheets.length > 1 &&
          state.sheets.map((s, index) => (
            <button
              key={s.name}
              type='button'
              onClick={() => setActiveSheet(index)}
              className={cn(
                'rounded-sm px-2 py-1 transition-colors',
                index === activeSheet
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              )}
            >
              {s.name}
            </button>
          ))}
        <span>
          {shownRows < dataRows
            ? `Showing the first ${shownRows.toLocaleString()} of ${dataRows.toLocaleString()} rows`
            : `${dataRows.toLocaleString()} rows`}{' '}
          · {(sheet?.totalColumns ?? 0).toLocaleString()} columns
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={onDownload}
          className='ml-auto'
        >
          <Download className='mr-2 h-4 w-4' />
          Download
        </Button>
      </div>

      {header.length === 0 ? (
        <p className='py-12 text-center text-muted-foreground'>
          This sheet is empty.
        </p>
      ) : (
        <div className='min-h-0 flex-1 overflow-auto rounded-md border border-border'>
          <table className='w-max min-w-full border-collapse text-xs'>
            <thead className='sticky top-0 z-10 bg-muted'>
              <tr>
                <th className='border-b border-border px-2 py-1.5 text-right font-medium text-muted-foreground'>
                  #
                </th>
                {header.map((cell, index) => (
                  <th
                    key={index}
                    className='border-b border-border px-3 py-1.5 text-left font-medium whitespace-nowrap text-foreground'
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className='odd:bg-card even:bg-background'>
                  <td className='px-2 py-1 text-right text-muted-foreground tabular-nums'>
                    {rowIndex + 1}
                  </td>
                  {header.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className='px-3 py-1 whitespace-nowrap text-foreground tabular-nums'
                    >
                      {row[cellIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SpreadsheetPreview
