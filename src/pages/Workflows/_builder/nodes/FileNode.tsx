import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileText, Settings, Trash2, Play } from 'lucide-react'
import { useCallback } from 'react'

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
  updateNodeDataById,
} from '@/redux/workflowBuilder'
import { EditableLabel } from '../components/EditableLabel'
import {
  HANDLE_NUMBERS,
  HANDLE_COLORS,
} from '@/utils/constants/workflowBuilder'
import { WorkflowNodeType, RetrievalMode } from '@/utils/constants/workflows'
import { useNodeExecutionState } from '@/hooks/useNodeExecutionState'

export interface FileNodeData {
  files?: number[]
  retrievalMode?: RetrievalMode
  similarityThreshold?: number
  maxResults?: number
  querySource?: string
  textInput?: string
  includeMetadata?: boolean
  label?: string
}

export default function FileNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string
  const fileData = data as FileNodeData
  const dispatch = useAppDispatch()

  const handleLabelChange = useCallback(
    (newLabel: string) => {
      dispatch(updateNodeDataById({ nodeId, newData: { label: newLabel } }))
    },
    [dispatch, nodeId]
  )

  const edges = useAppSelector((s) => s.workflowBuilder.builder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.builder.nodes)
  const files = useAppSelector((s) => s.files.files)

  const { statusClass, canRunStep, handleRunStep } =
    useNodeExecutionState(nodeId)

  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === nodeId &&
      (sourceNode?.type === WorkflowNodeType.Start ||
        sourceNode?.type === WorkflowNodeType.Step ||
        sourceNode?.type === WorkflowNodeType.ChatOutput ||
        sourceNode?.type === WorkflowNodeType.StructuredOutput)
    )
  })

  const nodeFiles = fileData.files ?? []
  const fileCount = nodeFiles.length
  const selectedFileNames = nodeFiles
    .map((fId) => files.find((f) => f.id === fId)?.name)
    .filter(Boolean)

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setSelectedNodeId(nodeId))
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId }))
  }

  const getSubtitle = () => {
    if (fileCount === 0) return 'No files selected'
    if (fileCount === 1) return selectedFileNames[0] || '1 file'
    return `${fileCount} files`
  }

  const getRetrievalLabel = () => {
    switch (fileData.retrievalMode) {
      case RetrievalMode.Embeddings:
        return 'Embeddings'
      case RetrievalMode.Content:
        return 'Content'
      case RetrievalMode.Both:
        return 'Both'
      default:
        return 'Embeddings'
    }
  }

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''} ${statusClass}`}
    >
      {statusClass && (
        <div
          className={`node-status-dot ${statusClass === 'completed' ? 'success' : statusClass}`}
        />
      )}

      {selected && (
        <div className='node-quick-actions'>
          {canRunStep && (
            <button
              className='quick-action-btn run'
              title='Run this step'
              onClick={handleRunStep}
            >
              <Play size={14} />
            </button>
          )}
          <button
            className='quick-action-btn'
            title='Configure'
            onClick={handleConfigure}
          >
            <Settings size={14} />
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
        <div className='node-icon step'>
          <FileText size={16} />
        </div>
        <div className='flex-1'>
          <EditableLabel
            value={fileData.label ?? ''}
            onChange={handleLabelChange}
            placeholder='Name this node'
          />
          <div className='node-subtitle'>{getSubtitle()}</div>
        </div>
      </div>

      {fileCount > 0 && (
        <div className='px-3 pb-2'>
          <span className='rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground'>
            {getRetrievalLabel()}
          </span>
        </div>
      )}

      {HANDLE_NUMBERS.map((num) => {
        const handleId = `input-${num}`
        const isConnected = connectedInputEdges.some(
          (edge) => edge.targetHandle === handleId
        )
        const topPercent = 5 + num * 15
        const connectedCount = connectedInputEdges.length
        const shouldShow = num <= connectedCount + 1
        const handleColor = HANDLE_COLORS[num - 1]

        return (
          <Handle
            key={handleId}
            type='target'
            position={Position.Left}
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

      <Handle
        type='source'
        position={Position.Right}
        id='default'
        className='border-2 border-white bg-primary'
      />
    </div>
  )
}
