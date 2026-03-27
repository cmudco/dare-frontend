import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateNodeDataById } from '@/redux/workflowBuilder'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'
import { OutputDisplayMode } from '@/redux/types/workflowBuilder'

/**
 * Hook that sets output nodes to expanded state in 'nodes' display mode
 * when they receive content. This ensures content stays visible after
 * streaming completes.
 *
 * In panel mode, this hook does nothing - output is viewed in the execution panel.
 */
export function useAutoExpandOutputNodes() {
  const dispatch = useAppDispatch()
  const expandedNodesRef = useRef<Set<string>>(new Set())

  const nodes = useAppSelector((s) => s.workflowBuilder.builder.nodes)
  const currentRun = useAppSelector(
    (s) => s.workflowBuilder.execution.currentRun
  )
  const outputDisplayMode = useAppSelector(
    (s) => s.workflowBuilder.builder.outputDisplayMode
  )

  const currentStatus = currentRun?.status || null

  useEffect(() => {
    // Only run in nodes mode
    if (outputDisplayMode !== OutputDisplayMode.Nodes) return

    const outputNodes = nodes.filter(
      (n) => n.type === WorkflowNodeType.ChatOutput
    )

    // Set isExpanded=true for output nodes that have content in nodeStates
    outputNodes.forEach((node) => {
      const nodeState = currentRun?.nodeStates?.[node.id]
      const hasContent = nodeState?.response?.trim()

      if (hasContent && !expandedNodesRef.current.has(node.id)) {
        expandedNodesRef.current.add(node.id)
        dispatch(
          updateNodeDataById({
            nodeId: node.id,
            newData: { isExpanded: true },
          })
        )
      }
    })
  }, [nodes, dispatch, outputDisplayMode, currentRun?.nodeStates])

  // Reset tracking when a new run starts
  useEffect(() => {
    if (currentStatus === WorkflowRunStepStatus.Running) {
      expandedNodesRef.current.clear()
    }
  }, [currentStatus])
}
