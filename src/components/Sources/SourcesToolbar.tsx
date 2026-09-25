import { ChevronDown, FolderUp, Search, Tags, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  openModal,
  setMediaTypeFilter,
  setSearchQuery,
  setSelectedTags,
} from '@/redux/fileSlice'
import { MEDIA_TYPE_OPTIONS } from '@/utils/constants/file'

interface SourcesToolbarProps {
  onUploadFolder: () => void
}

const SourcesToolbar = ({ onUploadFolder }: SourcesToolbarProps) => {
  const dispatch = useAppDispatch()
  const { searchQuery, selectedTags, mediaTypeFilter } = useAppSelector(
    (state) => state.files
  )
  const tags = useAppSelector((state) => state.tags.tags)

  const toggleTag = (tagId: number, checked: boolean) =>
    dispatch(
      setSelectedTags(
        checked
          ? [...selectedTags, tagId]
          : selectedTags.filter((id) => id !== tagId)
      )
    )

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div data-tour='files-search' className='relative min-w-56 grow'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='search'
          aria-label='Search sources'
          placeholder='Search names and tags'
          className='pl-9'
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />
      </div>

      <Select
        value={mediaTypeFilter}
        onValueChange={(value) => {
          const option = MEDIA_TYPE_OPTIONS.find((o) => o.value === value)
          if (option) dispatch(setMediaTypeFilter(option.value))
        }}
      >
        <SelectTrigger aria-label='Filter by type' className='w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MEDIA_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' data-tour='files-filter-tags'>
            <Tags className='h-4 w-4' />
            {selectedTags.length > 0 ? `Tags (${selectedTags.length})` : 'Tags'}
            <ChevronDown className='h-4 w-4 opacity-50' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='max-h-72 overflow-y-auto'>
          {tags.length === 0 ? (
            <p className='px-2 py-1.5 text-sm text-muted-foreground'>
              No tags yet
            </p>
          ) : (
            tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedTags.includes(tag.id)}
                onCheckedChange={(checked) => toggleTag(tag.id, checked)}
                onSelect={(e) => e.preventDefault()}
              >
                {tag.label}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button data-tour='files-upload'>
            <Upload className='h-4 w-4' />
            Upload
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => dispatch(openModal())}>
            <Upload className='mr-2 h-4 w-4' />
            Upload files
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onUploadFolder}>
            <FolderUp className='mr-2 h-4 w-4' />
            Upload a folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default SourcesToolbar
