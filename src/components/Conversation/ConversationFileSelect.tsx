import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Check,
  FileIcon,
  Search,
  Tag as TagIcon,
  Settings,
  Folder,
  Image,
  Users,
  Library,
} from 'lucide-react'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  updateSelectedFiles,
  updateSelectedEmbeddings,
  updateSelectedMediaFiles,
  updateSelectedTags,
  updateSelectedFolders,
  updateSelectedLibraries,
} from '@/redux/conversationSlice'
import {
  selectAddedLibraries,
  selectLibrariesLoaded,
} from '@/redux/librarySlice'
import { getSharedLibraries } from '@/redux/asyncThunks/library'
import { updateConversationSelectedIds } from '@/redux/asyncThunks/conversation'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import type { SharedLibrary } from '@/redux/types/library'
import { useDebounce } from '@/utils/debounce'
import { useOwnerFiles } from '@/hooks/useOwnerFiles'
import { getConversationFileOwnerId } from '@/hooks/useConversationFiles'

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
  const selectedLibraries = useSelector(
    (state: RootState) => state.conversation.selectedLibraries
  )
  const addedLibraries = useSelector(selectAddedLibraries)
  const librariesLoaded = useSelector(selectLibrariesLoaded)
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const user = useSelector((state: RootState) => state.user.user)

  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<
    'files' | 'embeddings' | 'media' | 'tags' | 'folders' | 'libraries'
  >('embeddings')

  useEffect(() => {
    if (open && !librariesLoaded) {
      dispatch(getSharedLibraries())
    }
  }, [open, librariesLoaded, dispatch])

  // Fetch and merge owner files for forked or shared conversations
  const effectiveOwnerId = getConversationFileOwnerId(activeConversation)
  const { allFiles, ownerFiles } = useOwnerFiles(files, effectiveOwnerId)

  // Helper to check if a file is from the owner (shared)
  const isOwnerFile = useCallback(
    (fileId: number) => ownerFiles.some((f) => f.id === fileId),
    [ownerFiles]
  )

  const saveSelectedIds = useCallback(() => {
    // Only save selected IDs if user owns the conversation
    // Skip for shared conversations viewed from library (before forking)
    if (activeConversation && activeConversation.isOwner !== false) {
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

    return allFiles.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      // For owner files, allow all vector DB sources since they're already shared
      const isOwnerFile = ownerFiles.some((f) => f.id === file.id)
      const matchesVectorDb =
        isOwnerFile || file.vectorDbSource === user.vectorDb
      const isProcessed = file.status === FileStatus.PROCESSED
      const isNotMedia = !file.isMedia // Exclude media files from document tabs
      return matchesSearch && matchesVectorDb && isProcessed && isNotMedia
    })
  }, [allFiles, ownerFiles, searchQuery, user])

  const filteredMediaFiles = useMemo(() => {
    return allFiles.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const isMedia = file.isMedia === true
      const isProcessed = file.status === FileStatus.PROCESSED
      return matchesSearch && isMedia && isProcessed
    })
  }, [allFiles, searchQuery])

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

  const filteredLibraries = useMemo(() => {
    return addedLibraries.filter((library) =>
      library.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [addedLibraries, searchQuery])

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

  const handleToggleLibrary = (library: SharedLibrary) => {
    const newSelectedLibraries = selectedLibraries.some(
      (l) => l.id === library.id
    )
      ? selectedLibraries.filter((l) => l.id !== library.id)
      : [...selectedLibraries, library]
    dispatch(updateSelectedLibraries(newSelectedLibraries))
  }

  const selectionCounts = [
    { n: selectedEmbeddings.length, label: 'embeddings' },
    { n: selectedFiles.length, label: 'files' },
    { n: selectedMediaFiles.length, label: 'media' },
    { n: selectedTags.length, label: 'tags' },
    { n: selectedFolders.length, label: 'folders' },
    { n: selectedLibraries.length, label: 'libraries' },
  ]
  const totalSelected = selectionCounts.reduce((sum, c) => sum + c.n, 0)
  const selectionSummary = selectionCounts
    .filter((c) => c.n > 0)
    .map((c) => `${c.n} ${c.label}`)
    .join(' · ')

  const clearSelections = () => {
    dispatch(updateSelectedFiles([]))
    dispatch(updateSelectedEmbeddings([]))
    dispatch(updateSelectedMediaFiles([]))
    dispatch(updateSelectedTags([]))
    dispatch(updateSelectedFolders([]))
    dispatch(updateSelectedLibraries([]))
  }

  return (
    <div data-tour='file-select' className='left-3 flex h-full items-center'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='ghost' className='h-9 w-9 p-0 hover:bg-accent'>
            <FolderIcon className='h-5 w-5 text-muted-foreground transition-colors hover:text-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[min(500px,calc(100vw-2rem))] border border-border bg-popover p-4'
          align='start'
          side='top'
          sideOffset={8}
        >
          <div className='space-y-4 text-foreground'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder={`Search ${activeTab}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-10 pl-9'
              />
              <SettingsPopover
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
              >
                <SettingsPopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0 hover:bg-accent'
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
              <TabsList className='grid w-full grid-cols-6 border-border bg-muted/50'>
                <TabsTrigger
                  value='embeddings'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Embeddings
                </TabsTrigger>
                <TabsTrigger
                  value='files'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value='media'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value='tags'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Tags
                </TabsTrigger>
                <TabsTrigger
                  value='folders'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Folders
                </TabsTrigger>
                <TabsTrigger
                  value='libraries'
                  className='text-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs'
                >
                  Libraries
                </TabsTrigger>
              </TabsList>

              <TabsContent value='embeddings' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFiles.map((file) => {
                    const isShared = isOwnerFile(file.id)
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleToggleEmbedding(file)}
                        className='flex cursor-pointer items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground'
                      >
                        <div
                          className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                            selectedEmbeddings.some((f) => f.id === file.id)
                              ? 'border-primary bg-primary'
                              : 'border-input hover:border-muted-foreground'
                          }`}
                        >
                          {selectedEmbeddings.some((f) => f.id === file.id) && (
                            <Check className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                        <FileIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span className='flex-1 text-sm text-foreground'>
                          {file.name}
                        </span>
                        {isShared && (
                          <Users className='ml-2 h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                        )}
                      </div>
                    )
                  })}
                  {filteredFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='files' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredFiles.map((file) => {
                    const isShared = isOwnerFile(file.id)
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleToggleFile(file)}
                        className='flex cursor-pointer items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground'
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
                          className={`flex-1 text-sm ${selectedFiles.some((f) => f.id === file.id) ? 'font-medium text-primary' : 'text-foreground'}`}
                        >
                          {file.name}
                        </span>
                        {isShared && (
                          <Users className='ml-2 h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                        )}
                      </div>
                    )
                  })}
                  {filteredFiles.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No files found
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='media' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredMediaFiles.map((file) => {
                    const isShared = isOwnerFile(file.id)
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleToggleMedia(file)}
                        className='flex cursor-pointer items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground'
                      >
                        <div
                          className={`mr-3 flex h-5 w-5 items-center justify-center rounded border-2 ${
                            selectedMediaFiles.some((f) => f.id === file.id)
                              ? 'border-primary bg-primary'
                              : 'border-input hover:border-muted-foreground'
                          }`}
                        >
                          {selectedMediaFiles.some((f) => f.id === file.id) && (
                            <Check className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                        <Image className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span
                          className={`flex-1 text-sm ${selectedMediaFiles.some((f) => f.id === file.id) ? 'font-medium text-primary' : 'text-foreground'}`}
                        >
                          {file.name}
                        </span>
                        <span className='ml-1 text-xs text-muted-foreground'>
                          ({file.mediaType})
                        </span>
                        {isShared && (
                          <Users className='ml-2 h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                        )}
                      </div>
                    )
                  })}
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
                              ? 'cursor-pointer bg-accent text-accent-foreground'
                              : 'cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground'
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
                              ? 'cursor-pointer bg-accent text-accent-foreground'
                              : 'cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground'
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

              <TabsContent value='libraries' className='mt-4'>
                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                  {filteredLibraries.map((library) => {
                    const isSelected = selectedLibraries.some(
                      (l) => l.id === library.id
                    )
                    return (
                      <div
                        key={library.id}
                        onClick={() => handleToggleLibrary(library)}
                        className={`flex items-center rounded-md p-2 transition-colors ${
                          isSelected
                            ? 'cursor-pointer bg-accent text-accent-foreground'
                            : 'cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground'
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
                        <Library className='mr-2 h-4 w-4 text-muted-foreground' />
                        <span
                          className={`flex-1 text-sm ${isSelected ? 'font-medium text-primary' : 'text-foreground'}`}
                        >
                          {library.name}
                        </span>
                        <span className='ml-2 text-xs text-muted-foreground'>
                          {library.curator}
                        </span>
                      </div>
                    )
                  })}
                  {filteredLibraries.length === 0 && (
                    <p className='py-4 text-center text-muted-foreground'>
                      No libraries added yet
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className='space-y-2'>
              {totalSelected > 0 && (
                <p className='px-1 text-xs text-muted-foreground'>
                  {selectionSummary}
                </p>
              )}
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearSelections}
                  className='text-foreground hover:bg-accent'
                >
                  Clear
                </Button>
                <Button
                  size='sm'
                  onClick={() => setOpen(false)}
                  className='bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  Done{totalSelected > 0 ? ` (${totalSelected})` : ''}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationFileSelect
