import { ListOrdered, Layers } from 'lucide-react'
import { Workflow, WorkflowMode } from '@/redux/types/workflow'
import { Badge } from '@/components/ui/badge'

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
          className='bg-blue-50 text-blue-700 border-blue-200'
        >
          <ListOrdered className='h-3.5 w-3.5 mr-1' />
          Sequential
        </Badge>
      )
    case WorkflowMode.Parallel:
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200'
        >
          <Layers className='h-3.5 w-3.5 mr-1' />
          Parallel
        </Badge>
      )
    default:
      return (
        <Badge variant='outline' className='bg-gray-100 text-gray-700'>
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
  if (workflow.steps) {
    return workflow.steps.length
  } else {
    return 0
  }
}
