import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MoreHorizontal, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import FileStatusPoller from '@/components/FileManager/FileStatusPoller'
import AddChatsDialog from '@/components/Projects/AddChatsDialog'
import DeleteProjectDialog from '@/components/Projects/DeleteProjectDialog'
import PinWorkflowsDialog from '@/components/Projects/PinWorkflowsDialog'
import ProjectChatList from '@/components/Projects/ProjectChatList'
import ProjectComposer from '@/components/Projects/ProjectComposer'
import ProjectIcon from '@/components/Projects/ProjectIcon'
import ProjectSettingsDialog from '@/components/Projects/ProjectSettingsDialog'
import ProjectSettingsRail from '@/components/Projects/ProjectSettingsRail'
import ProjectSourceList from '@/components/Projects/ProjectSourceList'
import ProjectSourcesDialog from '@/components/Projects/ProjectSourcesDialog'
import {
  projectSourceCount,
  projectUploadProblem,
} from '@/components/Projects/projectSources'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createConversation,
  getAvailableModels,
  getConversations,
} from '@/redux/asyncThunks/conversation'
import { getFiles, getFolders, uploadNewFile } from '@/redux/asyncThunks/file'
import { getSharedLibraries } from '@/redux/asyncThunks/library'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import {
  deleteProject,
  moveConversationsToProject,
  updateProject,
} from '@/redux/asyncThunks/project'
import { getWorkflows } from '@/redux/asyncThunks/workflow'
import {
  resetConversation,
  saveDraftForConversation,
  updateActiveConversation,
  updateSelectedTags,
} from '@/redux/conversationSlice'
import { selectLibrariesLoaded } from '@/redux/librarySlice'
import {
  selectProjectById,
  selectProjectConversations,
} from '@/redux/projectSlice'
import type { Conversation } from '@/redux/types/conversation'
import type { ProjectUpdate } from '@/redux/types/project'
import { toast } from '@/utils/toast'

enum ProjectTab {
  CHATS = 'chats',
  SOURCES = 'sources',
}

enum ChatSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE = 'title',
}

const sortChats = (conversations: Conversation[], sort: ChatSort) =>
  [...conversations].sort((a, b) => {
    if (sort === ChatSort.TITLE) {
      return (a.title || '').localeCompare(b.title || '')
    }
    const delta =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return sort === ChatSort.NEWEST ? delta : -delta
  })

