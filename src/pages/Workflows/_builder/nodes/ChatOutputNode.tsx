import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Send,
  Settings,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
  updateNodeDataById,
} from '@/redux/workflowBuilderSlice'
import { OutputDisplayMode } from '@/redux/types/workflowBuilder'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { useCallback } from 'react'
import { OutputNodeContent } from '../components/OutputNodeContent'

export default function ChatOutputNode({ id, selected, data }: NodeProps) {
  const dispatch = useAppDispatch()

  const {
    availableRuns,
    selectedRunIds,
    currentRun,
    isRunning,
    streamingResponses,
    outputDisplayMode,
  } = useAppSelector((s) => s.workflowBuilder)

  const isNodesMode = outputDisplayMode === OutputDisplayMode.Nodes

  const displayRun = getDisplayRun(
    id,
    selectedRunIds,
    availableRuns,
    currentRun
  )
  const nodeState = getNodeState(displayRun, id)

  // Get response data
  const streamingData = streamingResponses[id]
  const response = streamingData?.content || nodeState?.response || null
  const hasResponse = Boolean(response?.trim())

  // In nodes mode: streaming means we have streaming data and workflow is running
  // In panel mode: no streaming behavior for output nodes
  const isStreaming = isNodesMode && isRunning && streamingData !== undefined

  // Status derivation
  const status = (() => {
    if (isStreaming) return WorkflowRunStepStatus.Running
    if (hasResponse) return WorkflowRunStepStatus.Completed
    if (isRunning) return WorkflowRunStepStatus.Pending
    if (nodeState?.status) return nodeState.status
    return null
  })()

  const isExpanded = (data?.isExpanded as boolean) ?? false

  // In nodes mode: auto-show when streaming
  // In panel mode: only show when manually expanded
  const shouldShowContent =
    hasResponse && response && (isExpanded || isStreaming)

  const handleConfigure = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch(setSelectedNodeId(id))
    },
    [dispatch, id]
  )

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch(removeNodeWithEdges({ nodeId: id }))
    },
    [dispatch, id]
  )

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      dispatch(
        updateNodeDataById({ nodeId: id, newData: { isExpanded: !isExpanded } })
      )
    },
    [dispatch, id, isExpanded]
  )

  const getSubtitle = () => {
    if (status === WorkflowRunStepStatus.Completed && hasResponse)
      return 'Response ready'
    if (status === WorkflowRunStepStatus.Running) return 'Generating...'
    if (status === WorkflowRunStepStatus.Pending) return 'Pending...'
    if (status === WorkflowRunStepStatus.Failed) return 'Error occurred'
    return 'No output yet'
  }

  const getStatusClass = () => {
    if (status === WorkflowRunStepStatus.Completed) return 'completed'
    if (status === WorkflowRunStepStatus.Running) return 'running'
    if (status === WorkflowRunStepStatus.Pending) return 'pending'
    if (status === WorkflowRunStepStatus.Failed) return 'error'
    return ''
  }

  return (
    <div
      className={`workflow-node output ${selected ? 'selected' : ''} ${getStatusClass()}`}
    >
      {selected && (
        <div className='node-quick-actions'>
          <button
            className='quick-action-btn'
            title='View Output'
            onClick={handleConfigure}
          >
            <Settings size={14} />
          </button>
          <button
            className='quick-action-btn'
            title='Duplicate'
            onClick={handleDuplicate}
          >
            <Copy size={14} />
          </button>
          <button
            className='quick-action-btn danger'
            title='Delete'
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className='node-header'>
        <div className='node-icon output'>
          <Send size={16} />
        </div>
        <div className='flex-1'>
          <div className='node-title'>Output</div>
          <div className='node-subtitle'>{getSubtitle()}</div>
        </div>
        {hasResponse && (
          <button
            className='flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50'
            onClick={handleToggleExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp size={14} className='text-muted-foreground' />
            ) : (
              <ChevronDown size={14} className='text-muted-foreground' />
            )}
          </button>
        )}
      </div>

      {shouldShowContent && (
        <OutputNodeContent
          response={response}
          onOpenFullView={handleConfigure}
          isStreaming={isStreaming}
        />
      )}

      <Handle
        type='target'
        position={Position.Left}
        className='h-3 w-3 bg-secondary'
      />
      <Handle
        type='source'
        position={Position.Right}
        className='h-3 w-3 border-2 border-white bg-primary'
      />
    </div>
  )
}
