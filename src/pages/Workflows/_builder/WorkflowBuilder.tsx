import { forwardRef, useImperativeHandle, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setNodes, setEdges } from '@/redux/workflowBuilderSlice'
import {
  WORKFLOW_NODE_TYPES,
  DEFAULT_EDGE_OPTIONS,
} from '@/utils/constants/workflowBuilder'
import { useWorkflowOperations } from './hooks/useWorkflowOperations'
import { useNodeManagement } from './hooks/useNodeManagement'
import { useConnectionLogic } from './hooks/useConnectionLogic'
import { useWorkflowLoading } from './hooks/useWorkflowLoading'
import { NodeToolbar } from './components/NodeToolbar'
import { ErrorsContext } from './ErrorsContext'
import type { NodeErrors as NodeErrorsType } from '@/redux/types/workflowBuilder'
import type { Workflow } from '@/redux/types/workflow'
import { clearNodeError as clearNodeErrorAction } from '@/redux/workflowBuilderSlice'

export interface WorkflowBuilderHandle {
  save: () => void
  addNode: (type: string, position: { x: number; y: number }) => void
  clear: () => void
  validate: () => string[]
}
export interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  workflowId?: string
  onSaved?: (workflowId: string) => void
  disableEditing?: boolean
}

const WorkflowBuilder = forwardRef<WorkflowBuilderHandle, WorkflowBuilderProps>(
  function WorkflowBuilderComponent(props, ref) {
    const dispatch = useAppDispatch()

    // Get current state from Redux
    const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
    const edges = useAppSelector((state) => state.workflowBuilder.edges)

    // Custom hooks for complex logic
    const { serializeAndSave, clearWorkflow, validateWorkflow } =
      useWorkflowOperations({
        initialWorkflow: props.initialWorkflow,
        workflowId: props.workflowId,
        onSaved: props.onSaved,
      })

    const { addNode } = useNodeManagement({
      disableEditing: props.disableEditing,
    })

    const { handleConnection, isValidConnection } = useConnectionLogic()

    // Load workflow and handle run status updates
    const { isWorkflowRunning } = useWorkflowLoading({
      initialWorkflow: props.initialWorkflow,
      workflowId: props.workflowId,
    })

    // Handle node changes and dispatch to Redux
    const onNodesChange = useCallback(
      (changes: NodeChange[]) => {
        // Filter out 'dimensions' updates (width/height) to avoid mutating frozen
        // objects from Redux and reduce noisy updates from ResizeObserver.
        const filtered = changes.filter((c) => c.type !== 'dimensions')
        if (filtered.length === 0) return

        // Avoid passing frozen Redux state into React Flow utils
        const unfrozenNodes = nodes.map((n) => ({ ...n, data: { ...n.data } }))
        const nextNodes = applyNodeChanges(filtered, unfrozenNodes)
        dispatch(setNodes(nextNodes))
      },
      [nodes, dispatch]
    )

    // Handle edge changes and dispatch to Redux
    const onEdgesChange = useCallback(
      (changes: EdgeChange[]) => {
        const unfrozenEdges = edges.map((e) => ({ ...e }))
        const nextEdges = applyEdgeChanges(changes, unfrozenEdges)
        dispatch(setEdges(nextEdges))
      },
      [edges, dispatch]
    )

    // Expose all CRUD operations via ref
    useImperativeHandle(ref, () => ({
      save: serializeAndSave,
      addNode,
      clear: clearWorkflow,
      validate: validateWorkflow,
    }))

    const errorsByNodeId = useAppSelector(
      (s) => s.workflowBuilder.errorsByNodeId
    )

    return (
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <ErrorsContext.Provider
          value={{
            errorsByNodeId,
            clearNodeError: (nodeId: string, field?: keyof NodeErrorsType) =>
              dispatch(clearNodeErrorAction({ nodeId, field })),
          }}
        >
          <NodeToolbar
            onAddNode={addNode}
            onClear={clearWorkflow}
            disabled={props.disableEditing || isWorkflowRunning}
          />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnection}
            isValidConnection={isValidConnection}
            nodeTypes={WORKFLOW_NODE_TYPES}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </ErrorsContext.Provider>
      </div>
    )
  }
)

export default WorkflowBuilder
