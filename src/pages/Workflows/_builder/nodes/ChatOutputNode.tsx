import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Send, Settings, Copy, Trash2, CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
} from '@/redux/workflowBuilderSlice'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

export default function ChatOutputNode({ id, selected }: NodeProps) {
  const dispatch = useAppDispatch()

  // Get workflow execution data
  const { executedStepNodeIds, availableRuns, selectedRunIds, currentRun } =
    useAppSelector((s) => s.workflowBuilder)

  const isOutputExecuted = executedStepNodeIds.includes(id)

  // Get the run to display
  const displayRun = getDisplayRun(
    id,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  // Get node state from the display run
  const nodeState = getNodeState(displayRun, id)
  const status = nodeState?.status || null
  const hasResponse = Boolean(nodeState?.response?.trim())

  // Quick action handlers
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setSelectedNodeId(id))
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement duplicate
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId: id }))
  }

  // Get subtitle based on status
  const getSubtitle = () => {
    if (status === WorkflowRunStepStatus.Completed && hasResponse) {
      return 'Response ready'
    }
    if (status === WorkflowRunStepStatus.Running) {
      return 'Generating...'
    }
    if (status === WorkflowRunStepStatus.Pending) {
      return 'Pending...'
    }
    if (status === WorkflowRunStepStatus.Failed) {
      return 'Error occurred'
    }
    return 'No output yet'
  }

  // Get status indicator class
  const getStatusClass = () => {
    if (isOutputExecuted || status === WorkflowRunStepStatus.Completed) {
      return 'completed'
    }
    if (status === WorkflowRunStepStatus.Running) {
      return 'running'
    }
    if (status === WorkflowRunStepStatus.Failed) {
      return 'error'
    }
    return ''
  }

  return (
    <div
      className={`workflow-node output ${selected ? 'selected' : ''} ${getStatusClass()}`}
    >
      {/* Quick Actions Bar - appears on selection */}
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

      {/* Node Header */}
      <div className='node-header'>
        <div className='node-icon output'>
          <Send size={16} />
        </div>
        <div className='flex-1'>
          <div className='node-title'>
            Output
            {isOutputExecuted && (
              <CheckCircle2 className='ml-1 inline h-3 w-3 text-green-500' />
            )}
          </div>
          <div className='node-subtitle'>{getSubtitle()}</div>
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type='target'
        position={Position.Left}
        className='h-3 w-3 bg-secondary'
      />

      {/* Output handle for chaining */}
      <Handle
        type='source'
        position={Position.Right}
        className='h-3 w-3 border-2 border-white bg-primary'
      />
    </div>
  )
}
