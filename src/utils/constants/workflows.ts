export const WORKFLOWS_TABLE_HEAD = [
  'Workflow Name',
  'Description',
  'Mode',
  'Steps',
  'Date Uploaded',
  'Action',
]

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
]

export enum WorkflowRunStepStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}
