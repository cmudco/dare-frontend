import {
  ListOrdered,
  Layers,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { Workflow, WorkflowMode } from '@/redux/types/workflow'
import { Badge } from '@/components/ui/badge'
import { WORKFLOW_MODES, WorkflowRunStepStatus } from './workflows'

/**
 * Returns a badge component based on the workflow mode.
 * @param mode - The workflow mode (Serial, Parallel, etc.).
 * @returns A React component representing the mode badge.
 */
export const getModeBadge = (mode: WorkflowMode) => {
  switch (mode) {
    case WorkflowMode.Serial:
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        >
          <ListOrdered className='mr-1 h-3.5 w-3.5' />
          {WORKFLOW_MODES[0].name}
        </Badge>
      )
    case WorkflowMode.Parallel:
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
        >
          <Layers className='mr-1 h-3.5 w-3.5' />
          {WORKFLOW_MODES[1].name}
        </Badge>
      )
  }
}

/**
 * Returns a badge component based on the workflow run status.
 * @param status - The workflow run status (Running, Completed, Failed, Pending).
 * @returns A React component representing the status badge.
 */
export const getRunStatusBadge = (status: WorkflowRunStepStatus) => {
  switch (status) {
    case WorkflowRunStepStatus.Pending:
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        >
          <Clock className='mr-1 h-3.5 w-3.5' />
          Pending
        </Badge>
      )
    case WorkflowRunStepStatus.Running:
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        >
          <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />
          Running
        </Badge>
      )
    case WorkflowRunStepStatus.Completed:
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
        >
          <CheckCircle className='mr-1 h-3.5 w-3.5' />
          Completed
        </Badge>
      )
    case WorkflowRunStepStatus.Failed:
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
        >
          <XCircle className='mr-1 h-3.5 w-3.5' />
          Failed
        </Badge>
      )
    default:
      return (
        <Badge
          variant='outline'
          className='border-border bg-muted text-muted-foreground'
        >
          Unknown
        </Badge>
      )
  }
}

/**
 * Returns the number of steps in a workflow.
 * @param workflow - The workflow object.
 * @returns The number of steps in the workflow.
 */
export const getStepCount = (workflow: Workflow) => {
  if (workflow.nodes) {
    return workflow.nodes.filter((node) => node.type === 'step').length
  } else {
    return 0
  }
}
