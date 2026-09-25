import { useState } from 'react'
import { EllipsisVerticalIcon, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import EditFolderModal from '@/components/FolderManager/EditFolderModal'
import { useAppDispatch } from '@/redux/hooks'
import { deleteFolder } from '@/redux/asyncThunks/file'
import { MyFolder } from '@/redux/types/files'

interface FolderActionsMenuProps {
  folder: MyFolder
  onDeleted: () => void
}

const FolderActionsMenu = ({ folder, onDeleted }: FolderActionsMenuProps) => {
  const dispatch = useAppDispatch()
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    await dispatch(deleteFolder(folder.id)).unwrap()
    setDeleting(false)
    onDeleted()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for folder ${folder.name}`}
          className='rounded-md p-1.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={() => setRenaming(true)}>
            <Pencil className='mr-2 h-4 w-4' />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => setDeleting(true)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditFolderModal
        isOpen={renaming}
        onClose={() => setRenaming(false)}
        folder={folder}
      />
      <DeleteConfirmation
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        onDelete={handleDelete}
        title='Delete folder'
        description='The folder is removed. Its files stay in your library.'
        itemName={folder.name}
        confirmText='Delete folder'
      />
    </>
  )
}

export default FolderActionsMenu
