/**
 * RestoreArchiveDialog
 *
 * Upload a previously exported .zip and rebuild this account from it.
 * Restore adds to whatever is already here rather than replacing it, so the
 * dialog says that plainly before the person commits.
 */
import { ChangeEvent, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { restoreAccountData } from '@/redux/asyncThunks/accountData'
import { AppDispatch, RootState } from '@/redux/store'
import { toast } from '@/utils/toast'

const RestoreArchiveDialog = () => {
  const dispatch = useDispatch<AppDispatch>()
  const restoring = useSelector(
    (state: RootState) => state.accountData.restoring
  )
  const [open, setOpen] = useState(false)
  const [archive, setArchive] = useState<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setArchive(event.target.files?.[0] ?? null)
  }

  const handleRestore = async () => {
    if (!archive) return

    const result = await dispatch(restoreAccountData(archive))
    if (restoreAccountData.fulfilled.match(result)) {
      const { conversations, messages, prompts, workflows, memories, skipped } =
        result.payload
      toast.success(
        `Restored ${conversations} conversations (${messages} messages), ` +
          `${prompts} prompts, ${workflows} workflows and ${memories} memories.`
      )
      skipped.forEach((note) => toast.info(note))
      setOpen(false)
      setArchive(null)
      if (fileInput.current) fileInput.current.value = ''
      return
    }

    toast.error((result.payload as string) || 'That archive could not be read.')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='justify-center gap-2'>
          <Upload className='h-4 w-4' />
          Restore from export
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Restore from an export</DialogTitle>
          <DialogDescription>
            Pick the .zip you downloaded from DARE. Your conversations, prompts,
            workflows and memories are recreated in this account.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <input
            ref={fileInput}
            type='file'
            accept='.zip,application/zip'
            onChange={handleFile}
            className='block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:bg-accent'
          />
          <p className='text-sm text-muted-foreground'>
            Restoring adds to this account — it does not replace what is already
            here. Uploaded files and their embeddings are not part of an export.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={() => setOpen(false)}
            disabled={restoring}
          >
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={!archive || restoring}>
            {restoring ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Restoring
              </>
            ) : (
              'Restore'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RestoreArchiveDialog
