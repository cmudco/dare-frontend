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
    activeStreamingNodeId,
    streamingResponses,
  } = useAppSelector((s) => s.workflowBuilder)

  const displayRun = getDisplayRun(
    id,
    selectedRunIds,
    availableRuns,
    currentRun
  )
  const nodeState = getNodeState(displayRun, id)

  // Check streamingResponses for real-time updates (step_completed populates this)
  const streamingData = streamingResponses[id]

  // Derive output node status
  const derivedStatus = (() => {
    if (activeStreamingNodeId === id) return WorkflowRunStepStatus.Running
    // If we have streaming data with content, it's completed
    if (streamingData?.content) return WorkflowRunStepStatus.Completed
    // If workflow is running and no data yet, show pending
    if (isRunning) return WorkflowRunStepStatus.Pending
    if (nodeState?.status) return nodeState.status
    return null
  })()

  const status = derivedStatus
  // Use streaming response first (real-time), fall back to nodeState
  const response = streamingData?.content || nodeState?.response || null
  const hasResponse = Boolean(response?.trim())
  const isExpanded = (data?.isExpanded as boolean) ?? false

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

      {hasResponse && response && isExpanded && (
        <OutputNodeContent
          response={response}
          onOpenFullView={handleConfigure}
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
