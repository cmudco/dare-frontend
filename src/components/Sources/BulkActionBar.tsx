import { useState } from 'react'
import { FolderInput, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteMultipleFiles, getFolders } from '@/redux/asyncThunks/file'
import { clearSelectedItems, openMoveModal } from '@/redux/fileSlice'

const BulkActionBar = () => {
  const dispatch = useAppDispatch()
  const selectedItems = useAppSelector((state) => state.files.selectedItems)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const count = selectedItems.length

  if (count === 0) return null

  const handleDelete = async () => {
    await dispatch(deleteMultipleFiles(selectedItems)).unwrap()
    dispatch(getFolders())
    dispatch(clearSelectedItems())
    setConfirmingDelete(false)
  }

  return (
    <div
      role='toolbar'
      aria-label='Selected sources'
      className='sticky bottom-4 z-10 mx-auto flex items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg'
    >
      <span className='px-1 text-sm font-medium'>{count} selected</span>
      <Button
        variant='outline'
        size='sm'
        onClick={() => dispatch(openMoveModal())}
      >
        <FolderInput className='h-4 w-4' />
        Add to folder
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='text-destructive hover:text-destructive'
        onClick={() => setConfirmingDelete(true)}
      >
        <Trash2 className='h-4 w-4' />
        Delete
      </Button>
      <Button
        variant='ghost'
        size='icon'
        aria-label='Clear selection'
        className='h-8 w-8'
        onClick={() => dispatch(clearSelectedItems())}
      >
        <X className='h-4 w-4' />
      </Button>
      <DeleteConfirmation
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onDelete={handleDelete}
        title={count === 1 ? 'Delete file' : `Delete ${count} files`}
        description='This permanently deletes the selected files and removes them from search.'
        confirmText='Delete'
      />
    </div>
  )
}

export default BulkActionBar
