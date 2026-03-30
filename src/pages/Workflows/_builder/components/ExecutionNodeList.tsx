import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { selectNodes } from '@/redux/workflowBuilder'
import { StepResponseCard } from './StepResponseCard'
import { WorkflowNodeType } from '@/utils/constants/workflows'
import type { WorkflowRun } from '@/redux/types/workflow'

interface ExecutionNodeListProps {
  displayRun: WorkflowRun
  displayActiveNodeId: string | null
}

/**
 * Sorted list of executed nodes with status indicators and streaming content.
 * Filters to Step, StructuredOutput, and File nodes that have responses.
 */
export function ExecutionNodeList({
  displayRun,
  displayActiveNodeId,
}: ExecutionNodeListProps) {
  const nodes = useAppSelector(selectNodes)

  const labelByNodeId = useMemo(() => {
    const map = new Map<string, string>()
    for (const node of nodes) {
      const label = (node.data as { label?: string })?.label
      if (label) {
        map.set(node.id, label)
      }
    }
    return map
  }, [nodes])

  const getNodeName = (nodeId: string) => labelByNodeId.get(nodeId) ?? nodeId

  const sortedEntries = useMemo(() => {
    const entries = displayRun.nodeStates
      ? Object.entries(displayRun.nodeStates).filter(
          ([, state]) =>
            state.response &&
            (state.nodeType === WorkflowNodeType.Step ||
              state.nodeType === WorkflowNodeType.StructuredOutput ||
              state.nodeType === WorkflowNodeType.File)
        )
      : []

    if (!entries.length) return entries

    return entries.sort(([aId, aState], [bId, bState]) => {
      const aStartedRaw = aState.startedAt ? Date.parse(aState.startedAt) : NaN
      const bStartedRaw = bState.startedAt ? Date.parse(bState.startedAt) : NaN
      const aStarted = Number.isNaN(aStartedRaw) ? null : aStartedRaw
      const bStarted = Number.isNaN(bStartedRaw) ? null : bStartedRaw

      if (aStarted !== null && bStarted !== null && aStarted !== bStarted) {
        return aStarted - bStarted
      }
      if (aStarted !== null && bStarted === null) return -1
      if (aStarted === null && bStarted !== null) return 1

      const aLabel = labelByNodeId.get(aId)
      const bLabel = labelByNodeId.get(bId)
      if (aLabel && bLabel && aLabel !== bLabel) {
        return aLabel.localeCompare(bLabel, undefined, { numeric: true })
      }

      return aId.localeCompare(bId)
    })
  }, [displayRun.nodeStates, labelByNodeId])

  if (!sortedEntries.length) return null

  return (
    <div className='space-y-4'>
      {sortedEntries.map(([nodeId, state]) => (
        <StepResponseCard
          key={nodeId}
          nodeId={nodeId}
          nodeName={getNodeName(nodeId)}
          label={labelByNodeId.get(nodeId)}
          nodeType={nodes.find((n) => n.id === nodeId)?.type}
          content={state.response || ''}
          isActive={displayActiveNodeId === nodeId}
          snippets={state.snippets}
          webSearchSources={state.webSearchSources}
        />
      ))}
    </div>
  )
}
