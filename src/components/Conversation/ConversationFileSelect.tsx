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
    <div className='absolute left-3 flex items-center h-full'>
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
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
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
                <div className='max-h-[300px] overflow-y-auto space-y-1'>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleToggleFile(file)}
                      className='flex items-center p-2 hover:bg-muted rounded-md cursor-pointer'
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                          selectedFiles.some((f) => f.id === file.id)
                            ? 'border-primary bg-primary'
                            : 'border-input hover:border-muted-foreground'
                        }`}
                      >
                        {selectedFiles.some((f) => f.id === file.id) && (
                          <Check className='h-3 w-3 text-primary-foreground' />
                        )}
                      </div>
                      <FileIcon className='h-4 w-4 text-muted-foreground mr-2' />
                      <span className='text-sm'>{file.name}</span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className='text-center text-muted-foreground py-4'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='tags' className='mt-4'>
                <div className='max-h-[300px] overflow-y-auto space-y-1'>
                  {filteredTags.map((tag) => {
                    const isSelected = selectedTags.some((t) => t.id === tag.id)
                    const hasFiles = (tag.fileCount || 0) > 0
                    return (
                      <div
                        key={tag.id}
                        onClick={() => hasFiles && handleToggleTag(tag)}
                        className={`flex items-center p-2 rounded-md ${
                          hasFiles
                            ? 'hover:bg-muted cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-input hover:border-muted-foreground'
                          }`}
                        >
                          {isSelected && (
                            <Check className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                        <TagIcon className='h-4 w-4 text-muted-foreground mr-2' />
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
                    <p className='text-center text-muted-foreground py-4'>
                      No tags found
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className='flex justify-between items-center'>
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
