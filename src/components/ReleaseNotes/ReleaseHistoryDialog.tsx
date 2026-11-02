import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchReleaseNoteHistory } from '@/redux/asyncThunks/releaseNotes'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { selectReleaseNoteHistory } from '@/redux/releaseNotesSlice'
import { ReleaseNoteEntry } from './ReleaseNoteEntry'

interface ReleaseHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Every live release, newest first, opened from the account menu. */
export function ReleaseHistoryDialog({
  open,
  onOpenChange,
}: ReleaseHistoryDialogProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { notes, page, hasMore, status, error } = useAppSelector(
    selectReleaseNoteHistory
  )
  const loading = status === 'loading'

  const handleTryIt = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[calc(100%-2rem)] max-w-xl rounded-2xl sm:rounded-2xl lg:max-w-[min(60vw,60rem)]'>
        <DialogHeader>
          <DialogTitle>What&apos;s new</DialogTitle>
          <DialogDescription>
            Recent releases and improvements.
          </DialogDescription>
        </DialogHeader>

        <div className='-mr-3 max-h-[65vh] overflow-y-auto pr-3'>
          <div className='space-y-6'>
            {notes.map((note) => (
              <ReleaseNoteEntry
                key={note.id}
                note={note}
                onTryIt={handleTryIt}
              />
            ))}

            {status === 'succeeded' && notes.length === 0 && (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                No releases yet.
              </p>
            )}

            {status === 'failed' && (
              <div className='flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground'>
                <p>{error}</p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => dispatch(fetchReleaseNoteHistory(page + 1))}
                >
                  Retry
                </Button>
              </div>
            )}

            {loading && (
              <div className='flex justify-center py-4'>
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            )}

            {status === 'succeeded' && hasMore && (
              <div className='flex justify-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => dispatch(fetchReleaseNoteHistory(page + 1))}
                >
                  Load older releases
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
