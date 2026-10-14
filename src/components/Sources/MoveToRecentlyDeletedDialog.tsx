import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { useAppDispatch } from '@/redux/hooks'
import { trashFiles, getFolders } from '@/redux/asyncThunks/file'
import { MyFile } from '@/redux/types/files'
import { toast } from '@/utils/toast'

interface MoveToRecentlyDeletedDialogProps {
  /** The files to delete; null keeps the dialog closed. */
  files: Pick<MyFile, 'id' | 'name'>[] | null
  onClose: () => void
}

/** Confirms, then moves files to Recently deleted, where they can be restored. */
const MoveToRecentlyDeletedDialog = ({
  files,
  onClose,
}: MoveToRecentlyDeletedDialogProps) => {
  const dispatch = useAppDispatch()
  const count = files?.length ?? 0
  const single = count === 1 ? files?.[0] : undefined
  const label = single ? `“${single.name}”` : `${count} files`

  const handleDelete = async () => {
    if (!files?.length) return
    try {
      await dispatch(trashFiles(files.map((file) => file.id))).unwrap()
      dispatch(getFolders())
      toast.success(`Moved ${label} to Recently deleted`)
    } catch {
      toast.error(`Couldn't delete ${label}.`)
    }
  }

  return (
    <DeleteConfirmation
      isOpen={count > 0}
      onClose={onClose}
      onDelete={handleDelete}
      title={single ? 'Delete file?' : `Delete ${count} files?`}
      description={`${single ? 'It moves' : 'They move'} to Recently deleted in the Sources menu, where you can restore ${single ? 'it' : 'them'}.`}
      itemName={single?.name}
      confirmText='Delete'
    />
  )
}

export default MoveToRecentlyDeletedDialog
