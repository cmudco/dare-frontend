import { X } from 'lucide-react'
import type { Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateNodeDataById,
  setSelectedNodeId,
} from '@/redux/workflowBuilderSlice'
import { useCallback } from 'react'

// Import node-specific config components
import StartNodeConfig, { type StartNodeData } from './StartNodeConfig'
import StepNodeConfig, { type StepNodeData } from './StepNodeConfig'
import StructuredOutputNodeConfig, {
  type StructuredOutputNodeData,
} from './StructuredOutputNodeConfig'
import ChatOutputNodeConfig from './ChatOutputNodeConfig'
import NotesNodeConfig from './NotesNodeConfig'
import { WorkflowNodeType } from '@/utils/constants/workflows'

interface NodeConfigPanelProps {
  selectedNode: Node
}

export default function NodeConfigPanel({
  selectedNode,
}: NodeConfigPanelProps) {
  const dispatch = useAppDispatch()

  // Get data from Redux
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const files = useAppSelector((s) => s.files.files)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const agents = useAppSelector((s) => s.agent.agents)

  const nodeType = selectedNode.type
  const nodeData = selectedNode.data as Record<string, unknown>
  const nodeId = selectedNode.id

  // Update node data helper
  const updateNodeData = useCallback(
    (updates: Record<string, unknown>) => {
      dispatch(updateNodeDataById({ nodeId, newData: updates }))
    },
    [dispatch, nodeId]
  )

  // Close panel
  const handleClose = () => {
    dispatch(setSelectedNodeId(null))
  }

  // Get panel title based on node type
  const getPanelTitle = () => {
    switch (nodeType) {
      case 'start':
        return 'Start Configuration'
      case 'step':
        return 'Step Configuration'
      case 'structuredOutput':
        return 'Conditional Configuration'
      case 'chatOutput':
        return 'Output'
      case 'notes':
        return 'Note'
      default:
        return 'Node Configuration'
    }
  }

  // Get panel description based on node type
  const getPanelDescription = () => {
    switch (nodeType) {
      case 'start':
        return 'Configure the workflow entry point'
      case 'step':
        return 'Configure prompt, files, and LLM settings'
      case 'structuredOutput':
        return 'Configure routing decision logic'
      case 'chatOutput':
        return 'View response and select version'
      case 'notes':
        return 'Add documentation or comments'
      default:
        return "Configure this node's settings"
    }
  }

  return (
    <div className='absolute right-0 top-0 z-20 flex h-full w-[45vw] flex-col border-l border-border/50 bg-white/95 shadow-lg backdrop-blur-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border p-4'>
        <div>
          <h3 className='font-semibold text-foreground'>{getPanelTitle()}</h3>
          <p className='text-xs text-muted-foreground'>
            {getPanelDescription()}
          </p>
        </div>
        <Button variant='ghost' size='sm' onClick={handleClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className='flex-1 overflow-y-auto p-4'>
        {nodeType === WorkflowNodeType.Start && (
          <StartNodeConfig
            nodeData={nodeData as StartNodeData}
            updateNodeData={updateNodeData}
          />
        )}
        {nodeType === WorkflowNodeType.Step && (
          <StepNodeConfig
            nodeData={nodeData as StepNodeData}
            updateNodeData={updateNodeData}
            prompts={prompts}
            files={files}
            availableModels={availableModels}
            agents={agents}
          />
        )}
        {nodeType === WorkflowNodeType.StructuredOutput && (
          <StructuredOutputNodeConfig
            nodeData={nodeData as StructuredOutputNodeData}
            updateNodeData={updateNodeData}
            prompts={prompts}
            availableModels={availableModels}
          />
        )}
        {nodeType === WorkflowNodeType.ChatOutput && (
          <ChatOutputNodeConfig nodeId={nodeId} />
        )}
        {nodeType === WorkflowNodeType.Notes && (
          <NotesNodeConfig
            nodeData={nodeData as { content?: string }}
            updateNodeData={updateNodeData}
          />
        )}
      </div>
    </div>
  )
}
