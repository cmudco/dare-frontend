import React from 'react'
import {
  ReactFlow,
  Background,
  Controls,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { onNodesChange, onEdgesChange, onConnect, resetBuilder } from '@/redux/workflowBuilderSlice'
import { isValidConnection } from '@/utils/workflowBuilder/connectionHelpers'
import {
  WORKFLOW_NODE_TYPES,
  DEFAULT_EDGE_OPTIONS,
} from '@/utils/constants/workflowBuilder'
import { useWorkflowLoading } from './hooks/useWorkflowLoading'
import { NodeToolbar } from './components/NodeToolbar'
import { ErrorsContext } from './ErrorsContext'
import type { NodeErrors as NodeErrorsType } from '@/redux/types/workflowBuilder'
import type { Workflow } from '@/redux/types/workflow'
import { clearNodeError as clearNodeErrorAction } from '@/redux/workflowBuilderSlice'

export interface WorkflowBuilderProps {
  initialWorkflow?: Workflow
  workflowId?: string
  disableEditing?: boolean
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  const dispatch = useAppDispatch()

  // Get current state from Redux
  const nodes = useAppSelector((state) => state.workflowBuilder.nodes)
  const edges = useAppSelector((state) => state.workflowBuilder.edges)

  // Load workflow and handle run status updates
  const { isWorkflowRunning } = useWorkflowLoading({
    initialWorkflow: props.initialWorkflow,
    workflowId: props.workflowId,
  })

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
          disabled={props.disableEditing || isWorkflowRunning}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => dispatch(onNodesChange(changes))}
          onEdgesChange={(changes) => dispatch(onEdgesChange(changes))}
          onConnect={(connection) => dispatch(onConnect(connection))}
          isValidConnection={(connection) => isValidConnection(connection, nodes, edges)}
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

export default WorkflowBuilder
