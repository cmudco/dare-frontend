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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/redux/hooks'
import { deleteFolder, deleteFolderWithFiles } from '@/redux/asyncThunks/file'
import { MyFolder } from '@/redux/types/files'
import { toast } from '@/utils/toast'

type FilesChoice = 'keep' | 'delete'

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
  const [choice, setChoice] = useState<FilesChoice>('keep')
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const fileIds = folder.files.map((file) => file.id)
  const fileLabel = `${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}`
  const deletingFiles = fileIds.length > 0 && choice === 'delete'

  const close = () => {
    setFailed(false)
    setChoice('keep')
    onClose()
  }

  const handleDelete = async () => {
    setPending(true)
    setFailed(false)
    try {
      if (deletingFiles) {
        await dispatch(
          deleteFolderWithFiles({ folderId: folder.id, fileIds })
        ).unwrap()
        toast.success(
          `Deleted “${folder.name}”; ${fileLabel} moved to Recently deleted`
        )
      } else {
        await dispatch(deleteFolder(folder.id)).unwrap()
        toast.success(`Deleted “${folder.name}”`)
      }
      close()
      onDeleted()
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  const option = (value: FilesChoice, title: string, detail: string) => (
    <Label
      htmlFor={`folder-delete-${value}`}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
        choice === value
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-accent/50'
      )}
    >
      <RadioGroupItem
        id={`folder-delete-${value}`}
        value={value}
        className='mt-0.5'
      />
      <span className='flex flex-col gap-0.5'>
        <span className='text-sm font-medium'>{title}</span>
        <span className='text-xs font-normal text-muted-foreground'>
          {detail}
        </span>
      </span>
    </Label>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !pending && close()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Delete “{folder.name}”?</DialogTitle>
          <DialogDescription>
            {fileIds.length === 0
              ? 'This folder is empty.'
              : `What should happen to the ${fileLabel} in it?`}
          </DialogDescription>
        </DialogHeader>

        {fileIds.length > 0 && (
          <RadioGroup
            value={choice}
            onValueChange={(value) =>
              setChoice(value === 'delete' ? 'delete' : 'keep')
            }
            className='gap-2'
          >
            {option(
              'keep',
              `Keep the ${fileLabel}`,
              'They stay in your library, just outside this folder.'
            )}
            {option(
              'delete',
              `Delete the ${fileLabel} too`,
              'They move to Recently deleted, where you can restore them.'
            )}
          </RadioGroup>
        )}

        {failed && (
          <p role='alert' className='text-sm text-destructive'>
            Deleting didn&apos;t finish. Try again.
          </p>
        )}
        <DialogFooter className='gap-2 sm:gap-0 sm:space-x-2'>
          <Button variant='outline' onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={pending}
          >
            {pending && <Loader2 className='h-4 w-4 animate-spin' />}
            {deletingFiles ? `Delete folder and ${fileLabel}` : 'Delete folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FolderDeleteDialog
