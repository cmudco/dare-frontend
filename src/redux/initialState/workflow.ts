import { WorkflowState } from '../types/workflow'

export const initialState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  workflowRuns: [],
  selectedWorkflowRun: null,
  loading: false,
  error: null,
  // LEGACY: Commenting out modal state
  // isModalOpen: false,
  savedNodeIds: [],
  tempNodes: [],
  tempEdges: [],
}
