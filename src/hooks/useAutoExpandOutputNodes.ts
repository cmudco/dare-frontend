import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateNodeDataById } from '@/redux/workflowBuilderSlice'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'

/**
 * Hook that auto-expands output nodes when workflow execution completes.
 * Listens to currentRun status changes and expands all chatOutput nodes
 * that have completed responses.
 */
export function useAutoExpandOutputNodes() {
  const dispatch = useAppDispatch()
  const prevStatusRef = useRef<string | null>(null)

  const { nodes, currentRun } = useAppSelector((s) => s.workflowBuilder)

  const currentStatus = currentRun?.status || null
  const nodeStates = currentRun?.nodeStates

  useEffect(() => {
    const wasNotCompleted =
      prevStatusRef.current !== WorkflowRunStepStatus.Completed
    const isNowCompleted = currentStatus === WorkflowRunStepStatus.Completed

    if (wasNotCompleted && isNowCompleted && nodeStates) {
      // Find all chatOutput nodes and expand those with responses
      const outputNodes = nodes.filter(
        (n) => n.type === WorkflowNodeType.ChatOutput
      )

      outputNodes.forEach((node) => {
        const state = nodeStates[node.id]
        if (state?.response?.trim()) {
          dispatch(
            updateNodeDataById({
              nodeId: node.id,
              newData: { isExpanded: true },
            })
          )
        }
      })
    }

    prevStatusRef.current = currentStatus
  }, [currentStatus, nodeStates, nodes, dispatch])
}
