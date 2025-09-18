import { WorkflowBuilderState } from '../types/workflowBuilder'
import { INITIAL_NODES, INITIAL_EDGES } from '@/utils/constants/workflowBuilder'

export const initialState: WorkflowBuilderState = {
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  errorsByNodeId: {},
  currentMode: 'sequential',
  lastWorkflowId: undefined,
  savedViewport: null,
  currentRun: null,
  isRunning: false,
  loadedWorkflow: null,
}
