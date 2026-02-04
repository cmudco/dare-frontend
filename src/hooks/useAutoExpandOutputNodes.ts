import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateNodeDataById } from '@/redux/workflowBuilderSlice'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'
import { OutputDisplayMode } from '@/redux/types/workflowBuilder'

/**
 * Hook that auto-expands output nodes based on outputDisplayMode:
 * - 'panel' mode: Expand output nodes when workflow execution completes
 * - 'nodes' mode: Expand output nodes as soon as they have responses (real-time)
 */
export function useAutoExpandOutputNodes() {
  const dispatch = useAppDispatch()
  const prevStatusRef = useRef<string | null>(null)
  const expandedNodesRef = useRef<Set<string>>(new Set())

  const { nodes, currentRun, streamingResponses, outputDisplayMode } =
    useAppSelector((s) => s.workflowBuilder)

  const currentStatus = currentRun?.status || null
  const nodeStates = currentRun?.nodeStates

  useEffect(() => {
    const outputNodes = nodes.filter(
      (n) => n.type === WorkflowNodeType.ChatOutput
    )

    if (outputDisplayMode === OutputDisplayMode.Nodes) {
      // In 'nodes' mode: auto-expand as soon as response is available
      outputNodes.forEach((node) => {
        const streamingData = streamingResponses[node.id]
        const hasResponse = streamingData?.content?.trim()

        // Only expand if not already expanded in this session
        if (hasResponse && !expandedNodesRef.current.has(node.id)) {
          expandedNodesRef.current.add(node.id)
          dispatch(
            updateNodeDataById({
              nodeId: node.id,
              newData: { isExpanded: true },
            })
          )
        }
      })
    } else {
      // In 'panel' mode: only expand when workflow completes
      const wasNotCompleted =
        prevStatusRef.current !== WorkflowRunStepStatus.Completed
      const isNowCompleted = currentStatus === WorkflowRunStepStatus.Completed

      if (wasNotCompleted && isNowCompleted && nodeStates) {
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
    }

    prevStatusRef.current = currentStatus
  }, [
    currentStatus,
    nodeStates,
    nodes,
    dispatch,
    outputDisplayMode,
    streamingResponses,
  ])

  // Reset expanded nodes tracking when a new run starts
  useEffect(() => {
    if (currentStatus === WorkflowRunStepStatus.Running) {
      expandedNodesRef.current.clear()
    }
  }, [currentStatus])
}
