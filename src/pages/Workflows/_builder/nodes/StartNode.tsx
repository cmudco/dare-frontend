import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Play, Settings, Copy, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { removeNodeWithEdges, setSelectedNodeId } from '@/redux/workflowBuilder'
import {
  HANDLE_NUMBERS,
  HANDLE_COLORS,
} from '@/utils/constants/workflowBuilder'
import { WorkflowNodeType } from '@/utils/constants/workflows'

type Mode = 'sequential' | 'parallel'
type StartData = {
  title?: string
  description?: string
  mode?: Mode
  spareHandle?: boolean
  isCollapsed?: boolean
}

export default function StartNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string
  const startData = data as StartData

  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.builder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.builder.nodes)

  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(nodeId)
  }, [updateNodeInternals, nodeId])

  // Calculate input connections from previous chains
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === nodeId &&
      (sourceNode?.type === WorkflowNodeType.ChatOutput ||
        sourceNode?.type === WorkflowNodeType.Start)
    )
  })

  // Calculate output connections to step nodes
  const connectedOutputEdges = edges.filter((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target)
    return edge.source === nodeId && targetNode?.type === WorkflowNodeType.Step
  })

  const isChainedStartNode = connectedInputEdges.length > 0

  // Handle actions
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId }))
  }

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setSelectedNodeId(nodeId))
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement duplicate
  }

  // Render input handles for chain connections
  const renderInputHandles = () => {
    return (
      <>
        {HANDLE_NUMBERS.slice(0, 3).map((num) => {
          const handleId = `input-${num}`
          const isConnected = connectedInputEdges.some(
            (edge) => edge.targetHandle === handleId
          )

          const topPercent = 20 + num * 30
          const connectedCount = connectedInputEdges.length
          const shouldShow = num <= Math.max(1, connectedCount + 1)

          const handleColor = isChainedStartNode
            ? 'bg-purple-500 border-purple-400'
            : 'bg-blue-500 border-blue-400'

          return (
            <Handle
              key={handleId}
              type='target'
              position={Position.Left}
              id={handleId}
              style={{ top: `${topPercent}%` }}
              className={`transition-all duration-200 ${
                isConnected
                  ? `${handleColor} opacity-100! ring-2 ring-purple-300`
                  : shouldShow
                    ? `${handleColor} opacity-40! hover:opacity-80!`
                    : 'opacity-0!'
              }`}
            />
          )
        })}
      </>
    )
  }

  // Render output handles
  const renderOutputHandles = () => {
    return (
      <>
        {HANDLE_NUMBERS.map((num) => {
          const handleId = `output-${num}`
          const isConnected = connectedOutputEdges.some(
            (edge) => edge.sourceHandle === handleId
          )

          const topPercent = 5 + num * 15
          const connectedCount = connectedOutputEdges.length
          const shouldShow = num <= connectedCount + 1
          const handleColor = HANDLE_COLORS[num - 1]

          return (
            <Handle
              key={handleId}
              type='source'
              position={Position.Right}
              id={handleId}
              style={{ top: `${topPercent}%` }}
              className={`transition-all duration-200 ${
                isConnected
                  ? `${handleColor} opacity-100!`
                  : shouldShow
                    ? `${handleColor} opacity-50! hover:opacity-80!`
                    : 'opacity-0!'
              }`}
            />
          )
        })}
      </>
    )
  }

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''} ${isChainedStartNode ? 'chained' : ''}`}
    >
      {/* Quick Actions Bar - appears on selection */}
      {selected && (
        <div className='node-quick-actions'>
          <button
            className='quick-action-btn'
            title='Configure'
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
        <div
          className={`node-icon start ${isChainedStartNode ? 'chained' : ''}`}
        >
          <Play size={16} />
        </div>
        <div className='flex-1'>
          <div className='node-title'>
            {startData.title ||
              (isChainedStartNode ? 'Chained Workflow' : 'Start')}
          </div>
          <div className='node-subtitle'>
            {startData.mode === 'parallel' ? 'Parallel' : 'Sequential'}
          </div>
        </div>
      </div>

      {renderInputHandles()}
      {renderOutputHandles()}
    </div>
  )
}
