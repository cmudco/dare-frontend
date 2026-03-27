import { useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setNodeSelectedRun } from '@/redux/workflowBuilder'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

/**
 * Custom hook for managing workflow run version selection in output nodes.
 *
 * PURPOSE:
 * Provides version dropdown functionality for output nodes to view
 * different completed workflow runs.
 *
 * BEHAVIOR BY MODE:
 * - Default mode: Shows completed/failed runs for version switching
 * - Manual mode: Hides dropdown (shows partial run data instead)
 * - Running mode: Hides dropdown (shows live execution)
 *
 * @param nodeId - The unique ID of the node using this hook
 * @returns Version selection state and handlers
 *
 * @example
 * ```tsx
 * const versionState = useWorkflowRunVersion(nodeId)
 *
 * return (
 *   <VersionDropdown
 *     versionRuns={versionState.versionRuns}
 *     selectedRunId={versionState.selectedRunId}
 *     onRunChange={versionState.handleRunChange}
 *     show={versionState.showVersionDropdown}
 *   />
 * )
 * ```
 */
export function useWorkflowRunVersion(nodeId: string) {
  const dispatch = useAppDispatch()
  const {
    availableRuns,
    selectedRunIds,
    currentRun,
    isRunning,
    manualModeEnabled,
  } = useAppSelector((s) => s.workflowBuilder.execution)

  /**
   * FILTER LOGIC: Only show completed/failed full runs in dropdown
   * - Excludes partial runs (from manual mode)
   * - Excludes pending/running runs
   */
  const versionRuns = useMemo(
    () =>
      availableRuns.filter(
        (run) =>
          !run.isPartial &&
          (run.status === WorkflowRunStepStatus.Completed ||
            run.status === WorkflowRunStepStatus.Failed)
      ),
    [availableRuns]
  )

  /**
   * CURRENT SELECTION: Default to currentRun if no explicit selection
   */
  const selectedRunId = selectedRunIds[nodeId] || currentRun?.id

  /**
   * VISIBILITY LOGIC: Show dropdown only when:
   * - Not running a workflow
   * - Not in manual mode
   * - Has multiple versions to choose from
   */
  const showVersionDropdown =
    !isRunning && !manualModeEnabled && versionRuns.length > 1

  /**
   * HANDLER: Update selected version for this specific node
   */
  const handleRunChange = useCallback(
    (runIdStr: string) => {
      const runId = parseInt(runIdStr, 10)
      dispatch(setNodeSelectedRun({ nodeId, runId }))
    },
    [dispatch, nodeId]
  )

  return {
    versionRuns,
    selectedRunId,
    showVersionDropdown,
    handleRunChange,
  }
}
