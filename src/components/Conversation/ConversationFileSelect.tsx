import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, FileIcon, Search, Tag as TagIcon } from 'lucide-react'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  updateSelectedFiles,
  updateSelectedTags,
} from '@/redux/conversationSlice'
import type { MyFile } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import { getTagColor } from '@/utils/files'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FolderIcon } from '@heroicons/react/24/outline'
import { Separator } from '../ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

const ConversationFileSelect: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const files = useSelector((state: RootState) => state.files.files)
  const tags = useSelector((state: RootState) => state.tags?.tags || [])
  const selectedFiles = useSelector(
    (state: RootState) => state.conversation.selectedFiles
  )
  const selectedTags = useSelector(
    (state: RootState) => state.conversation.selectedTags
  )

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'files' | 'tags'>('files')

  const filteredFiles = useMemo(() => {
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [files, searchQuery])

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tags, searchQuery])

  const handleToggleFile = (file: MyFile) => {
    const newSelectedFiles = selectedFiles.some((f) => f.id === file.id)
      ? selectedFiles.filter((f) => f.id !== file.id)
      : [...selectedFiles, file]
    dispatch(updateSelectedFiles(newSelectedFiles))
  }

  const handleToggleTag = (tag: Tag) => {
    const newSelectedTags = selectedTags.some((t) => t.id === tag.id)
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag]
    dispatch(updateSelectedTags(newSelectedTags))
  }

  const clearSelections = () => {
    dispatch(updateSelectedFiles([]))
    dispatch(updateSelectedTags([]))
  }

  return (
    <div className='absolute left-3 flex h-full items-center'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='ghost' className='h-9 w-9 p-0 hover:bg-transparent'>
            <FolderIcon className='h-5 w-5' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[400px] p-4'
          align='start'
          side='top'
          sideOffset={16}
        >
          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={`Search ${activeTab}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'files' | 'tags')}
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='files'>Files</TabsTrigger>
                <TabsTrigger value='tags'>Tags</TabsTrigger>
              </TabsList>

              <TabsContent value='files' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleToggleFile(file)}
                      className='flex cursor-pointer items-center rounded-md p-2 hover:bg-muted'
                    >
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedFiles.some((f) => f.id === file.id)
                            ? 'border-primary bg-primary'
                            : 'border-input hover:border-muted-foreground'
                        }`}
                      >
                        {selectedFiles.some((f) => f.id === file.id) && (
                          <Check className='h-3 w-3 text-primary-foreground' />
                        )}
                      </div>
                      <FileIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>{file.name}</span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='tags' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredTags.map((tag) => {
                    const isSelected = selectedTags.some((t) => t.id === tag.id)
                    const hasFiles = (tag.fileCount || 0) > 0
                    return (
                      <div
                        key={tag.id}
                        onClick={() => hasFiles && handleToggleTag(tag)}
                        className={`flex items-center rounded-md p-2 ${
                          hasFiles
                            ? 'cursor-pointer hover:bg-muted'
                            : 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div
                          className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-input hover:border-muted-foreground'
                          }`}
                        >
                          {isSelected && (
                            <Check className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                        <TagIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span
                          className={`text-sm ${isSelected ? `text-${getTagColor(tag.label)}-600` : ''}`}
                        >
                          {tag.label}
                        </span>
                        <span className='ml-2 text-xs text-muted-foreground'>
                          ({tag.fileCount || 0})
                        </span>
                      </div>
                    )
                  })}
                  {filteredTags.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No tags found
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className='flex items-center justify-between'>
              <Button variant='ghost' size='sm' onClick={clearSelections}>
                Clear
              </Button>
              <Button size='sm' onClick={() => setOpen(false)}>
                Done ({selectedFiles.length} files, {selectedTags.length} tags)
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationFileSelect
