import React from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './workflow-builder.css'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setSavedViewport,
  undo,
  redo,
  setSelectedNodeId,
} from '@/redux/workflowBuilder'
import { isValidConnection } from '@/utils/workflowBuilder/isValidConnection'
import { wouldCreateCycle } from '@/utils/workflowBuilder/detectCycle'
import { toast } from '@/utils/toast'
import type { Connection } from '@xyflow/react'
import {
  WORKFLOW_NODE_TYPES,
  WORKFLOW_EDGE_TYPES,
  DEFAULT_EDGE_OPTIONS,
} from '@/utils/constants/workflowBuilder'
import { loadWorkflowIntoBuilder } from '@/redux/asyncThunks/workflowBuilder'
import { getWorkflowRuns } from '@/redux/asyncThunks/workflow'
import { useEffect, useCallback } from 'react'
import type { Workflow } from '@/redux/types/workflow'
import Sidebar from './components/Sidebar'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowExecutionPanel from './components/WorkflowExecutionPanel'
import { ArtifactSidecar } from '@/components/Artifacts'
import { getAgents } from '@/redux/asyncThunks/agent'
import { useWorkflowPaste } from '@/hooks/useWorkflowPaste'
import { getNodeColor } from '@/utils/workflowBuilder/getNodeColor'

export interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  workflowId?: number
  disableEditing?: boolean
  viewMode?: boolean // True when viewing completed runs, false when editing/running
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  const dispatch = useAppDispatch()
  const reactFlowInstance = useReactFlow()

  // Get current state from Redux
  const { nodes, edges, savedViewport, history, selectedNodeId } =
    useAppSelector((state) => state.workflowBuilder.builder)
  const { currentRun, showExecutionPanel } = useAppSelector(
    (state) => state.workflowBuilder.execution
  )

  // Check if undo/redo is available (used by keyboard shortcuts)
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Load agents on mount
  useEffect(() => {
    dispatch(getAgents())
  }, [dispatch])

  // Load workflow when workflowId or initialWorkflow changes
  useEffect(() => {
    if (props.workflowId) {
      dispatch(loadWorkflowIntoBuilder(props.workflowId))
      // Fetch workflow run versions for the dropdown
      dispatch(getWorkflowRuns(props.workflowId))
    } else if (props.initialWorkflow) {
      // For cases where workflow is passed directly (shouldn't happen often with new approach)
      console.warn(
        'InitialWorkflow passed directly - consider using workflowId instead'
      )
    }
  }, [props.workflowId, props.initialWorkflow, dispatch])

  // NOTE: WebSocket subscription is handled by parent WorkflowEditPage.tsx
  // Do NOT subscribe here to avoid duplicate subscriptions causing state race conditions

  useEffect(() => {
    if (savedViewport && nodes.length > 0) {
      // Small delay to ensure ReactFlow is fully initialized
      const timeoutId = setTimeout(() => {
        reactFlowInstance.setViewport(savedViewport, { duration: 0 })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [reactFlowInstance, savedViewport, nodes.length])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      const isCmdOrCtrl = event.metaKey || event.ctrlKey

      if (!isCmdOrCtrl) return

      // Undo: Cmd+Z or Ctrl+Z (without Shift)
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        if (canUndo) {
          dispatch(undo())
        }
      }

      // Redo: Cmd+Shift+Z or Ctrl+Shift+Z
      if (event.key === 'z' && event.shiftKey) {
        event.preventDefault()
        if (canRedo) {
          dispatch(redo())
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, canUndo, canRedo])

  // Enable workflow paste functionality (Ctrl+V / Cmd+V)
  // Respects disableEditing prop and workflow running state
  useWorkflowPaste({ disabled: props.disableEditing })

  // Handle node double click to open config panel
  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      dispatch(setSelectedNodeId(node.id))
    },
    [dispatch]
  )

  // Handle pane click to close config panel
  const handlePaneClick = useCallback(() => {
    dispatch(setSelectedNodeId(null))
  }, [dispatch])

  // Reject connections that would create a cycle; the execution engine
  // requires a DAG (backend enforces the same rule via WorkflowValidator).
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (wouldCreateCycle(connection, edges)) {
        toast.error('Connection rejected: would create a loop in the workflow.')
        return
      }
      dispatch(onConnect(connection))
    },
    [dispatch, edges]
  )

  // Get the selected node data for config panel
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null

  return (
    <div className='relative h-full w-full'>
      <Sidebar />
      <ReactFlow
        className='workflow-builder-canvas'
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => dispatch(onNodesChange(changes))}
        onEdgesChange={(changes) => dispatch(onEdgesChange(changes))}
        onConnect={handleConnect}
        isValidConnection={(connection) =>
          isValidConnection(connection, nodes, edges)
        }
        nodeTypes={WORKFLOW_NODE_TYPES}
        edgeTypes={WORKFLOW_EDGE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        onMoveEnd={(_, viewport) => dispatch(setSavedViewport(viewport))}
        fitView={!savedViewport}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        minZoom={0.1}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color='var(--border)'
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position='bottom-right'
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--card) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            border:
              '1px solid color-mix(in oklab, var(--border) 50%, transparent)',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          nodeColor={(node) => getNodeColor(node, currentRun?.nodeStates)}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position='bottom-left'
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--card) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            border:
              '1px solid color-mix(in oklab, var(--border) 50%, transparent)',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      {/* Config Panel - shown when a node is selected */}
      {selectedNode && <NodeConfigPanel selectedNode={selectedNode} />}

      {/* Execution Panel - shown based on showExecutionPanel state */}
      {showExecutionPanel && <WorkflowExecutionPanel />}

      {/* Artifact sidecar — opens when a step creates or the user selects
          an artifact; overlays the canvas from the right edge */}
      <div className='absolute inset-y-0 right-0 z-40 flex h-full'>
        <ArtifactSidecar />
      </div>
    </div>
  )
}

export default WorkflowBuilder
