import { Link, useLocation } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { useAppSelector } from '@/redux/hooks'
import { SIDEBAR_RECENT_PROJECTS } from '@/utils/constants/project'
import ProjectIcon from '../Projects/ProjectIcon'

/** Most recently active projects, nested under the Projects nav item. */
const SidebarProjectList = () => {
  const location = useLocation()
  const { projects } = useProjects()
  const activeChatProject = useAppSelector(
    (state) => state.conversation.activeConversation?.project ?? null
  )
  const inChat = location.pathname.startsWith('/conversation')

  if (projects.length === 0) return null

  return (
    <ul aria-label='Recent projects' className='mb-1 flex flex-col gap-0.5'>
      {projects.slice(0, SIDEBAR_RECENT_PROJECTS).map((project) => {
        const isCurrent =
          location.pathname === `/projects/${project.id}` ||
          (inChat && activeChatProject === project.id)
        return (
          <li key={project.id}>
            <Link
              to={`/projects/${project.id}`}
              aria-current={isCurrent ? 'page' : undefined}
              title={project.name}
              className={`flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-9 text-sm transition-colors ${
                isCurrent
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <ProjectIcon
                icon={project.icon}
                className='h-3.5 w-3.5 shrink-0'
              />
              <span className='truncate'>{project.name}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default SidebarProjectList
