import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Brain, Settings, Copy, Trash2, Play } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
  setShowExecutionPanel,
} from '@/redux/workflowBuilderSlice'
import {
  HANDLE_NUMBERS,
  HANDLE_COLORS,
} from '@/utils/constants/workflowBuilder'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import {
  WorkflowRunStepStatus,
  WorkflowNodeType,
} from '@/utils/constants/workflows'
import { workflowSocketExecuteSingleStep } from '@/redux/middleware/workflowSocketMiddleware'

export type StepNodeData = {
  agent: number | null
  prompt: number | null
  contentFiles: number[]
  embeddingFiles: number[]
  llm: number | null
  stepNumber: number
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  apiId?: number
  usePreviousStepFiles?: boolean
  usePreviousStepEmbeddings?: boolean
  textInput?: string
  enableWebSearch?: boolean
  id?: string
  isCollapsed?: boolean
}

export default function StepNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string
  const stepData = data as StepNodeData
  const dispatch = useAppDispatch()

  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const agents = useAppSelector((s) => s.agent.agents)
  const prompts = useAppSelector((s) => s.prompt.prompts)

  // Get workflow execution data
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

  // Get the run to display
  const displayRun = getDisplayRun(
    nodeId,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  // Get node state from the display run
  const nodeState = getNodeState(displayRun, nodeId)
  const status = nodeState?.status || null
  const isExecuted = executedStepNodeIds.includes(nodeId)
  const isStreaming = activeStreamingNodeId === nodeId

  // Get status indicator class for execution visualization
  const getStatusClass = () => {
    if (isStreaming) {
      return 'streaming'
    }
    if (isExecuted || status === WorkflowRunStepStatus.Completed) {
      return 'completed'
    }
    if (status === WorkflowRunStepStatus.Running) {
      return 'running'
    }
    if (status === WorkflowRunStepStatus.Failed) {
      return 'error'
    }
    if (status === WorkflowRunStepStatus.Pending) {
      return 'pending'
    }
    return ''
  }

  // Calculate input handles based on actual connections
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

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement duplicate
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNodeWithEdges({ nodeId }))
  }

  // Handle manual step execution
  const handleRunStep = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lastWorkflowId || isRunning) return

    // Open execution panel and trigger single step execution
    dispatch(setShowExecutionPanel(true))
    dispatch(
      workflowSocketExecuteSingleStep({
        workflowId: lastWorkflowId,
        stepNodeId: nodeId,
        workflowRunId: currentPartialRunId || undefined,
      })
    )
  }

  // Check if this step can be run (has dependencies met)
  const canRunStep =
    manualModeEnabled && !isRunning && !isExecuted && lastWorkflowId

  // Get subtitle text
  const getSubtitle = () => {
    if (selectedAgent) return selectedAgent.name
    if (selectedPrompt) return selectedPrompt.title
    return 'Configure step'
  }

  const statusClass = getStatusClass()

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
        <div className='node-icon step'>
          <Brain size={16} />
        </div>
        <div className='flex-1'>
          <div className='node-title'>Step {stepData?.stepNumber}</div>
          <div className='node-subtitle'>{getSubtitle()}</div>
        </div>
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
                ? `${handleColor} !opacity-100`
                : shouldShow
                  ? `${handleColor} !opacity-50 hover:!opacity-80`
                  : '!opacity-0'
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
