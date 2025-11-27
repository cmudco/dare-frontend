import {
  Workflow,
  WorkflowMode,
  WorkflowDisplayOrder,
} from '../redux/types/workflow'
import { Badge } from '../components/ui/badge'
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { WorkflowRunStepStatus } from './constants/workflows'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const getModeBadge = (mode: WorkflowMode) => {
  switch (mode) {
    case WorkflowMode.Serial:
      return <Badge variant='blue'>Serial</Badge>
    case WorkflowMode.Parallel:
      return <Badge variant='green'>Parallel</Badge>
    default:
      return <Badge variant='gray'>Unknown</Badge>
  }
}

export const getStepCount = (workflow: Workflow): number => {
  return workflow.nodes?.filter((node) => node.type === 'step').length || 0
}

export const getStepStatus = (
  currentRun: {
    steps?: Array<{ order?: number; stepNode?: number; status?: string }>
  } | null,
  stepNumber: number
) => {
  if (!currentRun || !currentRun.steps) return null
  const runStep = currentRun.steps.find(
    (rs) => (rs.order || rs.stepNode) === stepNumber
  )
  return runStep?.status || null
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case WorkflowRunStepStatus.Pending:
      return <Clock className='h-3 w-3' />
    case WorkflowRunStepStatus.Running:
      return <Loader2 className='h-3 w-3 animate-spin' />
    case WorkflowRunStepStatus.Completed:
      return <CheckCircle className='h-3 w-3' />
    case WorkflowRunStepStatus.Failed:
      return <XCircle className='h-3 w-3' />
    default:
      return null
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case WorkflowRunStepStatus.Pending:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
    case WorkflowRunStepStatus.Running:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
    case WorkflowRunStepStatus.Completed:
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    case WorkflowRunStepStatus.Failed:
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export const renderStatusPill = (status: string | null) => {
  if (!status) return null

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      <span className='capitalize'>{status}</span>
    </div>
  )
}

/**
 * Get status emoji for workflow run status
 */
export const getRunStatusEmoji = (status: WorkflowRunStepStatus): string => {
  switch (status) {
    case WorkflowRunStepStatus.Completed:
      return '✓'
    case WorkflowRunStepStatus.Failed:
      return '⚠'
    case WorkflowRunStepStatus.Running:
      return '⏳'
    case WorkflowRunStepStatus.Pending:
      return '○'
    case WorkflowRunStepStatus.PendingHumanInput:
      return '⏸'
    case WorkflowRunStepStatus.Skipped:
      return '⊘'
    default:
      return '○'
  }
}

/**
 * Format workflow run label for version dropdown
 * @param run - The workflow run to format
 * @param versionNumber - The version number to display (e.g., 5 for "Version 5")
 */
export const formatWorkflowRunLabel = (
  run: { startedAt: string; status: WorkflowRunStepStatus },
  versionNumber: number
): string => {
  const date = new Date(run.startedAt)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const statusEmoji = getRunStatusEmoji(run.status)
  return `${statusEmoji} Version ${versionNumber} - ${formattedDate}`
}

// ============================================================================
// Drag & Drop Utilities
// ============================================================================

/**
 * Filters workflows based on search query
 */
export const filterWorkflows = (
  workflows: Workflow[],
  searchQuery: string
): Workflow[] => {
  return workflows.filter((workflow) => {
    const title = workflow.title?.toLowerCase() || ''
    const description = workflow.description?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return title.includes(query) || description.includes(query)
  })
}

/**
 * Creates display order updates for backend persistence
 */
export const createDisplayOrderUpdates = (
  workflows: Workflow[]
): WorkflowDisplayOrder[] => {
  return workflows.map((workflow, index) => ({
    id: workflow.id,
    displayOrder: (index + 1) * 10,
  }))
}

/**
 * Finds the old and new indexes for drag operations
 */
export const findWorkflowIndexes = (
  workflows: Workflow[],
  activeId: string | number,
  overId: string | number | undefined
): { oldIndex: number; newIndex: number } => {
  const oldIndex = workflows.findIndex((workflow) => workflow.id === activeId)
  const newIndex = workflows.findIndex((workflow) => workflow.id === overId)

  return { oldIndex, newIndex }
}

/**
 * Custom hook that creates configured sensors for drag and drop operations
 */
export const useDragSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
}

/**
 * Checks if a drag operation is valid
 */
export const isDragOperationValid = (
  oldIndex: number,
  newIndex: number,
  activeId: string | number | undefined,
  overId: string | number | undefined
): boolean => {
  return activeId !== overId && oldIndex !== -1 && newIndex !== -1
}

/**
 * Gets the workflow title with fallback
 */
export const getWorkflowTitle = (workflow: Workflow): string => {
  return workflow.title || 'Untitled Workflow'
}

/**
 * Creates the drag style for sortable table rows
 */
export const createDragStyle = (
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
  transition: string | undefined,
  isDragging: boolean
) => ({
  transform: CSS.Transform.toString(transform),
  transition: isDragging ? 'none' : transition,
  opacity: isDragging ? 0.5 : 1,
  zIndex: isDragging ? 999 : 'auto',
  cursor: isDragging ? 'grabbing' : 'grab',
})
