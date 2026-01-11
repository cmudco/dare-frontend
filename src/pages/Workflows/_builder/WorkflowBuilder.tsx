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
} from '@/redux/workflowBuilderSlice'
import { isValidConnection } from '@/utils/workflowBuilder/isValidConnection'
import {
  WORKFLOW_NODE_TYPES,
  DEFAULT_EDGE_OPTIONS,
} from '@/utils/constants/workflowBuilder'
import { loadWorkflowIntoBuilder } from '@/redux/asyncThunks/workflowBuilder'
import { getWorkflowRuns } from '@/redux/asyncThunks/workflow'
import { useWorkflowSocket } from '@/hooks/useWorkflowSocket'
import { useEffect, useCallback } from 'react'
import type { Workflow } from '@/redux/types/workflow'
import Sidebar from './components/Sidebar'
import NodeConfigPanel from './components/NodeConfigPanel'
import WorkflowExecutionPanel from './components/WorkflowExecutionPanel'
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
  const {
    nodes,
    edges,
    currentRun,
    isRunning: isWorkflowRunning,
    savedViewport,
    history,
    selectedNodeId,
    showExecutionPanel,
  } = useAppSelector((state) => state.workflowBuilder)

  // Check if undo/redo is available (used by keyboard shortcuts)
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  // Expose undo/redo via window for parent components to call
  React.useEffect(() => {
    // @ts-expect-error - exposing for parent component access
    window.__workflowUndo = () => canUndo && dispatch(undo())
    // @ts-expect-error - exposing for parent component access
    window.__workflowRedo = () => canRedo && dispatch(redo())
    // @ts-expect-error - exposing for parent component access
    window.__workflowCanUndo = () => canUndo
    // @ts-expect-error - exposing for parent component access
    window.__workflowCanRedo = () => canRedo
    return () => {
      // @ts-expect-error - cleanup
      delete window.__workflowUndo
      // @ts-expect-error - cleanup
      delete window.__workflowRedo
      // @ts-expect-error - cleanup
      delete window.__workflowCanUndo
      // @ts-expect-error - cleanup
      delete window.__workflowCanRedo
    }
  }, [canUndo, canRedo, dispatch])

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

  // Use WebSocket for real-time updates (WebSocket-only, no polling fallback)
  // Subscribe to workflow to receive execution state updates
  useWorkflowSocket({
    workflowId: props.workflowId,
  })

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
        onConnect={(connection) => dispatch(onConnect(connection))}
        isValidConnection={(connection) =>
          isValidConnection(connection, nodes, edges)
        }
        nodeTypes={WORKFLOW_NODE_TYPES}
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
          color='#e5e7eb'
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position='bottom-right'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      {/* Config Panel - shown when a node is selected */}
      {selectedNode && <NodeConfigPanel selectedNode={selectedNode} />}

      {/* Execution Panel - shown when running or explicitly opened */}
      {(isWorkflowRunning || showExecutionPanel) && <WorkflowExecutionPanel />}
    </div>
  )
}

export default WorkflowBuilder
