import { Check, FolderInput, FolderMinus, Plus } from 'lucide-react'
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects } from '@/hooks/useProjects'

interface Props {
  currentProjectId: number | null
  onMove: (projectId: number | null) => void
  onCreateProject: () => void
}

const MoveToProjectSubmenu = ({
  currentProjectId,
  onMove,
  onCreateProject,
}: Props) => {
  const { projects } = useProjects()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
        <FolderInput className='mr-2 h-4 w-4' />
        Move to project
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className='max-h-80 w-56 overflow-y-auto'
          onClick={(e) => e.stopPropagation()}
        >
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              disabled={project.id === currentProjectId}
              onSelect={() => onMove(project.id)}
            >
              <span className='min-w-0 flex-1 truncate'>{project.name}</span>
              {project.id === currentProjectId && (
                <Check className='ml-2 h-4 w-4 shrink-0' />
              )}
            </DropdownMenuItem>
          ))}
          {projects.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onSelect={onCreateProject}>
            <Plus className='mr-2 h-4 w-4' />
            New project…
          </DropdownMenuItem>
          {currentProjectId !== null && (
            <DropdownMenuItem onSelect={() => onMove(null)}>
              <FolderMinus className='mr-2 h-4 w-4' />
              Remove from project
            </DropdownMenuItem>
          )}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

export default MoveToProjectSubmenu
