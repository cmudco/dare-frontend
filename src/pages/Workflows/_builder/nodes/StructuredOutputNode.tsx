import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { GitBranch, Settings, Copy, Trash2, Play } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  removeNodeWithEdges,
  setSelectedNodeId,
  setShowExecutionPanel,
} from '@/redux/workflowBuilderSlice'
import { ROUTE_HANDLE_PREFIX } from '@/utils/constants/workflowBuilder'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { workflowSocketExecuteSingleStep } from '@/redux/middleware/workflowSocketMiddleware'

export interface StructuredOutputRoute {
  name: string
  description: string
}

type StructuredOutputNodeData = {
  routes?: StructuredOutputRoute[]
  textInput?: string
  prompt?: number | null
  llm?: number | null
  requireHumanValidation?: boolean
  isCollapsed?: boolean
}

export default function StructuredOutputNode({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData = (data as Partial<StructuredOutputNodeData>) || {}
  const dispatch = useAppDispatch()
  const updateNodeInternals = useUpdateNodeInternals()

  // Get workflow execution data
  const {
    executedStepNodeIds,
    availableRuns,
    selectedRunIds,
    currentRun,
    activeStreamingNodeId,
    pendingValidation,
    manualModeEnabled,
    currentPartialRunId,
    lastWorkflowId,
    isRunning,
  } = useAppSelector((s) => s.workflowBuilder)

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
  const isExecuted = executedStepNodeIds.includes(id)
  const isStreaming = activeStreamingNodeId === id
  const isPendingHumanInput = pendingValidation?.nodeId === id

  // Get status indicator class for execution visualization
  const getStatusClass = () => {
    if (isPendingHumanInput) {
      return 'pending-validation'
    }
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
    if (status === WorkflowRunStepStatus.PendingHumanInput) {
      return 'pending-validation'
    }
    return ''
  }

  const statusClass = getStatusClass()

  // Memoize routes
  const routes = useMemo(
    () =>
      nodeData.routes || [
        { name: '1', description: 'First route' },
        { name: '2', description: 'Second route' },
      ],
    [nodeData.routes]
  )

  const routeNames = useMemo(
    () => routes.map((r) => r.name).join(','),
    [routes]
  )

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, routes.length, routeNames])

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

  // Handle manual step execution
  const handleRunStep = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!lastWorkflowId || isRunning) return

    // Open execution panel and trigger single step execution
    dispatch(setShowExecutionPanel(true))
    dispatch(
      workflowSocketExecuteSingleStep({
        workflowId: lastWorkflowId,
        stepNodeId: id,
        workflowRunId: currentPartialRunId || undefined,
      })
    )
  }

  // Check if this step can be run (has dependencies met)
  const canRunStep =
    manualModeEnabled && !isRunning && !isExecuted && lastWorkflowId

  return (
    <div
      className={`workflow-node conditional ${selected ? 'selected' : ''} ${statusClass}`}
    >
      {/* Status indicator dot */}
      {statusClass && (
        <div
          className={`node-status-dot ${statusClass === 'completed' ? 'success' : statusClass === 'pending-validation' ? 'running' : statusClass}`}
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
        <div className='node-icon conditional'>
          <GitBranch size={16} />
        </div>
        <div className='flex-1'>
          <div className='node-title'>Conditional</div>
          <div className='node-subtitle'>
            {routes.length} routes
            {nodeData.requireHumanValidation ? ' • Human validation' : ''}
          </div>
        </div>
      </div>

      {/* Input handle - accepts connections from previous nodes */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        className='h-3 w-3 bg-purple-500'
      />

      {/* Output handles - one for each route */}
      {routes.map((route, index) => {
        const totalRoutes = routes.length
        const spacing = 100 / (totalRoutes + 1)
        const topPercentage = spacing * (index + 1)

        return (
          <Handle
            key={`${ROUTE_HANDLE_PREFIX}${route.name}-${index}`}
            type='source'
            position={Position.Right}
            id={`${ROUTE_HANDLE_PREFIX}${route.name}`}
            style={{ top: `${topPercentage}%`, transform: 'translateY(-50%)' }}
            className='h-3 w-3 bg-purple-500'
          />
        )
      })}
    </div>
  )
}
