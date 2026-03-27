import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { saveAndExecuteStep } from '@/redux/asyncThunks/workflowBuilder'

interface NodeExecutionState {
  nodeState: ReturnType<typeof getNodeState>
  status: WorkflowRunStepStatus | null
  isExecuted: boolean
  isStreaming: boolean
  isPendingHumanInput: boolean
  statusClass: string
  canRunStep: boolean
  handleRunStep: (e: React.MouseEvent) => void
}

/**
 * Shared execution state hook for all executable node types (Step, StructuredOutput, File).
 *
 * Consolidates the execution state selectors, derived status, status class computation,
 * and manual mode step execution logic that was duplicated across all node components.
 */
export function useNodeExecutionState(nodeId: string): NodeExecutionState {
  const dispatch = useAppDispatch()

  const {
    executedStepNodeIds,
    availableRuns,
    selectedRunIds,
    currentRun,
    activeNodeId,
    pendingValidation,
    manualModeEnabled,
    currentPartialRunId,
    isRunning,
  } = useAppSelector((s) => s.workflowBuilder.execution)
  const lastWorkflowId = useAppSelector(
    (s) => s.workflowBuilder.builder.lastWorkflowId
  )

  const displayRun = getDisplayRun(
    nodeId,
    selectedRunIds,
    availableRuns,
    currentRun
  )
  const nodeState = getNodeState(displayRun, nodeId)

  const status = (nodeState?.status as WorkflowRunStepStatus) || null
  const isExecuted = executedStepNodeIds.includes(nodeId)
  const isStreaming = activeNodeId === nodeId
  const isPendingHumanInput = pendingValidation?.nodeId === nodeId

  const getStatusClass = (): string => {
    if (isPendingHumanInput) return 'pending-validation'
    if (isStreaming) return 'streaming'
    if (isExecuted || status === WorkflowRunStepStatus.Completed)
      return 'completed'
    if (status === WorkflowRunStepStatus.Running) return 'running'
    if (status === WorkflowRunStepStatus.Failed) return 'error'
    if (status === WorkflowRunStepStatus.Pending) return 'pending'
    if (status === WorkflowRunStepStatus.PendingHumanInput)
      return 'pending-validation'
    return ''
  }

  const canRunStep = Boolean(manualModeEnabled && !isRunning && lastWorkflowId)

  const handleRunStep = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lastWorkflowId || isRunning) return
    dispatch(
      saveAndExecuteStep({
        workflowId: lastWorkflowId,
        stepNodeId: nodeId,
        workflowRunId: currentPartialRunId || undefined,
      })
    )
  }

  return {
    nodeState,
    status,
    isExecuted,
    isStreaming,
    isPendingHumanInput,
    statusClass: getStatusClass(),
    canRunStep,
    handleRunStep,
  }
}
