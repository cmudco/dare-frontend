import { WorkflowState } from '../types/workflow'

export const initialState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  workflowRuns: [],
  loading: false,
  error: null,
  savedNodeIds: [],
  tempNodes: [],
  tempEdges: [],
}
