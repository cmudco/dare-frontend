import React, { useEffect } from 'react'
import { type NodeTypes, Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useSelector } from 'react-redux'
import {
  onConnect,
  onEdgesChange,
  onNodesChange,
} from '@/redux/slices/flowSlice'
import { RootState } from '@/redux/store'
import SidebarNew from './components/SidebarNew'
import FlowToolbar from './components/FlowToolbar'
import StartNodeNew from './nodes/StartNodeNew'
import StepNodeNew from './nodes/StepNodeNew'
import OutputNodeNew from './nodes/OutputNodeNew'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { getFiles } from '@/redux/asyncThunks/file'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { useAppDispatch } from '@/redux/hooks'

const nodeTypes: NodeTypes = {
  start: StartNodeNew,
  step: StepNodeNew,
  output: OutputNodeNew,
}

const WorkflowBuilderNew: React.FC = () => {
  const dispatch = useAppDispatch()
  const { nodes, edges } = useSelector((state: RootState) => state.flow)

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getPrompts())
    dispatch(getAvailableModels())
  }, [dispatch])

  return (
    <div className='flex h-screen'>
      <SidebarNew />
      <div className='relative flex-1'>
        <FlowToolbar />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={(changes) => dispatch(onNodesChange(changes))}
          onEdgesChange={(changes) => dispatch(onEdgesChange(changes))}
          onConnect={(connection) => dispatch(onConnect(connection))}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

export default WorkflowBuilderNew
