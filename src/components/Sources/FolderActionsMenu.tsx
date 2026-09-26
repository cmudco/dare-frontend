import { useState } from 'react'
import { EllipsisVerticalIcon, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EditFolderModal from '@/components/FolderManager/EditFolderModal'
import { MyFolder } from '@/redux/types/files'
import FolderDeleteDialog from './FolderDeleteDialog'

interface FolderActionsMenuProps {
  folder: MyFolder
  onDeleted: () => void
}

const FolderActionsMenu = ({ folder, onDeleted }: FolderActionsMenuProps) => {
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      <FolderDeleteDialog
        folder={folder}
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        onDeleted={onDeleted}
      />
    </>
  )
}

export default FolderActionsMenu
