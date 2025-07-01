import { Workflow, WorkflowMode } from '../redux/types/workflow'
import { Badge } from '../components/ui/badge'

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
  return workflow.steps?.length || 0
}
