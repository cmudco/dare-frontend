import type { AppDispatch } from '@/redux/store'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { updateWorkflowRunStatus } from '@/redux/workflowBuilderSlice'
import type { WorkflowRun } from '@/redux/types/workflow'

export const startWorkflowRunPolling = (
  runId: number,
  dispatch: AppDispatch
): (() => void) => {
  const interval = setInterval(async () => {
    try {
      const result = await dispatch(getWorkflowRunById(runId))
      const runData = result.payload

      if (runData && typeof runData === 'object' && 'status' in runData) {
        // Update the workflow run status in Redux
        dispatch(updateWorkflowRunStatus(runData as WorkflowRun))

        // Stop polling if the run is no longer running or waiting for human input
        // Keep polling for 'running' and 'pending_human_input' states
        if (
          'status' in runData &&
          runData.status !== 'running' &&
          runData.status !== 'pending_human_input'
        ) {
          clearInterval(interval)
        }
      }
    } catch (error) {
      console.error('Error polling workflow run:', error)
      // Continue polling even on error, but could add retry logic here
    }
  }, 3000) // Poll every 3 seconds

  // Return cleanup function
  return () => clearInterval(interval)
}
