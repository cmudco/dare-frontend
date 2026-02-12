import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { TableCell, TableRow } from '../ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
} from '@heroicons/react/20/solid'
import { GripVertical } from 'lucide-react'
import { Workflow } from '@/redux/types/workflow'
import { formatDate } from '@/utils/constants/prompts'
import {
  getModeBadge,
  getStepCount,
  createDragStyle,
} from '@/utils/workflowUtils'

interface SortableWorkflowRowProps {
  workflow: Workflow
  onEdit: (id: number) => void
  onClone: (id: number) => void
  onDelete: (id: number, title: string) => void
  onPublish: (id: number) => void
}

const SortableWorkflowRow: React.FC<SortableWorkflowRowProps> = ({
  workflow,
  onEdit,
  onClone,
  onDelete,
  onPublish,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workflow.id })

  const style = createDragStyle(transform, transition, isDragging)

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`border-border ${isDragging ? 'bg-muted/50 shadow-lg' : ''}`}
    >
      <TableCell className='w-12 p-4'>
        <div
          className='cursor-grab p-1 active:cursor-grabbing'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-5 w-5 text-muted-foreground' />
        </div>
      </TableCell>
      <TableCell className='p-4'>
        <div className='flex items-center gap-2'>
          <h3 className='font-medium text-foreground'>
            {workflow.title || 'Untitled'}
          </h3>
          {workflow.isPublished && (
            <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
              Published
            </span>
          )}
          {workflow.fileOwnerId && (
            <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
              Forked
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className='p-4'>
        <p className='max-w-[300px] truncate text-sm text-muted-foreground'>
          {workflow.description || 'No description'}
        </p>
      </TableCell>
      <TableCell className='p-4'>{getModeBadge(workflow.mode)}</TableCell>
      <TableCell className='p-4 text-foreground'>
        {getStepCount(workflow)}
      </TableCell>
      <TableCell className='p-4 text-foreground'>
        {formatDate(workflow.createdAt)}
      </TableCell>
      <TableCell className='p-4 text-center'>
        <DropdownMenu>
          <DropdownMenuTrigger className='rounded-md p-2 transition-colors hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white'>
            <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onEdit(workflow.id)}
              className='cursor-pointer'
            >
              <PencilIcon className='mr-2 h-4 w-4' />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onClone(workflow.id)}
              className='cursor-pointer text-yellow-500'
            >
              <DocumentDuplicateIcon className='h-4 w-4' />
              <span>Clone</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer text-red-500'
              onClick={() => onDelete(workflow.id, workflow.title)}
            >
              <TrashIcon className='mr-2 h-4 w-4' />
              <span>Delete</span>
            </DropdownMenuItem>
            {/* Only show publish option if NOT forked (fileOwnerId is null) */}
            {!workflow.fileOwnerId && (
              <DropdownMenuItem
                onClick={() => onPublish(workflow.id)}
                className='cursor-pointer text-blue-500'
              >
                <GlobeAltIcon className='mr-2 h-4 w-4' />
                <span>{workflow.isPublished ? 'Unpublish' : 'Publish'}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default SortableWorkflowRow
