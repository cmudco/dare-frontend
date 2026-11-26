import { DOCUMENT_PARSER_LABELS } from '@/utils/constants/file'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
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
  updateRagMode,
  setSourcePickerOpen,
} from '@/redux/conversationSlice'
import {
  selectAddedLibraries,
  selectLibrariesLoaded,
} from '@/redux/librarySlice'
import { getSharedLibraries } from '@/redux/asyncThunks/library'
import {
  updateConversation,
  updateConversationSelectedIds,
} from '@/redux/asyncThunks/conversation'
import { listGraphsAPI } from '@/api/knowledgeGraph'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { RagMode } from '@/utils/constants/conversation'
import { toast } from '@/utils/toast'
import type { MyFile, MyFolder } from '@/redux/types/files'
import type { Tag } from '@/redux/types/tags'
import type { SharedLibrary } from '@/redux/types/library'
import { useDebounce } from '@/utils/debounce'
import { useOwnerFiles } from '@/hooks/useOwnerFiles'
import { getConversationFileOwnerId } from '@/hooks/useConversationFiles'
import { selectProjectById } from '@/redux/projectSlice'

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
import GraphSourceList from './GraphSourceList'
import SourceCheck from './SourceCheck'
import ModelContextSettings from './ModelContextSettings'
import { FileStatus } from '@/utils/constants/file'
import { supportsCodeSandbox } from '@/utils/modelConfigUtils'
import { isSpreadsheetFile } from '@/utils/spreadsheet/protocol'
import { useSourceSize } from '@/hooks/useSourceSize'
import { formatTokenCount } from '../Projects/projectSources'

// Tables are searched by a summary card, so their parser is not the story.
const sourceLabel = (
  name: string,
  parserName: keyof typeof DOCUMENT_PARSER_LABELS
): string =>
  isSpreadsheetFile(name) ? 'Table' : DOCUMENT_PARSER_LABELS[parserName]

const NO_FOLDERS: number[] = []

