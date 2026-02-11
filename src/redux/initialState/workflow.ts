import { WorkflowState } from '../types/workflow'

export const initialState: WorkflowState = {
  workflows: [],
  sharedWorkflows: [],
  selectedWorkflow: null,
  workflowRuns: [],
  loading: false,
  error: null,
}
