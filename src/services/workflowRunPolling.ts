import type { AppDispatch } from '@/redux/store'
import { getWorkflowRunByIdV2 } from '@/redux/asyncThunks/workflow'
import { updateWorkflowRunStatus } from '@/redux/workflowBuilderSlice'
import type { WorkflowRun } from '@/redux/types/workflow'

/**
 * Start polling for workflow run status using V2 API.
 * V2 API returns nodeStates map for direct O(1) node access.
 *
 * @param runId - The workflow run ID to poll
 * @param dispatch - Redux dispatch function
 * @returns Cleanup function to stop polling
 */
export const startWorkflowRunPolling = (
  runId: number,
  dispatch: AppDispatch
): (() => void) => {
  const interval = setInterval(async () => {
    try {
      // Use V2 API for polling - returns nodeStates instead of steps
      const result = await dispatch(getWorkflowRunByIdV2(runId))
      const runData = result.payload

      if (runData && typeof runData === 'object' && 'status' in runData) {
        // Update the workflow run status in Redux (now includes nodeStates)
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
