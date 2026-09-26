import { useState } from 'react'
import { FolderInput, Tag as TagIcon, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  bulkTagFiles,
  deleteMultipleFiles,
  getFolders,
} from '@/redux/asyncThunks/file'
import { clearSelectedItems, openMoveModal } from '@/redux/fileSlice'

const BulkActionBar = () => {
  const dispatch = useAppDispatch()
  const selectedItems = useAppSelector((state) => state.files.selectedItems)
  const tags = useAppSelector((state) => state.tags.tags)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [tagging, setTagging] = useState(false)
  const count = selectedItems.length

  if (count === 0) return null

  const handleDelete = async () => {
    await dispatch(deleteMultipleFiles(selectedItems)).unwrap()
    dispatch(getFolders())
    dispatch(clearSelectedItems())
    setConfirmingDelete(false)
  }

  const handleTag = async (tagId: number) => {
    setTagging(true)
    try {
      await dispatch(
        bulkTagFiles({ fileIds: selectedItems, tagIds: [tagId] })
      ).unwrap()
    } finally {
      setTagging(false)
    }
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' disabled={tagging}>
            <TagIcon className='h-4 w-4' />
            Add tag
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='center'
          side='top'
          className='max-h-72 overflow-y-auto'
        >
          {tags.length === 0 ? (
            <p className='px-2 py-1.5 text-sm text-muted-foreground'>
              No tags yet. Add one from a file's menu.
            </p>
          ) : (
            tags.map((tag) => (
              <DropdownMenuItem key={tag.id} onClick={() => handleTag(tag.id)}>
                {tag.label}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
