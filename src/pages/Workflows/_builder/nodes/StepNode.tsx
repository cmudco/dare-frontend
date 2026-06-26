import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Brain, Settings, Trash2, Play, Link2 } from 'lucide-react'
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
import { WorkflowNodeType } from '@/utils/constants/workflows'
import { useNodeExecutionState } from '@/hooks/useNodeExecutionState'

export type StepNodeData = {
  agent: number | null
  prompt: number | null
  contentFiles: number[]
  embeddingFiles?: number[]
  tags?: number[]
  llm: number | null
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  apiId?: number
  usePreviousStepFiles?: boolean
  usePreviousStepEmbeddings?: boolean
  usePreviousContext?: boolean
  textInput?: string
  enableWebSearch?: boolean
  id?: string
  isCollapsed?: boolean
}

export default function StepNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string
  const stepData = data as StepNodeData & { label?: string }
  const dispatch = useAppDispatch()

  const handleLabelChange = useCallback(
    (newLabel: string) => {
      dispatch(updateNodeDataById({ nodeId, newData: { label: newLabel } }))
    },
    [dispatch, nodeId]
  )

  const edges = useAppSelector((s) => s.workflowBuilder.builder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.builder.nodes)
  const agents = useAppSelector((s) => s.agent.agents)
  const prompts = useAppSelector((s) => s.prompt.prompts)

  const { statusClass, canRunStep, handleRunStep } =
    useNodeExecutionState(nodeId)

  // Calculate input handles based on actual connections
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === nodeId &&
      (sourceNode?.type === WorkflowNodeType.Start ||
        sourceNode?.type === WorkflowNodeType.Step ||
        sourceNode?.type === WorkflowNodeType.ChatOutput ||
        sourceNode?.type === WorkflowNodeType.StructuredOutput ||
        sourceNode?.type === WorkflowNodeType.File)
    )
  })

  // Get display info
  const selectedAgent = stepData.agent
    ? agents.find((a) => a.id === stepData.agent)
    : null
  const selectedPrompt = stepData.prompt
    ? prompts.find((p) => p.id === stepData.prompt)
    : null

  // Quick action handlers
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setSelectedNodeId(nodeId))
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId }))
  }

  // Get subtitle text
  const getSubtitle = () => {
    if (selectedAgent) return selectedAgent.name
    if (selectedPrompt) return selectedPrompt.title
    return 'Configure step'
  }

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''} ${statusClass}`}
    >
      {/* Status indicator dot */}
      {statusClass && (
        <div
          className={`node-status-dot ${statusClass === 'completed' ? 'success' : statusClass}`}
        />
      )}

      {/* Quick Actions Bar - appears on selection */}
      {selected && (
        <div className='node-quick-actions'>
          {/* Run button - only in manual mode */}
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

      {/* Node Header */}
      <div className='node-header'>
        <div className='node-icon step'>
          <Brain size={16} />
        </div>
        <div className='flex-1'>
          <EditableLabel
            value={stepData?.label ?? ''}
            onChange={handleLabelChange}
            placeholder='Name this node'
          />
          <div className='node-subtitle'>{getSubtitle()}</div>
        </div>
        {(stepData?.usePreviousContext ?? true) &&
          connectedInputEdges.length > 0 && (
            <div
              className='flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-600'
              title="This step includes upstream nodes' outputs in its prompt"
            >
              <Link2 size={10} />
              Context
            </div>
          )}
      </div>

      {/* Input handles - 5 fixed colorful handles for all connections */}
      {HANDLE_NUMBERS.map((num) => {
        const handleId = `input-${num}`
        const isConnected = connectedInputEdges.some(
          (edge) => edge.targetHandle === handleId
        )

        // Fixed positions: 20%, 35%, 50%, 65%, 80%
        const topPercent = 5 + num * 15

        // Show logic: always show connected handles + one extra for next connection
        const connectedCount = connectedInputEdges.length
        const shouldShow = num <= connectedCount + 1

        // Get color from constants
        const handleColor = HANDLE_COLORS[num - 1]

        return (
          <Handle
            key={handleId}
            type='target'
            position={Position.Left}
            id={handleId}
            style={{
              top: `${topPercent}%`,
            }}
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

      {/* Default output handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='default'
        className='border-2 border-white bg-primary'
      />
    </div>
  )
}
