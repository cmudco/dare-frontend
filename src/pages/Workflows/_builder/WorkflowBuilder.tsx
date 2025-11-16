import React from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setSavedViewport,
  collapseAllNodes,
  expandAllNodes,
  undo,
  redo,
} from '@/redux/workflowBuilderSlice'
import { isValidConnection } from '@/utils/workflowBuilder/isValidConnection'
import {
  WORKFLOW_NODE_TYPES,
  DEFAULT_EDGE_OPTIONS,
} from '@/utils/constants/workflowBuilder'
import { loadWorkflowIntoBuilder } from '@/redux/asyncThunks/workflowBuilder'
import { startWorkflowRunPolling } from '@/services/workflowRunPolling'
import { useEffect } from 'react'
import { ErrorsContext } from './ErrorsContext'
import type { NodeErrors as NodeErrorsType } from '@/redux/types/workflowBuilder'
import type { Workflow } from '@/redux/types/workflow'
import { clearNodeError as clearNodeErrorAction } from '@/redux/workflowBuilderSlice'
import Sidebar from './components/Sidebar'
import { Button } from '@/components/ui/button'
import { Minimize2, Maximize2, Undo2, Redo2 } from 'lucide-react'
import { getAgents } from '@/redux/asyncThunks/agent'

export interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  workflowId?: number
  disableEditing?: boolean
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  const dispatch = useAppDispatch()
  const reactFlowInstance = useReactFlow()

  // Get current state from Redux
  const {
    nodes,
    edges,
    errorsByNodeId,
    currentRun,
    isRunning: isWorkflowRunning,
    savedViewport,
    history,
  } = useAppSelector((state) => state.workflowBuilder)

  // Check if undo/redo is available
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
    } else if (props.initialWorkflow) {
      // For cases where workflow is passed directly (shouldn't happen often with new approach)
      console.warn(
        'InitialWorkflow passed directly - consider using workflowId instead'
      )
    }
  }, [props.workflowId, props.initialWorkflow, dispatch])

  // Start polling when a run is active and running
  useEffect(() => {
    if (currentRun?.id && isWorkflowRunning) {
      const cleanup = startWorkflowRunPolling(currentRun.id, dispatch)
      return cleanup
    }
  }, [currentRun?.id, isWorkflowRunning, dispatch])

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

  return (
    <div className='flex h-full w-full'>
      <ErrorsContext.Provider
        value={{
          errorsByNodeId,
          clearNodeError: (nodeId: string, field?: keyof NodeErrorsType) =>
            dispatch(clearNodeErrorAction({ nodeId, field })),
        }}
      >
        <Sidebar />
        <ReactFlow
          className='flex-1'
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
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color='#e5e7eb'
          />
          <Controls showZoom={true} showFitView={true} showInteractive={true} />
          {/* MiniMap temporarily disabled due to null stepNode serialization issue */}
          {/* TODO: Re-enable after backend fix to properly serialize step_node in WorkflowRunStep */}
          {/* <MiniMap
            nodeColor={(node) => {
              // Color nodes based on their type or state
              if (errorsByNodeId[node.id]) {
                return '#ef4444' // Red for errors
              }
              if (
                currentRun?.steps?.some(
                  (step) =>
                    step.stepNode && step.stepNode.toString() === node.id
                )
              ) {
                return '#10b981' // Green for completed
              }
              return '#6366f1' // Default indigo
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
            position='bottom-right'
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          /> */}
          <Panel
            position='top-right'
            className='rounded-lg border border-gray-200 bg-white p-3 shadow-md'
          >
            <div className='space-y-2 text-sm'>
              <div className='font-semibold text-gray-700'>Workflow Info</div>
              <div className='text-gray-600'>
                Nodes: <span className='font-medium'>{nodes.length}</span>
              </div>
              <div className='text-gray-600'>
                Connections: <span className='font-medium'>{edges.length}</span>
              </div>
              {isWorkflowRunning && (
                <div className='font-medium text-green-600'>▶ Running...</div>
              )}
              {Object.keys(errorsByNodeId).length > 0 && (
                <div className='font-medium text-red-600'>
                  ⚠ {Object.keys(errorsByNodeId).length} Error(s)
                </div>
              )}
              <div className='space-y-1 border-t border-gray-200 pt-2'>
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => dispatch(undo())}
                    disabled={!canUndo}
                    className='h-6 flex-1 px-2 text-xs'
                    title='Undo (Cmd/Ctrl+Z)'
                  >
                    <Undo2 className='mr-1 h-3 w-3' />
                    Undo
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => dispatch(redo())}
                    disabled={!canRedo}
                    className='h-6 flex-1 px-2 text-xs'
                    title='Redo (Cmd/Ctrl+Shift+Z)'
                  >
                    <Redo2 className='mr-1 h-3 w-3' />
                    Redo
                  </Button>
                </div>
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => dispatch(collapseAllNodes())}
                    className='h-6 flex-1 px-2 text-xs'
                    title='Collapse all nodes'
                  >
                    <Minimize2 className='mr-1 h-3 w-3' />
                    Collapse
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => dispatch(expandAllNodes())}
                    className='h-6 flex-1 px-2 text-xs'
                    title='Expand all nodes'
                  >
                    <Maximize2 className='mr-1 h-3 w-3' />
                    Expand
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </ErrorsContext.Provider>
    </div>
  )
}

export default WorkflowBuilder
