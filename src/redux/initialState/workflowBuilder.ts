import {
  type WorkflowBuilderState,
  SavingStatus,
  OutputDisplayMode,
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
  savingStatus: SavingStatus.Idle,
  selectedNodeId: null,
  // WebSocket state
  wsConnectionStatus: 'disconnected',
  activeNodeId: null,
  rightPanelTab: 'config',
  showExecutionPanel: false,
  pendingValidation: null,
  outputDisplayMode: OutputDisplayMode.Panel,
}
