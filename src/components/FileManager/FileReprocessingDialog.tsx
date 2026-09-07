import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { reprocessFile } from '@/redux/asyncThunks/file'
import { MyFile } from '@/redux/types/files'
import {
  DocumentProcessingMode,
  DocumentReprocessingAction,
  DOCUMENT_PROCESSING_OPTIONS,
} from '@/utils/constants/file'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  file: MyFile
  onClose: () => void
}

export default function FileReprocessingDialog({ file, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState(
    file.processingMode ?? DocumentProcessingMode.Advanced
  )
  const request = useAppSelector(
    (state) => state.files.reprocessingRequests[file.id]
  )
  const busy = request?.pending ?? false
  const error = request?.error
  const submit = async (action: DocumentReprocessingAction) => {
    const result = await dispatch(
      reprocessFile({
        fileId: file.id,
        action,
        ...(action === DocumentReprocessingAction.Reparse
          ? { processingMode: mode }
          : {}),
      })
    )
    if (reprocessFile.fulfilled.match(result)) onClose()
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Reprocess document</DialogTitle>
          <DialogDescription>
            Use the stored original of {file.name}. Its existing search index
            stays available until a replacement is ready.
          </DialogDescription>
        </DialogHeader>
        <fieldset disabled={busy} className='space-y-3'>
          <legend className='mb-2 text-sm font-medium'>Processing mode</legend>
          {[DocumentProcessingMode.Basic, DocumentProcessingMode.Advanced].map(
            (value) => (
              <label
                key={value}
                className='flex items-start gap-3 rounded-md border p-3'
              >
                <input
                  type='radio'
                  name='reprocessing-mode'
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                  className='mt-1'
                />
                <span>
                  <span className='block font-medium'>
                    {DOCUMENT_PROCESSING_OPTIONS[value].label}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {DOCUMENT_PROCESSING_OPTIONS[value].description}
                  </span>
                </span>
              </label>
            )
          )}
        </fieldset>
        <p className='text-sm text-muted-foreground'>
          Reprocessing generates embeddings again. Advanced may also use paid
          vision calls through your selected wallet. Scanned-page approval
          limits still apply.
        </p>
        {!!file.failedImageCount && (
          <div className='space-y-2 rounded-md border p-3'>
            <p className='text-sm'>
              {file.failedImageCount} image descriptions failed. Retry those
              images while preserving successful descriptions and the current
              processing mode.
            </p>
            <Button
              variant='outline'
              disabled={busy}
              onClick={() => submit(DocumentReprocessingAction.RetryImages)}
            >
              Retry failed image descriptions
            </Button>
          </div>
        )}
        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant='outline' disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={busy}
            onClick={() => submit(DocumentReprocessingAction.Reparse)}
          >
            {busy ? 'Starting…' : 'Reprocess document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
