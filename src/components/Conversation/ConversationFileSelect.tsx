import React, { useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Check,
  FileIcon,
  Search,
  Tag as TagIcon,
  Settings,
  Folder,
  Image,
} from 'lucide-react'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  updateSelectedFiles,
  updateSelectedEmbeddings,
  updateSelectedMediaFiles,
  updateSelectedTags,
  updateSelectedFolders,
} from '@/redux/conversationSlice'
import { updateConversationSelectedIds } from '@/redux/asyncThunks/conversation'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import { useDebounce } from '@/utils/debounce'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FolderIcon } from '@heroicons/react/24/outline'
import { Separator } from '../ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Popover as SettingsPopover,
  PopoverContent as SettingsPopoverContent,
  PopoverTrigger as SettingsPopoverTrigger,
} from '../ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import ModelContextSettings from './ModelContextSettings'
import { FileStatus } from '@/utils/constants/file'

const ConversationFileSelect: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const files = useSelector((state: RootState) => state.files.files)
  const folders = useSelector((state: RootState) => state.files.folders)
  const tags = useSelector((state: RootState) => state.tags?.tags || [])
  const selectedFiles = useSelector(
    (state: RootState) => state.conversation.selectedFiles
  )
  const selectedEmbeddings = useSelector(
    (state: RootState) => state.conversation.selectedEmbeddings
  )
  const selectedMediaFiles = useSelector(
    (state: RootState) => state.conversation.selectedMediaFiles
  )
  const selectedTags = useSelector(
    (state: RootState) => state.conversation.selectedTags
  )
  const selectedFolders = useSelector(
    (state: RootState) => state.conversation.selectedFolders
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const user = useSelector((state: RootState) => state.user.user)

  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<
    'files' | 'embeddings' | 'media' | 'tags' | 'folders'
  >('embeddings')

  const saveSelectedIds = useCallback(() => {
    if (activeConversation) {
      const selectedFileIds = selectedFiles.map((file) => file.id)
      const selectedEmbeddingIds = selectedEmbeddings.map((file) => file.id)
      const selectedMediaIds = selectedMediaFiles.map((file) => file.id)

      dispatch(
        updateConversationSelectedIds({
          conversationId: activeConversation.conversationId,
          selectedFileIds,
          selectedEmbeddingIds,
          selectedMediaIds,
        })
      )
    }
  }, [
    dispatch,
    activeConversation,
    selectedFiles,
    selectedEmbeddings,
    selectedMediaFiles,
  ])

  useDebounce(saveSelectedIds, 1000, [
    selectedFiles,
    selectedEmbeddings,
    selectedMediaFiles,
    activeConversation?.conversationId,
  ])

  const filteredFiles = useMemo(() => {
    if (!user || user.vectorDb === undefined) {
      return []
    }

    return files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesVectorDb = file.vectorDbSource === user.vectorDb
      const isProcessed = file.status === FileStatus.PROCESSED
      const isNotMedia = !file.isMedia // Exclude media files from document tabs
      return matchesSearch && matchesVectorDb && isProcessed && isNotMedia
    })
  }, [files, searchQuery, user])

  const filteredMediaFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const isMedia = file.isMedia === true
      const isProcessed = file.status === FileStatus.PROCESSED
      return matchesSearch && isMedia && isProcessed
    })
  }, [files, searchQuery])

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tags, searchQuery])

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [folders, searchQuery])

  const handleToggleFile = (file: MyFile) => {
    const newSelectedFiles = selectedFiles.some((f) => f.id === file.id)
      ? selectedFiles.filter((f) => f.id !== file.id)
      : [...selectedFiles, file]
    dispatch(updateSelectedFiles(newSelectedFiles))
  }

  const handleToggleEmbedding = (file: MyFile) => {
    const newSelectedEmbeddings = selectedEmbeddings.some(
      (f) => f.id === file.id
    )
      ? selectedEmbeddings.filter((f) => f.id !== file.id)
      : [...selectedEmbeddings, file]
    dispatch(updateSelectedEmbeddings(newSelectedEmbeddings))
  }

  const handleToggleMedia = (file: MyFile) => {
    const newSelectedMediaFiles = selectedMediaFiles.some(
      (f) => f.id === file.id
    )
      ? selectedMediaFiles.filter((f) => f.id !== file.id)
      : [...selectedMediaFiles, file]
    dispatch(updateSelectedMediaFiles(newSelectedMediaFiles))
  }

  const handleToggleTag = (tag: Tag) => {
    const newSelectedTags = selectedTags.some((t) => t.id === tag.id)
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag]
    dispatch(updateSelectedTags(newSelectedTags))
  }

  const handleToggleFolder = (folder: MyFolder) => {
    const newSelectedFolders = selectedFolders.some((f) => f.id === folder.id)
      ? selectedFolders.filter((f) => f.id !== folder.id)
      : [...selectedFolders, folder]
    dispatch(updateSelectedFolders(newSelectedFolders))
  }

  const clearSelections = () => {
    dispatch(updateSelectedFiles([]))
    dispatch(updateSelectedEmbeddings([]))
    dispatch(updateSelectedMediaFiles([]))
    dispatch(updateSelectedTags([]))
    dispatch(updateSelectedFolders([]))
  }

  return (
    <div className='left-3 flex h-full items-center'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            className='h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-white/10'
          >
            <FolderIcon className='h-5 w-5 text-muted-foreground transition-colors hover:text-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[500px] border border-border bg-popover p-4'
          align='start'
          side='top'
          sideOffset={8}
        >
          <div className='space-y-4 text-foreground'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={`Search ${activeTab}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 pr-10 dark:border-dark-icon-unselected dark:bg-transparent dark:text-white dark:placeholder-gray-400'
              />
              <SettingsPopover
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
              >
                <SettingsPopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 dark:hover:bg-white/10'
                  >
                    <Settings className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
                  </Button>
                </SettingsPopoverTrigger>
                <SettingsPopoverContent
                  align='start'
                  side='right'
                  sideOffset={12}
                  collisionPadding={20}
                  className='mb-6 w-[24rem] max-w-[90vw] border border-border bg-popover p-4'
                >
                  <ModelContextSettings
                    onClose={() => setSettingsOpen(false)}
                  />
                </SettingsPopoverContent>
              </SettingsPopover>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(
                  value as 'files' | 'embeddings' | 'media' | 'tags' | 'folders'
                )
              }
            >
              <TabsList className='grid w-full grid-cols-5 border-border bg-muted/30 dark:bg-muted/50'>
                <TabsTrigger
                  value='embeddings'
                  className='text-foreground hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:hover:bg-white/10 dark:hover:text-white dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white'
                >
                  Embeddings
                </TabsTrigger>
                <TabsTrigger
                  value='files'
                  className='text-foreground hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:hover:bg-white/10 dark:hover:text-white dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white'
                >
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value='media'
                  className='text-foreground hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:hover:bg-white/10 dark:hover:text-white dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white'
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value='tags'
                  className='text-foreground hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:hover:bg-white/10 dark:hover:text-white dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white'
                >
                  Tags
                </TabsTrigger>
                <TabsTrigger
                  value='folders'
                  className='text-foreground hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm dark:hover:bg-white/10 dark:hover:text-white dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white'
                >
                  Folders
                </TabsTrigger>
              </TabsList>

              <TabsContent value='embeddings' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleToggleEmbedding(file)}
                      className='flex cursor-pointer items-center rounded-md p-2 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
                    >
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedEmbeddings.some((f) => f.id === file.id)
                            ? 'border-primary bg-primary'
                            : 'border-input hover:border-muted-foreground dark:border-dark-icon-unselected dark:hover:border-gray-300'
                        }`}
                      >
                        {selectedEmbeddings.some((f) => f.id === file.id) && (
                          <Check className='h-3 w-3 text-primary-foreground' />
                        )}
                      </div>
                      <FileIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                      <span className='text-sm dark:text-white'>
                        {file.name}
                      </span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='files' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleToggleFile(file)}
                      className='flex cursor-pointer items-center rounded-md p-2 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
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
                      <span
                        className={`text-sm ${selectedFiles.some((f) => f.id === file.id) ? 'font-medium text-primary' : 'text-foreground'}`}
                      >
                        {file.name}
                      </span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='media' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredMediaFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleToggleMedia(file)}
                      className='flex cursor-pointer items-center rounded-md p-2 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'
                    >
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedMediaFiles.some((f) => f.id === file.id)
                            ? 'border-primary bg-primary'
                            : 'border-input hover:border-muted-foreground dark:border-dark-icon-unselected dark:hover:border-gray-300'
                        }`}
                      >
                        {selectedMediaFiles.some((f) => f.id === file.id) && (
                          <Check className='h-3 w-3 text-primary-foreground' />
                        )}
                      </div>
                      <Image className='mr-2 h-4 w-4 text-muted-foreground' />
                      <span
                        className={`text-sm ${selectedMediaFiles.some((f) => f.id === file.id) ? 'font-medium text-primary' : 'text-foreground'} dark:text-white`}
                      >
                        {file.name}
                      </span>
                      <span className='ml-2 text-xs text-muted-foreground'>
                        ({file.mediaType})
                      </span>
                    </div>
                  ))}
                  {filteredMediaFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No media files found
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
                        className={`flex items-center rounded-md p-2 transition-colors ${
                          hasFiles
                            ? isSelected
                              ? 'cursor-pointer bg-blue-100 text-blue-900 dark:bg-white/20 dark:text-white'
                              : 'cursor-pointer text-foreground hover:bg-blue-50 hover:text-blue-900 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'
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
                          className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-foreground'}`}
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

              <TabsContent value='folders' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFolders.map((folder) => {
                    const isSelected = selectedFolders.some(
                      (f) => f.id === folder.id
                    )
                    const hasFiles = folder.fileCount > 0
                    return (
                      <div
                        key={folder.id}
                        onClick={() => hasFiles && handleToggleFolder(folder)}
                        className={`flex items-center rounded-md p-2 transition-colors ${
                          hasFiles
                            ? isSelected
                              ? 'cursor-pointer bg-blue-100 text-blue-900 dark:bg-white/20 dark:text-white'
                              : 'cursor-pointer text-foreground hover:bg-blue-50 hover:text-blue-900 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'
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
                        <Folder className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span
                          className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-foreground'}`}
                        >
                          {folder.name}
                        </span>
                        <span className='ml-2 text-xs text-muted-foreground'>
                          ({folder.fileCount})
                        </span>
                      </div>
                    )
                  })}
                  {filteredFolders.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No folders found
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className='flex items-center justify-between'>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearSelections}
                className='dark:text-white dark:hover:bg-white/10'
              >
                Clear
              </Button>
              <Button
                size='sm'
                onClick={() => setOpen(false)}
                className='dark:bg-dark-button-primary dark:text-white dark:hover:bg-dark-button-primary/80'
              >
                Done ({selectedEmbeddings.length} embeddings,{' '}
                {selectedFiles.length} files, {selectedMediaFiles.length} media,{' '}
                {selectedTags.length} tags, {selectedFolders.length} folders)
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationFileSelect
