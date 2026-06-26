import { X } from 'lucide-react'
import type { Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateNodeDataById, setSelectedNodeId } from '@/redux/workflowBuilder'
import { useCallback, useEffect } from 'react'
import { getActiveModels } from '@/redux/asyncThunks/conversation'

// Import node-specific config components
import StartNodeConfig, { type StartNodeData } from './StartNodeConfig'
import StepNodeConfig, { type StepNodeData } from './StepNodeConfig'
import StructuredOutputNodeConfig, {
  type StructuredOutputNodeData,
} from './StructuredOutputNodeConfig'
import ChatOutputNodeConfig from './ChatOutputNodeConfig'
import NotesNodeConfig from './NotesNodeConfig'
import FileNodeConfig, { type FileNodeData } from './FileNodeConfig'
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
  const tags = useAppSelector((s) => s.tags.tags)
  const availableModels = useAppSelector((s) => s.conversation.activeModels)
  const agents = useAppSelector((s) => s.agent.agents)

  useEffect(() => {
    if (availableModels.length === 0) {
      dispatch(getActiveModels())
    }
  }, [availableModels.length, dispatch])

  const nodeType = selectedNode.type
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
      case 'file':
        return 'File Retrieval'
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
      case 'file':
        return 'Configure file retrieval settings'
      default:
        return "Configure this node's settings"
    }
  }

  return (
    <div className='absolute top-0 right-0 z-20 flex h-full w-[45vw] flex-col border-l border-border/50 bg-card/95 shadow-lg backdrop-blur-xs'>
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
        {(() => {
          switch (nodeType) {
            case WorkflowNodeType.Start:
              return (
                <StartNodeConfig
                  nodeData={selectedNode.data as StartNodeData}
                  updateNodeData={updateNodeData}
                />
              )
            case WorkflowNodeType.Step:
              return (
                <StepNodeConfig
                  key={nodeId}
                  nodeData={selectedNode.data as unknown as StepNodeData}
                  updateNodeData={updateNodeData}
                  prompts={prompts}
                  files={files}
                  availableModels={availableModels}
                  agents={agents}
                  tags={tags}
                />
              )
            case WorkflowNodeType.StructuredOutput:
              return (
                <StructuredOutputNodeConfig
                  nodeData={selectedNode.data as StructuredOutputNodeData}
                  updateNodeData={updateNodeData}
                  prompts={prompts}
                  availableModels={availableModels}
                />
              )
            case WorkflowNodeType.ChatOutput:
              return <ChatOutputNodeConfig nodeId={nodeId} />
            case WorkflowNodeType.Notes:
              return (
                <NotesNodeConfig
                  nodeData={selectedNode.data as { content?: string }}
                  updateNodeData={updateNodeData}
                />
              )
            case WorkflowNodeType.File:
              return (
                <FileNodeConfig
                  nodeData={selectedNode.data as FileNodeData}
                  updateNodeData={updateNodeData}
                  files={files}
                />
              )
            default:
              return null
          }
        })()}
      </div>
    </div>
  )
}
