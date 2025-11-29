export const WORKFLOWS_TABLE_HEAD = [
  'Workflow Name',
  'Description',
  'Mode',
  'Steps',
  'Date Uploaded',
  'Action',
]

export const WORKFLOW_TABLE_HEADER_TO_KEY = {
  'Workflow Name': 'title',
  Description: 'description',
  Mode: 'mode',
  Steps: 'steps',
  'Date Uploaded': 'createdAt',
  Action: null,
} as const

export const WORKFLOW_MODES = [
  {
    id: 1,
    name: 'Sequential',
    description: 'Execute steps one after another in sequence.',
  },
  {
    id: 2,
    name: 'Parallel',
    description: 'Execute all steps simultaneously in parallel.',
  },
]

export const WORKFLOW_RUN_STATUSES = [
  {
    id: 'pending',
    name: 'Pending',
    description: 'The workflow is queued and waiting to execute.',
  },
  {
    id: 'running',
    name: 'Running',
    description: 'The workflow is currently executing.',
  },
  {
    id: 'completed',
    name: 'Completed',
    description: 'The workflow has finished successfully.',
  },
  {
    id: 'failed',
    name: 'Failed',
    description: 'The workflow encountered an error.',
  },
  {
    id: 'skipped',
    name: 'Skipped',
    description: 'The workflow was skipped and not executed.',
  },
  {
    id: 'pending_human_input',
    name: 'Awaiting Decision',
    description:
      'The workflow is paused and waiting for user to choose a route.',
  },
]

export enum WorkflowRunStepStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Skipped = 'skipped',
  PendingHumanInput = 'pending_human_input',
  // V2 nodeStates additional statuses
  NotExecuted = 'not_executed', // Start nodes without incoming edges
  NoSource = 'no_source', // Display nodes without connected execution node
  Error = 'error', // Node encountered an error
  Unknown = 'unknown', // Unknown node type
}

export enum WorkflowViewMode {
  Run = 'run',
  View = 'view',
}