const ProjectDetail = () => {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>()
  const projectId = Number(projectIdParam)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { status } = useProjects()
  const project = useAppSelector((state) => selectProjectById(state, projectId))
  const conversations = useAppSelector((state) =>
    selectProjectConversations(state, projectId)
  )
  const chatsStatus = useAppSelector(
    (state) => state.conversation.conversationListStatus
  )
  const librariesLoaded = useAppSelector(selectLibrariesLoaded)
  const modelCatalogStatus = useAppSelector(
    (state) => state.conversation.modelCatalogStatus
  )

  const [tab, setTab] = useState(ProjectTab.CHATS)
  const [chatSort, setChatSort] = useState(ChatSort.NEWEST)
  const [uploading, setUploading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [addChatsOpen, setAddChatsOpen] = useState(false)
  const [workflowsOpen, setWorkflowsOpen] = useState(false)

  useEffect(() => {
    dispatch(getConversations())
    dispatch(getFiles())
    dispatch(getFolders())
    dispatch(getPrompts())
    dispatch(getWorkflows())
  }, [dispatch])

  useEffect(() => {
    if (!librariesLoaded) dispatch(getSharedLibraries())
  }, [librariesLoaded, dispatch])

  useEffect(() => {
    if (modelCatalogStatus === 'idle') dispatch(getAvailableModels())
  }, [modelCatalogStatus, dispatch])

  const sortedChats = useMemo(
    () => sortChats(conversations, chatSort),
    [conversations, chatSort]
  )

  if (!project) {
    return status === 'succeeded' || status === 'failed' ? (
      <div className='flex h-full flex-col items-center justify-center gap-3 px-6 text-center'>
        <p className='text-sm font-medium'>This project does not exist</p>
        <p className='text-sm text-muted-foreground'>
          It may have been deleted.
        </p>
        <Button variant='outline' size='sm' asChild>
          <Link to='/projects'>Back to projects</Link>
        </Button>
      </div>
    ) : (
      <div className='mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10'>
        <Skeleton className='h-10 w-80' />
        <Skeleton className='h-28 w-full rounded-3xl' />
        <Skeleton className='h-48 w-full rounded-2xl' />
      </div>
    )
  }

  const saveUpdate = async (update: ProjectUpdate) => {
    await dispatch(updateProject({ projectId, update })).unwrap()
  }

  const saveQuietly = (update: ProjectUpdate) => {
    saveUpdate(update).catch(() => toast.error('Could not save that change.'))
  }

  const handleStartChat = async (message: string) => {
    try {
      const conversation = await dispatch(
        createConversation({ project: projectId })
      ).unwrap()
      dispatch(updateSelectedTags([]))
      dispatch(resetConversation())
      // The draft keeps the text if the chat still needs a model picked.
      dispatch(
        saveDraftForConversation({
          conversationId: conversation.conversationId,
          text: message,
        })
      )
      dispatch(updateActiveConversation(conversation))
      navigate(`/conversation/${conversation.conversationId}`, {
        state: { initialMessage: message },
      })
    } catch {
      toast.error('Could not start a chat. Try again.')
    }
  }

  const handleUpload = async (files: File[]) => {
    const problems = files.map(projectUploadProblem).filter(Boolean)
    const accepted = files.filter((file) => projectUploadProblem(file) === null)
    if (problems.length) toast.error(problems.join(' '))
    if (!accepted.length) return

    setUploading(true)
    try {
      const uploaded = await dispatch(
        uploadNewFile({ files: accepted, tags: [] })
      ).unwrap()
      await saveUpdate({
        fileIds: [...project.fileIds, ...uploaded.map((file) => file.id)],
      })
      toast.success(
        `Added ${uploaded.length} ${uploaded.length === 1 ? 'document' : 'documents'} — processing now`
      )
    } catch {
      toast.error('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const moveChats = async (
    conversationIds: string[],
    target: number | null
  ) => {
    const { failedCount } = await dispatch(
      moveConversationsToProject({ conversationIds, projectId: target })
    ).unwrap()
    if (failedCount > 0) {
      throw failedCount === conversationIds.length
        ? 'Could not move the chats. Try again.'
        : `${failedCount} of ${conversationIds.length} chats could not be moved.`
    }
  }

  const handleRemoveChat = (conversation: Conversation) => {
    moveChats([conversation.conversationId], null)
      .then(() => toast.success('Moved back to your conversations'))
      .catch(() => toast.error('Could not remove the chat from the project.'))
  }

  const handleDelete = async (deleteConversations: boolean) => {
    await dispatch(deleteProject({ projectId, deleteConversations })).unwrap()
    toast.success(`Deleted “${project.name}”`)
    navigate('/projects')
  }

  const sourceCount = projectSourceCount(project)
  const chatsLoading = chatsStatus !== 'succeeded' && conversations.length === 0

  const tabs = [
    { value: ProjectTab.CHATS, label: 'Chats', count: conversations.length },
    { value: ProjectTab.SOURCES, label: 'Sources', count: sourceCount },
  ]

  return (
    <div className='h-full overflow-y-auto'>
      <FileStatusPoller />
      <div className='mx-auto grid max-w-6xl gap-8 px-6 pt-8 pb-16 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='mx-auto w-full max-w-3xl min-w-0'>
          <nav
            aria-label='Breadcrumb'
            className='mb-4 text-sm text-muted-foreground'
          >
            <Link to='/projects' className='hover:text-foreground'>
              Projects
            </Link>
          </nav>

          <header className='mb-6 flex items-start justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <ProjectIcon icon={project.icon} tile className='h-11 w-11' />
              <div className='min-w-0'>
                <h1 className='truncate text-3xl font-semibold tracking-tight'>
                  {project.name}
                </h1>
                {project.description && (
                  <p className='truncate text-sm text-muted-foreground'>
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              <Button
                variant='outline'
                className='rounded-full'
                aria-label='Project settings'
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Settings</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='rounded-full'
                    aria-label='More project actions'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onSelect={() => setAddChatsOpen(true)}>
                    Add existing chats
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setWorkflowsOpen(true)}>
                    Pin workflows
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onSelect={() => setDeleteOpen(true)}
                  >
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <ProjectComposer project={project} onStart={handleStartChat} />

          <div className='mt-8 mb-2 flex items-center justify-between gap-3'>
            <div
              role='tablist'
              aria-label='Project content'
              className='flex gap-1'
            >
              {tabs.map(({ value, label, count }) => (
                <button
                  key={value}
                  role='tab'
                  id={`project-tab-${value}`}
                  aria-selected={tab === value}
                  aria-controls={`project-panel-${value}`}
                  onClick={() => setTab(value)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm transition-colors',
                    tab === value
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  <span className='ml-1.5 text-xs text-muted-foreground tabular-nums'>
                    {count}
                  </span>
                </button>
              ))}
            </div>
            {tab === ProjectTab.CHATS && conversations.length > 1 && (
              <Select
                value={chatSort}
                onValueChange={(value) =>
                  setChatSort(
                    Object.values(ChatSort).find((sort) => sort === value) ??
                      ChatSort.NEWEST
                  )
                }
              >
                <SelectTrigger
                  aria-label='Sort chats'
                  className='h-8 w-auto gap-1 rounded-full border-none bg-transparent text-sm text-muted-foreground shadow-none hover:text-foreground'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align='end'>
                  <SelectItem value={ChatSort.NEWEST}>Newest</SelectItem>
                  <SelectItem value={ChatSort.OLDEST}>Oldest</SelectItem>
                  <SelectItem value={ChatSort.TITLE}>Title</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div
            role='tabpanel'
            id={`project-panel-${tab}`}
            aria-labelledby={`project-tab-${tab}`}
          >
            {tab === ProjectTab.CHATS ? (
              chatsLoading ? (
                <div className='flex flex-col gap-2 pt-2'>
                  {[0, 1, 2].map((key) => (
                    <Skeleton key={key} className='h-14 rounded-xl' />
                  ))}
                </div>
              ) : (
                <>
                  <ProjectChatList
                    conversations={sortedChats}
                    onOpen={(conversation) => {
                      dispatch(updateActiveConversation(conversation))
                      navigate(`/conversation/${conversation.conversationId}`)
                    }}
                    onRemove={handleRemoveChat}
                    onAddExisting={() => setAddChatsOpen(true)}
                  />
                  {conversations.length === 0 && (
                    <p className='px-3 pt-6 text-sm text-muted-foreground'>
                      Chats you start above appear here, using this project's
                      instructions and sources.
                    </p>
                  )}
                </>
              )
            ) : (
              <ProjectSourceList
                project={project}
                uploading={uploading}
                onUpload={handleUpload}
                onChooseExisting={() => setSourcesOpen(true)}
                onRemove={saveQuietly}
              />
            )}
          </div>
        </div>

        <div className='hidden xl:block'>
          <div className='sticky top-8'>
            <ProjectSettingsRail
              project={project}
              onEditSettings={() => setSettingsOpen(true)}
              onPinWorkflows={() => setWorkflowsOpen(true)}
              onUnpinWorkflow={(workflowId) =>
                saveQuietly({
                  workflowIds: project.workflowIds.filter(
                    (id) => id !== workflowId
                  ),
                })
              }
            />
          </div>
        </div>
      </div>

      <ProjectSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        project={project}
        onSave={saveUpdate}
        onDelete={() => {
          setSettingsOpen(false)
          setDeleteOpen(true)
        }}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        project={project}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
      <ProjectSourcesDialog
        open={sourcesOpen}
        onOpenChange={setSourcesOpen}
        project={project}
        onSave={saveUpdate}
      />
      <PinWorkflowsDialog
        open={workflowsOpen}
        onOpenChange={setWorkflowsOpen}
        pinnedIds={project.workflowIds}
        onSave={(workflowIds) => saveUpdate({ workflowIds })}
      />
      <AddChatsDialog
        open={addChatsOpen}
        onOpenChange={setAddChatsOpen}
        projectName={project.name}
        onAdd={(conversationIds) => moveChats(conversationIds, projectId)}
      />
    </div>
  )
}

export default ProjectDetail
