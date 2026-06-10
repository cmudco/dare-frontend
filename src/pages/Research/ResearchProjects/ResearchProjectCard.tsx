import { BookMarked, FileText, Inbox, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ResearchProjectStatus } from '@/utils/constants/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { ResearchProject } from '@/redux/types/research'

interface Props {
  project: ResearchProject
  onOpen: (project: ResearchProject) => void
  onEdit: (project: ResearchProject) => void
  onDelete: (project: ResearchProject) => void
}

const ResearchProjectCard = ({ project, onOpen, onEdit, onDelete }: Props) => {
  const isArchived = project.status === ResearchProjectStatus.ARCHIVED

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(project)
        }
      }}
      className='group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-foreground/20 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
    >
      <div className='mb-3 flex items-start justify-between gap-2'>
        <Badge variant={isArchived ? 'gray' : 'green'}>
          {isArchived ? 'Archived' : 'Active'}
        </Badge>
        <div className='flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'>
          <button
            aria-label='Edit project'
            onClick={(e) => {
              e.stopPropagation()
              onEdit(project)
            }}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <Pencil className='h-4 w-4' />
          </button>
          <button
            aria-label='Delete project'
            onClick={(e) => {
              e.stopPropagation()
              onDelete(project)
            }}
            className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </div>

      <h3 className='line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight'>
        {project.title}
      </h3>
      <p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>
        {project.question}
      </p>

      <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground'>
        <span className='inline-flex items-center gap-1.5'>
          <Inbox className='h-3.5 w-3.5' />
          {project.pendingReviewCount} to review
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <BookMarked className='h-3.5 w-3.5' />
          {project.approvedCount} approved
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <FileText className='h-3.5 w-3.5' />
          {project.sourceCount} sources
        </span>
        <span className='ml-auto'>
          Updated {formatRelativeDate(project.updatedAt)}
        </span>
      </div>
    </div>
  )
}

export default ResearchProjectCard