type SourceTab =
  | 'files'
  | 'embeddings'
  | 'media'
  | 'tags'
  | 'folders'
  | 'libraries'
  | 'graphs'

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
  const sandboxOn = useSelector(
    (state: RootState) =>
      state.conversation.activeConversation?.codeSandboxEnabled ??
      state.conversation.codeSandboxEnabled
  )
  const sandboxAvailable = useSelector((state: RootState) =>
    supportsCodeSandbox(
      state.conversation.pickerEntries.find(
        (entry) => entry.id === state.conversation.selectedModel
      ),
      state.conversation.activeWalletMeta
    )
  )
  const selectedModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
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
  const project = useSelector((state: RootState) =>
    selectProjectById(state, activeConversation?.project)
  )

  const open = useSelector(
    (state: RootState) => state.conversation.sourcePickerOpen
  )
  const setOpen = useCallback(
    (next: boolean) => dispatch(setSourcePickerOpen(next)),
    [dispatch]
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectionDirty, setSelectionDirty] = useState(false)
  const [showAllSources, setShowAllSources] = useState(false)
  const [activeTab, setActiveTab] = useState<SourceTab>('embeddings')
  const [graphs, setGraphs] = useState<KnowledgeGraphSummary[] | null>(null)

  useEffect(() => {
    if (!open) return
    listGraphsAPI()
      .then(setGraphs)
      .catch(() => {
        setGraphs([])
        toast.error("Couldn't load your knowledge graphs.")
      })
  }, [open])

  useEffect(() => {
    if (open && !librariesLoaded) {
      dispatch(getSharedLibraries())
    }
  }, [open, librariesLoaded, dispatch])

  useEffect(() => {
    setSelectionDirty(false)
    setShowAllSources(false)
    setOpen(false)
  }, [activeConversation?.conversationId, setOpen])

  // A project chat lists only the project's sources, plus anything already
  // selected so it can still be unchecked. Media and tags are never scoped.
  const projectScope = useMemo(() => {
    if (!project) return null
    const { fileIds, folderIds, libraryIds } = project
    if (fileIds.length + folderIds.length + libraryIds.length === 0) return null
    const fileSet = new Set(fileIds)
    folders
      .filter((folder) => folderIds.includes(folder.id))
      .forEach((folder) => folder.files.forEach((f) => fileSet.add(f.id)))
    return {
      fileIds: fileSet,
      folderIds: new Set(folderIds),
      libraryIds: new Set(libraryIds),
    }
  }, [project, folders])
  const scope = showAllSources ? null : projectScope

  // Fetch and merge owner files for forked or shared conversations
  const effectiveOwnerId = getConversationFileOwnerId(activeConversation)
  const { allFiles, ownerFiles } = useOwnerFiles(files, effectiveOwnerId)

  // Helper to check if a file is from the owner (shared)
  const isOwnerFile = useCallback(
    (fileId: number) => ownerFiles.some((f) => f.id === fileId),
    [ownerFiles]
  )

  const saveSelectedIds = useCallback(() => {
    if (!selectionDirty) {
      return
    }

    // Only save selected IDs if user owns the conversation
    // Skip for shared conversations viewed from library (before forking)
    if (activeConversation && activeConversation.isOwner !== false) {
      const selectedFileIds = selectedFiles.map((file) => file.id)
      const selectedEmbeddingIds = selectedEmbeddings.map((file) => file.id)
      const selectedMediaIds = selectedMediaFiles.map((file) => file.id)
      const selectedLibraryIds = selectedLibraries.map((library) => library.id)

      dispatch(
        updateConversationSelectedIds({
          conversationId: activeConversation.conversationId,
          selectedFileIds,
          selectedEmbeddingIds,
          selectedMediaIds,
          selectedLibraryIds,
        })
      )
    }
  }, [
    dispatch,
    activeConversation,
    selectedFiles,
    selectedEmbeddings,
    selectedMediaFiles,
    selectedLibraries,
    selectionDirty,
  ])

  useDebounce(saveSelectedIds, 1000, [
    selectedFiles,
    selectedEmbeddings,
    selectedMediaFiles,
    selectedLibraries,
    selectionDirty,
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
      const inScope =
        !scope ||
        scope.fileIds.has(file.id) ||
        selectedEmbeddings.some((f) => f.id === file.id) ||
        selectedFiles.some((f) => f.id === file.id)
      return (
        matchesSearch && matchesVectorDb && isProcessed && isNotMedia && inScope
      )
    })
  }, [
    allFiles,
    ownerFiles,
    searchQuery,
    user,
    scope,
    selectedEmbeddings,
    selectedFiles,
  ])

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
    return folders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!scope ||
          scope.folderIds.has(folder.id) ||
          selectedFolders.some((f) => f.id === folder.id))
    )
  }, [folders, searchQuery, scope, selectedFolders])

  const filteredLibraries = useMemo(() => {
    return addedLibraries.filter(
      (library) =>
        library.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!scope ||
          scope.libraryIds.has(library.id) ||
          selectedLibraries.some((l) => l.id === library.id))
    )
  }, [addedLibraries, searchQuery, scope, selectedLibraries])

  const handleToggleFile = (file: MyFile) => {
    const newSelectedFiles = selectedFiles.some((f) => f.id === file.id)
      ? selectedFiles.filter((f) => f.id !== file.id)
      : [...selectedFiles, file]
    setSelectionDirty(true)
    dispatch(updateSelectedFiles(newSelectedFiles))
  }

  const handleToggleEmbedding = (file: MyFile) => {
    const newSelectedEmbeddings = selectedEmbeddings.some(
      (f) => f.id === file.id
    )
      ? selectedEmbeddings.filter((f) => f.id !== file.id)
      : [...selectedEmbeddings, file]
    setSelectionDirty(true)
    dispatch(updateSelectedEmbeddings(newSelectedEmbeddings))
  }

  const handleToggleMedia = (file: MyFile) => {
    const newSelectedMediaFiles = selectedMediaFiles.some(
      (f) => f.id === file.id
    )
      ? selectedMediaFiles.filter((f) => f.id !== file.id)
      : [...selectedMediaFiles, file]
    setSelectionDirty(true)
    dispatch(updateSelectedMediaFiles(newSelectedMediaFiles))
  }

  const handleToggleTag = (tag: Tag) => {
    const newSelectedTags = selectedTags.some((t) => t.id === tag.id)
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag]
    setSelectionDirty(true)
    dispatch(updateSelectedTags(newSelectedTags))
  }

  const handleToggleFolder = (folder: MyFolder) => {
    const newSelectedFolders = selectedFolders.some((f) => f.id === folder.id)
      ? selectedFolders.filter((f) => f.id !== folder.id)
      : [...selectedFolders, folder]
    setSelectionDirty(true)
    dispatch(updateSelectedFolders(newSelectedFolders))
  }

  const handleToggleLibrary = (library: SharedLibrary) => {
    const newSelectedLibraries = selectedLibraries.some(
      (l) => l.id === library.id
    )
      ? selectedLibraries.filter((l) => l.id !== library.id)
      : [...selectedLibraries, library]
    setSelectionDirty(true)
    dispatch(updateSelectedLibraries(newSelectedLibraries))
  }

  // A graph is a set of documents, so picking one ticks its embeddings.
  const graphFiles = useCallback(
    (graph: KnowledgeGraphSummary) => {
      const ids = new Set(graph.fileIds)
      return allFiles.filter(
        (file) =>
          ids.has(file.id) &&
          file.status === FileStatus.PROCESSED &&
          !file.isMedia
      )
    },
    [allFiles]
  )
  // A small graph inside a bigger ticked one is not a second pick.
  const selectedGraphs = useMemo(() => {
    const picked = new Set(selectedEmbeddings.map((file) => file.id))
    const covered = (graphs ?? [])
      .map((graph) => ({
        graph,
        ids: graphFiles(graph).map((file) => file.id),
      }))
      .filter(({ ids }) => ids.length > 0 && ids.every((id) => picked.has(id)))
    return covered
      .filter(
        ({ ids }) =>
          !covered.some(
            (other) =>
              other.ids.length > ids.length &&
              ids.every((id) => other.ids.includes(id))
          )
      )
      .map(({ graph }) => graph)
  }, [graphs, graphFiles, selectedEmbeddings])
  const filteredGraphs = useMemo(
    () =>
      graphs?.filter((graph) =>
        graph.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? null,
    [graphs, searchQuery]
  )

  const setRagMode = (mode: RagMode) => {
    if (!activeConversation || activeConversation.ragMode === mode) return
    dispatch(updateRagMode(mode))
    if (activeConversation.isOwner !== false) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { ragMode: mode },
        })
      )
    }
  }

  const handleToggleGraph = (graph: KnowledgeGraphSummary) => {
    const members = graphFiles(graph)
    if (members.length === 0) {
      toast.error("This graph's documents are still processing.")
      return
    }
    const memberIds = new Set(members.map((file) => file.id))
    const others = selectedEmbeddings.filter((file) => !memberIds.has(file.id))
    const wasSelected = selectedGraphs.some((item) => item.id === graph.id)
    setSelectionDirty(true)
    dispatch(
      updateSelectedEmbeddings(wasSelected ? others : [...others, ...members])
    )
    if (!wasSelected) {
      setRagMode(RagMode.GRAPH)
    } else if (
      selectedGraphs.length === 1 &&
      activeConversation?.ragMode === RagMode.GRAPH
    ) {
      setRagMode(RagMode.ADVANCED)
    }
  }

  const sourceTabs: { value: SourceTab; label: string; count: number }[] = [
    {
      value: 'embeddings',
      label: 'Embeddings',
      count: selectedEmbeddings.length,
    },
    { value: 'files', label: 'Files', count: selectedFiles.length },
    { value: 'media', label: 'Media', count: selectedMediaFiles.length },
    { value: 'tags', label: 'Tags', count: selectedTags.length },
    { value: 'folders', label: 'Folders', count: selectedFolders.length },
    { value: 'libraries', label: 'Libraries', count: selectedLibraries.length },
    { value: 'graphs', label: 'Graphs', count: selectedGraphs.length },
  ]
  const totalSelected =
    selectedEmbeddings.length +
    selectedFiles.length +
    selectedMediaFiles.length +
    selectedTags.length +
    selectedFolders.length +
    selectedLibraries.length
  // Tables ticked under either tab are sent to the sandbox.
  const isTable = (file: MyFile) => isSpreadsheetFile(file.name ?? '')
  const tableInFiles = selectedFiles.some(isTable)
  const tableInEmbeddings = selectedEmbeddings.some(isTable)
  const tableHint =
    tableInFiles || tableInEmbeddings
      ? sandboxOn && sandboxAvailable
        ? 'Code sandbox is on: the AI will analyze the whole table.'
        : sandboxAvailable
          ? 'To process this file or run any calculations on it, turn on Code sandbox in chat settings.'
          : "This model can't run code. To process this file or run any calculations on it, pick an OpenAI or Claude model and turn on Code sandbox."
      : null
  const readSize = useSourceSize(
    selectedFiles.map((file) => file.id),
    NO_FOLDERS,
    selectedModel
  )
  const readNote =
    readSize.status !== 'ready'
      ? null
      : readSize.refreshing
        ? `Counting tokens for ${selectedFiles.length === 1 ? 'this file' : 'these files'} on this model…`
        : readSize.size.fitsFullFiles
          ? `The AI reads ${selectedFiles.length === 1 ? 'this file' : 'these files'} in full (${formatTokenCount(readSize.size.estimatedTokens, readSize.size.estimated)}).`
          : null

  const footerNotes = [
    { key: 'read', text: readNote },
    { key: 'table', text: tableHint },
  ].filter((note): note is { key: string; text: string } => Boolean(note.text))

  const clearSelections = () => {
    setSelectionDirty(true)
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
          <MotionConfig reducedMotion='user'>
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

              {projectScope && project && (
                <div className='flex items-center justify-between gap-2 text-xs text-muted-foreground'>
                  <span className='truncate'>
                    {showAllSources
                      ? 'Showing all your sources'
                      : `Showing sources in ${project.name}`}
                  </span>
                  <Button
                    variant='link'
                    size='sm'
                    onClick={() => setShowAllSources((v) => !v)}
                    className='h-auto shrink-0 p-0 text-xs'
                  >
                    {showAllSources ? 'Project only' : 'Show all'}
                  </Button>
                </div>
              )}

              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as SourceTab)}
              >
                <TabsList className='flex w-full overflow-x-auto border-border bg-muted/50'>
                  {sourceTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className='relative flex-auto px-1 text-xs text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'
                    >
                      {activeTab === tab.value && (
                        <motion.span
                          layoutId='source-tab-pill'
                          className='absolute inset-0 rounded-sm bg-background shadow-xs'
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 34,
                          }}
                        />
                      )}
                      <span className='relative'>{tab.label}</span>
                      <AnimatePresence initial={false}>
                        {tab.count > 0 && (
                          <motion.span
                            key={tab.count}
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 700,
                              damping: 20,
                            }}
                            className='absolute -top-1 -right-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 font-medium text-primary-foreground tabular-nums'
                          >
                            {tab.count}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value='embeddings' className='mt-4'>
                  <p className='mb-2 px-1 text-xs text-muted-foreground'>
                    Searches these files and gives the AI only the most relevant
                    passages.
                  </p>
                  <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                    {filteredFiles.map((file) => {
                      const isShared = isOwnerFile(file.id)
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleToggleEmbedding(file)}
                          className='flex cursor-pointer items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground'
                        >
                          <SourceCheck
                            checked={selectedEmbeddings.some(
                              (f) => f.id === file.id
                            )}
                          />
                          <FileIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span className='flex-1 text-sm text-foreground'>
                            {file.name}
                            {file.parserName && (
                              <span className='ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                                {sourceLabel(file.name ?? '', file.parserName)}
                              </span>
                            )}
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
                  <p className='mb-2 px-1 text-xs text-muted-foreground'>
                    Gives the AI the whole file.
                  </p>
                  <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                    {filteredFiles.map((file) => {
                      const isShared = isOwnerFile(file.id)
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleToggleFile(file)}
                          className='flex cursor-pointer items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground'
                        >
                          <SourceCheck
                            checked={selectedFiles.some(
                              (f) => f.id === file.id
                            )}
                          />
                          <FileIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span
                            className={`flex-1 text-sm ${selectedFiles.some((f) => f.id === file.id) ? 'text-primary' : 'text-foreground'}`}
                          >
                            {file.name}
                            {file.parserName && (
                              <span className='ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                                {sourceLabel(file.name ?? '', file.parserName)}
                              </span>
                            )}
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
                          <SourceCheck
                            checked={selectedMediaFiles.some(
                              (f) => f.id === file.id
                            )}
                          />
                          <Image className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span
                            className={`flex-1 text-sm ${selectedMediaFiles.some((f) => f.id === file.id) ? 'text-primary' : 'text-foreground'}`}
                          >
                            {file.name}
                            {file.parserName && (
                              <span className='ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                                {sourceLabel(file.name ?? '', file.parserName)}
                              </span>
                            )}
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
                      const isSelected = selectedTags.some(
                        (t) => t.id === tag.id
                      )
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
                          <SourceCheck checked={isSelected} />
                          <TagIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span
                            className={`text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}
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
                          <SourceCheck checked={isSelected} />
                          <Folder className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span
                            className={`text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}
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
                          <SourceCheck checked={isSelected} />
                          <Library className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span
                            className={`flex-1 text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}
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

                <TabsContent value='graphs' className='mt-4'>
                  <GraphSourceList
                    graphs={filteredGraphs}
                    selectedIds={
                      new Set(selectedGraphs.map((graph) => graph.id))
                    }
                    onToggle={handleToggleGraph}
                  />
                </TabsContent>
              </Tabs>

              <Separator />

              <div>
                <AnimatePresence initial={false}>
                  {footerNotes.map((note) => (
                    <motion.div
                      key={note.key}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className='overflow-hidden'
                    >
                      <p
                        className={`mb-2 text-xs text-muted-foreground ${note.key === 'table' ? 'rounded-md bg-muted px-2 py-1.5' : 'px-1'}`}
                      >
                        {note.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
          </MotionConfig>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ConversationFileSelect
