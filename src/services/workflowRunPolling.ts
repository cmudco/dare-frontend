import type { AppDispatch } from '@/redux/store'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { updateWorkflowRunStatus } from '@/redux/workflowBuilderSlice'

export const startWorkflowRunPolling = (
  runId: string,
  dispatch: AppDispatch
): (() => void) => {
  const interval = setInterval(async () => {
    try {
      const result = await dispatch(getWorkflowRunById(runId))
      const runData = result.payload

      if (runData) {
        // Update the workflow run status in Redux
        dispatch(updateWorkflowRunStatus(runData))

        // Stop polling if the run is no longer running
        if (runData.status !== 'running') {
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