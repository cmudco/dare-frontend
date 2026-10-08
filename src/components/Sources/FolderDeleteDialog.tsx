import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteFolder, deleteFolderWithFiles } from '@/redux/asyncThunks/file'
import { selectFoldersByFileId } from '@/redux/fileSlice'
import { MyFolder } from '@/redux/types/files'

type DeleteMode = 'folder' | 'folderAndFiles'

interface FolderDeleteDialogProps {
  folder: MyFolder
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

const FolderDeleteDialog = ({
  folder,
  isOpen,
  onClose,
  onDeleted,
}: FolderDeleteDialogProps) => {
  const dispatch = useAppDispatch()
  const foldersByFile = useAppSelector(selectFoldersByFileId)
  const [pending, setPending] = useState<DeleteMode | null>(null)
  const [failed, setFailed] = useState(false)

  const fileIds = folder.files.map((file) => file.id)
  const alsoElsewhere = fileIds.filter(
    (id) => (foldersByFile.get(id)?.length ?? 0) > 1
  ).length
  const fileLabel = `${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}`

  const close = () => {
    setFailed(false)
    onClose()
  }

  const handleDelete = async (mode: DeleteMode) => {
    setPending(mode)
    setFailed(false)
    try {
      if (mode === 'folder') {
        await dispatch(deleteFolder(folder.id)).unwrap()
      } else {
        await dispatch(
          deleteFolderWithFiles({ folderId: folder.id, fileIds })
        ).unwrap()
      }
      onDeleted()
    } catch {
      setFailed(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Delete “{folder.name}”?</DialogTitle>
          <DialogDescription>
            {fileIds.length === 0
              ? 'This folder is empty.'
              : `Delete just the folder to keep its ${fileLabel} in your library, or delete the files too. Deleted files are removed from search and can't be recovered.`}
            {alsoElsewhere > 0 &&
              ` ${alsoElsewhere} of them ${alsoElsewhere === 1 ? 'is' : 'are'} also in other folders and would be removed from those too.`}
          </DialogDescription>
        </DialogHeader>
        {failed && (
          <p role='alert' className='text-sm text-destructive'>
            Deleting didn't finish. Try again.
          </p>
        )}
        <DialogFooter className='gap-2 sm:gap-0 sm:space-x-2'>
          <Button variant='outline' onClick={close} disabled={!!pending}>
            Cancel
          </Button>
          <Button
            variant={fileIds.length === 0 ? 'destructive' : 'outline'}
            onClick={() => handleDelete('folder')}
            disabled={!!pending}
          >
            {pending === 'folder' && (
              <Loader2 className='h-4 w-4 animate-spin' />
            )}
            Delete folder
          </Button>
          {fileIds.length > 0 && (
            <Button
              variant='destructive'
              onClick={() => handleDelete('folderAndFiles')}
              disabled={!!pending}
            >
              {pending === 'folderAndFiles' && (
                <Loader2 className='h-4 w-4 animate-spin' />
              )}
              Delete folder and {fileLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FolderDeleteDialog
