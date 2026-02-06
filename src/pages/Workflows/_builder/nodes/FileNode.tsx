import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileText, Settings, Trash2, Play } from 'lucide-react'

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
} from '@/redux/workflowBuilderSlice'
import {
  HANDLE_NUMBERS,
  HANDLE_COLORS,
} from '@/utils/constants/workflowBuilder'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
  RetrievalMode,
} from '@/utils/constants/workflows'
import { saveAndExecuteStep } from '@/redux/asyncThunks/workflowBuilder'

export interface FileNodeData {
  files?: number[]
  retrievalMode?: RetrievalMode
  similarityThreshold?: number
  maxResults?: number
  querySource?: string
  textInput?: string
  includeMetadata?: boolean
  stepNumber?: number
}

export default function FileNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string
  const fileData = data as FileNodeData
  const dispatch = useAppDispatch()

  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const files = useAppSelector((s) => s.files.files)

  const {
    executedStepNodeIds,
    availableRuns,
    selectedRunIds,
    currentRun,
    activeStreamingNodeId,
    manualModeEnabled,
    currentPartialRunId,
    lastWorkflowId,
    isRunning,
  } = useAppSelector((s) => s.workflowBuilder)

  const displayRun = getDisplayRun(
    nodeId,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  const nodeState = getNodeState(displayRun, nodeId)
  const status = nodeState?.status || null
  const isExecuted = executedStepNodeIds.includes(nodeId)
  const isStreaming = activeStreamingNodeId === nodeId

  const getStatusClass = () => {
    if (isStreaming) return 'streaming'
    if (isExecuted || status === WorkflowRunStepStatus.Completed)
      return 'completed'
    if (status === WorkflowRunStepStatus.Running) return 'running'
    if (status === WorkflowRunStepStatus.Failed) return 'error'
    if (status === WorkflowRunStepStatus.Pending) return 'pending'
    return ''
  }

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

  const fileCount = fileData?.files?.length || 0
  const selectedFileNames = (fileData?.files || [])
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

  const canRunStep = manualModeEnabled && !isRunning && lastWorkflowId

  const getSubtitle = () => {
    if (fileCount === 0) return 'No files selected'
    if (fileCount === 1) return selectedFileNames[0] || '1 file'
    return `${fileCount} files`
  }

  const getRetrievalLabel = () => {
    switch (fileData?.retrievalMode) {
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

  const statusClass = getStatusClass()

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
          <div className='node-title'>File {fileData?.stepNumber}</div>
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
                ? `${handleColor} !opacity-100`
                : shouldShow
                  ? `${handleColor} !opacity-50 hover:!opacity-80`
                  : '!opacity-0'
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
