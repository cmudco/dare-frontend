import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AppDispatch, RootState } from '../../redux/store'
import { useState } from 'react'
import { FolderPlus, FolderInput, Plus, Upload } from 'lucide-react'
import FolderModal from './FolderModal'
import FolderUploadModal from './FolderUploadModal'
import { createFolder } from '../../redux/aynscThunks/file'
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
  const { searchQuery, selectedItems, currentView } = useSelector(
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
          <div className='mr-4 flex gap-2'>
            <Button
              variant={currentView === 'files' ? 'default' : 'outline'}
              size='sm'
              onClick={() => onToggleView('files')}
            >
              Files
            </Button>
            <Button
              variant={currentView === 'folders' ? 'default' : 'outline'}
              size='sm'
              onClick={() => onToggleView('folders')}
            >
              Folders
            </Button>
          </div>
          <div className='relative flex h-[40px] w-[300px] items-center'>
            <MagnifyingGlassIcon className='absolute left-3 h-5 w-5 text-gray-500' />
            <Input
              type='text'
              placeholder='Search by Folders'
              className='rounded-md border border-gray-300 bg-white pl-10 focus:border-primary focus:ring-2 focus:ring-primary'
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {selectedItems.length > 0 && (
            <Button
              className='whitespace-nowrap rounded-md py-2 font-normal normal-case shadow-sm'
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
                className='whitespace-nowrap rounded-md py-2 font-normal normal-case shadow-sm'
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
