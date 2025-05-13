import { WorkflowState } from '../types/workflow'

export const initialState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  workflowRuns: [],
  selectedWorkflowRun: null,
  loading: false,
  error: null,
  isModalOpen: false,
  savedStepIds: [],
  tempSteps: [],
}
