import {
  MagnifyingGlassIcon,
  AdjustmentsVerticalIcon,
} from '@heroicons/react/24/solid'
import { useDispatch, useSelector } from 'react-redux'
import {
  openModal,
  setSearchQuery,
  setSelectedTags,
  openMoveModal,
  clearSelectedItems,
  setMediaTypeFilter,
} from '../../redux/fileSlice'
import { MediaTypeFilter } from '../../redux/types/files'
import { deleteMultipleFiles, getFolders } from '../../redux/asyncThunks/file'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { RootState, AppDispatch } from '../../redux/store'
import { useState } from 'react'
import { Tag } from '../../redux/types/tags'
import { Badge } from '../ui/badge'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getTagColor } from '@/utils/files'
import {
  Upload,
  FolderInput,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  Sparkles,
  LayoutGrid,
} from 'lucide-react'

interface FileHeaderProps {
  onToggleView?: (view: 'files' | 'folders' | 'media') => void
}

const MEDIA_TYPE_TABS: {
  value: MediaTypeFilter
  label: string
  icon: React.ReactNode
}[] = [
  { value: 'all', label: 'All', icon: <LayoutGrid className='h-4 w-4' /> },
  {
    value: 'document',
    label: 'Documents',
    icon: <FileText className='h-4 w-4' />,
  },
  { value: 'image', label: 'Images', icon: <Image className='h-4 w-4' /> },
  { value: 'video', label: 'Videos', icon: <Video className='h-4 w-4' /> },
  { value: 'audio', label: 'Audio', icon: <Music className='h-4 w-4' /> },
  {
    value: 'generated_image',
    label: 'Generated',
    icon: <Sparkles className='h-4 w-4' />,
  },
]

const FileHeader: React.FC<FileHeaderProps> = ({ onToggleView }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { tags } = useSelector((state: RootState) => state.tags)
  const {
    searchQuery,
    selectedTags,
    selectedItems,
    currentView,
    mediaTypeFilter,
  } = useSelector((state: RootState) => state.files)
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const handleMediaTypeChange = (mediaType: MediaTypeFilter) => {
    dispatch(setMediaTypeFilter(mediaType))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch(setSearchQuery(value))
  }

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    dispatch(setSelectedTags(newSelectedTags))
  }

  const handleBulkDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteMultipleFiles(selectedItems)).unwrap()
      dispatch(getFolders())
      dispatch(clearSelectedItems())
      setShowDeleteConfirmation(false)
    } catch (error) {
      console.error('Failed to delete files:', error)
      setShowDeleteConfirmation(false)
    }
  }

  return (
    <div className='flex flex-col gap-4 px-2.5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {onToggleView && (
            <div data-tour='files-view-toggle' className='mr-4 flex gap-2'>
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
              <Button
                variant={currentView === 'media' ? 'default' : 'outline'}
                size='sm'
                onClick={() => onToggleView('media')}
              >
                Media
              </Button>
            </div>
          )}
          <div
            data-tour='files-search'
            className='relative flex h-[40px] w-[300px] items-center'
          >
            <MagnifyingGlassIcon className='absolute left-3 h-5 w-5 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search by Files'
              className='rounded-md border border-border bg-background pl-10 focus:border-primary focus:ring-2 focus:ring-primary'
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            data-tour='files-filter-tags'
            variant='outline'
            className='flex items-center gap-2'
            onClick={() => setShowTagFilter(!showTagFilter)}
          >
            <AdjustmentsVerticalIcon
              className={`h-5 w-5 ${showTagFilter ? 'text-primary' : 'text-muted-foreground'}`}
            />
            Filter by Tags
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          {selectedItems.length > 0 && (
            <Button
              className='rounded-md bg-secondary py-2 font-normal whitespace-nowrap text-secondary-foreground normal-case shadow-xs hover:bg-secondary/80'
              variant='default'
              size='default'
              onClick={() => dispatch(openMoveModal())}
            >
              <FolderInput className='mr-1' />
              Move ({selectedItems.length})
            </Button>
          )}
          {selectedItems.length > 0 && (
            <Button
              className='rounded-md bg-red-600 py-2 font-normal whitespace-nowrap normal-case shadow-xs hover:bg-red-700'
              variant='default'
              size='default'
              onClick={handleBulkDelete}
            >
              <Trash2 className='mr-1' />
              {selectedItems.length === 1 ? 'Delete File' : 'Delete Files'}
            </Button>
          )}
          <Button
            data-tour='files-upload'
            className='rounded-md py-2 font-normal whitespace-nowrap normal-case shadow-xs'
            variant='default'
            size='default'
            onClick={() => dispatch(openModal())}
          >
            <Upload />
            Upload File
          </Button>
        </div>
      </div>

      {showTagFilter && (
        <div className='flex flex-wrap gap-2 py-3'>
          {tags.map((tag: Tag) => {
            const isSelected = selectedTags.includes(tag.id)
            const colorVariant = getTagColor(tag.label)

            return (
              <Badge
                key={tag.id}
                variant={colorVariant}
                selected={isSelected}
                className='cursor-pointer'
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.label}
              </Badge>
            )
          })}
          {tags.length === 0 && (
            <div className='text-sm text-muted-foreground'>
              No tags available
            </div>
          )}
        </div>
      )}

      {currentView === 'media' && (
        <div className='flex flex-wrap gap-2 border-b border-border pb-2'>
          {MEDIA_TYPE_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={mediaTypeFilter === tab.value ? 'default' : 'ghost'}
              size='sm'
              className={`flex items-center gap-1.5 ${
                mediaTypeFilter === tab.value
                  ? ''
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleMediaTypeChange(tab.value)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={handleDeleteConfirm}
          title='Delete Files'
          description={`Are you sure you want to delete ${selectedItems.length} selected file${selectedItems.length === 1 ? '' : 's'}? This action cannot be undone.`}
          confirmText='Delete'
        />
      )}
    </div>
  )
}

export default FileHeader
