import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
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
import { Skeleton } from '@/components/ui/skeleton'
import CreateProjectDialog from '@/components/Projects/CreateProjectDialog'
import DeleteProjectDialog from '@/components/Projects/DeleteProjectDialog'
import ProjectIcon from '@/components/Projects/ProjectIcon'
import { useProjects } from '@/hooks/useProjects'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createProject,
  deleteProject,
  fetchProjects,
} from '@/redux/asyncThunks/project'
import { selectProjectsError } from '@/redux/projectSlice'
import type { Project, ProjectDraft } from '@/redux/types/project'
import { ProjectIconKey } from '@/utils/constants/project'
import { formatRelativeDate } from '@/utils/dateUtils'
import { toast } from '@/utils/toast'

enum ProjectSort {
  ACTIVE = 'active',
  NAME = 'name',
  CREATED = 'created',
}

const sortProjects = (projects: Project[], sort: ProjectSort) => {
  if (sort === ProjectSort.ACTIVE) return projects
  return [...projects].sort((a, b) =>
    sort === ProjectSort.NAME
      ? a.name.localeCompare(b.name)
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

const ProjectsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projects, status } = useProjects()
  const error = useAppSelector(selectProjectsError)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(ProjectSort.ACTIVE)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matching = needle
      ? projects.filter(
          (project) =>
            project.name.toLowerCase().includes(needle) ||
            project.description.toLowerCase().includes(needle)
        )
      : projects
    return sortProjects(matching, sort)
  }, [projects, query, sort])

  const handleCreate = async (draft: ProjectDraft) => {
    const project = await dispatch(createProject(draft)).unwrap()
    navigate(`/projects/${project.id}`)
  }

  const handleDelete = async (deleteConversations: boolean) => {
    if (!deleting) return
    await dispatch(
      deleteProject({ projectId: deleting.id, deleteConversations })
    ).unwrap()
    toast.success(`Deleted “${deleting.name}”`)
  }

  const isInitialLoad = status !== 'succeeded' && projects.length === 0

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mx-auto max-w-4xl px-6 pt-10 pb-16'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <h1 className='text-3xl font-semibold tracking-tight'>Projects</h1>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1 sm:w-72 sm:flex-none'>
              <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search projects'
                aria-label='Search projects'
                className='h-10 w-full rounded-full border border-input bg-background pr-4 pl-10 text-sm outline-hidden placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
              />
            </div>
            <Button
              className='h-10 rounded-full px-5'
              onClick={() => setCreating(true)}
            >
              <Plus className='h-4 w-4' /> New
            </Button>
          </div>
        </div>

        <div className='mt-8 flex items-center justify-between border-b border-border pb-2 text-sm text-muted-foreground'>
          <span className='pl-3'>Name</span>
          <Select
            value={sort}
            onValueChange={(value) =>
              setSort(
                Object.values(ProjectSort).find((option) => option === value) ??
                  ProjectSort.ACTIVE
              )
            }
          >
            <SelectTrigger
              aria-label='Sort projects'
              className='h-8 w-auto gap-1 border-none bg-transparent text-sm text-muted-foreground shadow-none hover:text-foreground'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value={ProjectSort.ACTIVE}>Last active</SelectItem>
              <SelectItem value={ProjectSort.NAME}>Name</SelectItem>
              <SelectItem value={ProjectSort.CREATED}>Date created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isInitialLoad && status !== 'failed' ? (
          <div className='flex flex-col gap-2 pt-3'>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className='h-16 rounded-xl' />
            ))}
          </div>
        ) : status === 'failed' && projects.length === 0 ? (
          <div className='flex flex-col items-center py-20 text-center'>
            <p className='text-sm font-medium'>Could not load projects</p>
            <p className='mt-1 text-sm text-muted-foreground'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              className='mt-4 rounded-full'
              onClick={() => dispatch(fetchProjects())}
            >
              Try again
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className='flex flex-col items-center py-24 text-center'>
            <ProjectIcon
              icon={ProjectIconKey.FOLDER}
              tile
              className='mb-4 h-12 w-12'
            />
            <p className='text-base font-medium'>Start your first project</p>
            <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
              Projects keep chats, files and instructions for one piece of work
              in one place.
            </p>
            <Button
              className='mt-5 rounded-full px-5'
              onClick={() => setCreating(true)}
            >
              <Plus className='h-4 w-4' /> New project
            </Button>
          </div>
        ) : visibleProjects.length === 0 ? (
          <p className='py-16 text-center text-sm text-muted-foreground'>
            No projects match “{query.trim()}”.
          </p>
        ) : (
          <ul className='flex flex-col pt-2'>
            {visibleProjects.map((project) => (
              <li key={project.id} className='group relative'>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className='flex w-full items-center gap-4 rounded-xl px-3 py-3 pr-14 text-left transition-colors hover:bg-accent focus:outline-hidden focus-visible:bg-accent'
                >
                  <ProjectIcon icon={project.icon} tile />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[15px] font-medium'>
                      {project.name}
                    </span>
                    <span className='block truncate text-xs text-muted-foreground'>
                      {project.conversationCount}{' '}
                      {project.conversationCount === 1 ? 'chat' : 'chats'}
                      {project.description && ` · ${project.description}`}
                    </span>
                  </span>
                  <span className='hidden shrink-0 text-sm text-muted-foreground sm:block'>
                    {formatRelativeDate(project.lastActivityAt)}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={`Actions for ${project.name}`}
                      className='absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-100 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground data-[state=open]:opacity-100 sm:opacity-0'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onSelect={() => navigate(`/projects/${project.id}`)}
                    >
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onSelect={() => {
                        setDeleting(project)
                        setDeleteOpen(true)
                      }}
                    >
                      Delete project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateProjectDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={handleCreate}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        project={deleting}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default ProjectsPage
