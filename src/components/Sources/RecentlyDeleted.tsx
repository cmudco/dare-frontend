import { useState } from 'react'
import { Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getDeletedFiles,
  purgeDeletedFiles,
  restoreDeletedFiles,
} from '@/redux/asyncThunks/file'
import { getFileIcon } from '@/utils/constants/files'
import { formatRelativeDate } from '@/utils/dateUtils'
import { formatFileSize } from '@/utils/files'
import { toast } from '@/utils/toast'

const plural = (count: number) => `${count} ${count === 1 ? 'file' : 'files'}`

/** Soft-deleted files, restorable until the user deletes them permanently. */
const RecentlyDeleted = () => {
  const dispatch = useAppDispatch()
  const { deletedFiles: files, deletedFilesStatus: status } = useAppSelector(
    (state) => state.files
  )
  const [selected, setSelected] = useState<number[]>([])
  const [confirming, setConfirming] = useState<number[] | null>(null)
  const [pending, setPending] = useState<'restore' | 'purge' | null>(null)

  // Selection never outlives the files it points at.
  const liveSelected = selected.filter((id) => files.some((f) => f.id === id))
  const allSelected = files.length > 0 && liveSelected.length === files.length

  const restore = async (ids: number[]) => {
    setPending('restore')
    try {
      await dispatch(restoreDeletedFiles(ids)).unwrap()
      toast.success(`Restored ${plural(ids.length)}`)
      setSelected([])
    } catch {
      toast.error('Could not restore. Please try again.')
    } finally {
      setPending(null)
    }
  }

  const purge = async (ids: number[]) => {
    setPending('purge')
    try {
      await dispatch(purgeDeletedFiles(ids)).unwrap()
      toast.success(`Permanently deleted ${plural(ids.length)}`)
      setSelected([])
      setConfirming(null)
    } catch {
      toast.error('Could not delete. Please try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className='flex flex-col gap-4' data-tour='files-deleted'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold'>Recently deleted</h2>
          <p className='max-w-xl text-sm text-muted-foreground'>
            Deleted files wait here until you delete them permanently. Restoring
            one puts it back with its folders, tags and projects.
          </p>
        </div>
        {files.length > 0 && (
          <Button
            variant='outline'
            size='sm'
            className='text-destructive hover:text-destructive'
            onClick={() => setConfirming(files.map((file) => file.id))}
          >
            Empty
          </Button>
        )}
      </div>

      {status === 'loading' && files.length === 0 ? (
        <div className='flex flex-col gap-2' aria-busy='true'>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className='h-11 w-full' />
          ))}
        </div>
      ) : status === 'failed' && files.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-border p-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            Could not load deleted files.
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => dispatch(getDeletedFiles())}
          >
            Try again
          </Button>
        </div>
      ) : files.length === 0 ? (
        <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center'>
          <Trash2 className='h-5 w-5 text-muted-foreground' />
          <p className='text-sm font-medium'>Nothing here</p>
          <p className='max-w-sm text-sm text-muted-foreground'>
            Files you delete with Ask DARE land here first, so you can bring
            them back.
          </p>
        </div>
      ) : (
        <div className='flex flex-col'>
          <div className='flex min-h-8 items-center gap-3 px-3 pb-2 text-xs text-muted-foreground'>
            <Checkbox
              aria-label='Select all deleted files'
              checked={allSelected}
              onCheckedChange={(checked) =>
                setSelected(
                  checked === true ? files.map((file) => file.id) : []
                )
              }
            />
            <span>
              {liveSelected.length
                ? `${liveSelected.length} selected`
                : plural(files.length)}
            </span>
            {liveSelected.length > 0 && (
              <div className='ml-auto flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs'
                  disabled={pending !== null}
                  onClick={() => restore(liveSelected)}
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                  Restore
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs text-destructive hover:text-destructive'
                  disabled={pending !== null}
                  onClick={() => setConfirming(liveSelected)}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Delete permanently
                </Button>
              </div>
            )}
          </div>
          <ul className='divide-y divide-border rounded-lg border border-border bg-background'>
            {files.map((file) => (
              <li
                key={file.id}
                className='group flex items-center gap-3 px-3 py-2.5'
              >
                <Checkbox
                  aria-label={`Select ${file.name}`}
                  checked={liveSelected.includes(file.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked === true
                        ? [...current, file.id]
                        : current.filter((id) => id !== file.id)
                    )
                  }
                />
                <span className='shrink-0 opacity-60'>
                  {getFileIcon(file.fileType)}
                </span>
                <span
                  className='min-w-0 flex-1 truncate text-sm text-muted-foreground'
                  title={file.name}
                >
                  {file.name}
                </span>
                <span className='hidden shrink-0 text-xs text-muted-foreground sm:block'>
                  {formatFileSize(file.size)} · Deleted{' '}
                  {formatRelativeDate(file.deletedAt)}
                </span>
                <div className='flex shrink-0 items-center gap-0.5'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    disabled={pending !== null}
                    onClick={() => restore([file.id])}
                  >
                    Restore
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-muted-foreground hover:text-destructive'
                    aria-label={`Delete ${file.name} permanently`}
                    disabled={pending !== null}
                    onClick={() => setConfirming([file.id])}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog
        open={confirming !== null}
        onOpenChange={(open) =>
          !open && pending === null && setConfirming(null)
        }
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              Delete {plural(confirming?.length ?? 0)} permanently?
            </DialogTitle>
            <DialogDescription>
              The files and their search index are removed for good. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='ghost'
              disabled={pending !== null}
              onClick={() => setConfirming(null)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={pending !== null}
              onClick={() => confirming && purge(confirming)}
            >
              {pending === 'purge' && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RecentlyDeleted
