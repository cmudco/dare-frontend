import {
  type WorkflowBuilderState,
  SavingStatus,
} from '../types/workflowBuilder'
import { INITIAL_NODES, INITIAL_EDGES } from '@/utils/constants/workflowBuilder'

export const initialState: WorkflowBuilderState = {
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  currentMode: 'sequential',
  lastWorkflowId: undefined,
  savedViewport: null,
  currentRun: null,
  isRunning: false,
  loadedWorkflow: null,
  history: {
    past: [],
    future: [],
  },
  manualModeEnabled: false,
  currentPartialRunId: null,
  executedStepNodeIds: [],
  availableRuns: [],
  selectedRunIds: {},
  viewMode: false,
  savingStatus: SavingStatus.Idle,
  selectedNodeId: null,
}
