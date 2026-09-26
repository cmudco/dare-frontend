import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useAppSelector } from '@/redux/hooks'
import { selectProjectById } from '@/redux/projectSlice'
import { ProjectMemoryScope } from '@/utils/constants/project'
import ProjectIcon from './ProjectIcon'

/** Breadcrumb above a chat that belongs to a project. */
const ProjectContextBar = () => {
  useProjects()
  const projectId = useAppSelector(
    (state) => state.conversation.activeConversation?.project ?? null
  )
  const project = useAppSelector((state) => selectProjectById(state, projectId))
  const memoryEnabled = useAppSelector(
    (state) => state.conversation.activeConversation?.memoryEnabled ?? false
  )

  if (!project) return null

  const memoryScoped =
    memoryEnabled && project.memoryScope === ProjectMemoryScope.PROJECT

  return (
    <div className='flex shrink-0 items-center gap-2 border-b border-border px-4 py-2 text-sm'>
      <Link
        to={`/projects/${project.id}`}
        className='inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <ProjectIcon icon={project.icon} className='shrink-0' />
        <span className='truncate font-medium'>{project.name}</span>
        <ChevronRight className='h-3.5 w-3.5 shrink-0' />
      </Link>
      {memoryScoped && (
        <span className='hidden truncate text-xs text-muted-foreground sm:inline'>
          Memory limited to this project
        </span>
      )}
    </div>
  )
}

export default ProjectContextBar
