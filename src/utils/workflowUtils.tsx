import { Workflow, WorkflowMode } from '../redux/types/workflow'
import { Badge } from '../components/ui/badge'

export const getModeBadge = (mode: WorkflowMode) => {
  switch (mode) {
    case WorkflowMode.Serial:
      return <Badge variant='blue'>WORKFLOWMODE</Badge>
    case WorkflowMode.Parallel:
      return <Badge variant='green'>Parallel</Badge>
    default:
      return <Badge variant='default'>Unknown</Badge>
  }
}

export const getStepCount = (workflow: Workflow) => {
  return workflow.steps?.length || 0
}
