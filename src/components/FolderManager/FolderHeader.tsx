import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AppDispatch, RootState } from '../../redux/store'
import { useState } from 'react'
import { FolderPlus, FolderInput, Plus, Upload } from 'lucide-react'
import ViewToggle from '../FileManager/ViewToggle'
import FolderModal from './FolderModal'
import FolderUploadModal from './FolderUploadModal'
import { createFolder } from '../../redux/asyncThunks/file'
import { setSearchQuery, openMoveModal } from '../../redux/fileSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { FolderHeaderProps } from '@/redux/types/files'

const FolderHeader: React.FC<FolderHeaderProps> = ({ onToggleView }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { searchQuery, selectedItems } = useSelector(
    (state: RootState) => state.files
  )
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isFolderUploadModalOpen, setIsFolderUploadModalOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch(setSearchQuery(value))
  }

  return (
    <div className='flex flex-col gap-4 px-2.5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ViewToggle onToggleView={onToggleView} />
          <div className='relative flex h-[40px] w-[300px] items-center'>
            <MagnifyingGlassIcon className='absolute left-3 h-5 w-5 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search by Folders'
              className='rounded-md border border-border bg-background pl-10 focus:border-primary focus:ring-2 focus:ring-primary'
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {selectedItems.length > 0 && (
            <Button
              className='rounded-md py-2 font-normal whitespace-nowrap normal-case shadow-xs'
              variant='outline'
              size='default'
              onClick={() => dispatch(openMoveModal())}
            >
              <FolderInput className='mr-1' />
              Move ({selectedItems.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className='rounded-md py-2 font-normal whitespace-nowrap normal-case shadow-xs'
                variant='default'
                size='default'
              >
                <Plus className='mr-1' />
                Upload
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => setIsFolderModalOpen(true)}
              >
                <FolderPlus className='mr-2 h-4 w-4' />
                <span>Create Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => setIsFolderUploadModalOpen(true)}
              >
                <Upload className='mr-2 h-4 w-4' />
                <span>Upload Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreateFolder={(folderName) => {
          dispatch(createFolder(folderName))
        }}
      />
      <FolderUploadModal
        isOpen={isFolderUploadModalOpen}
        onClose={() => setIsFolderUploadModalOpen(false)}
      />
    </div>
  )
}

export default FolderHeader
