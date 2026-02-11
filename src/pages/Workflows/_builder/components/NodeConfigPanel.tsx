import { X } from 'lucide-react'
import type { Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateNodeDataById,
  setSelectedNodeId,
} from '@/redux/workflowBuilderSlice'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { getFilesByOwnerAPI } from '@/api/files'
import type { MyFile } from '@/redux/types/files'

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
  const userFiles = useAppSelector((s) => s.files.files)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const agents = useAppSelector((s) => s.agent.agents)
  const loadedWorkflow = useAppSelector((s) => s.workflowBuilder.loadedWorkflow)
  const fileOwnerId = loadedWorkflow?.fileOwnerId

  // State for owner files (for forked workflows)
  const [ownerFiles, setOwnerFiles] = useState<MyFile[]>([])
  const [ownerFilesLoading, setOwnerFilesLoading] = useState(false)
  const [ownerFilesError, setOwnerFilesError] = useState<string | null>(null)

  // Fetch owner files when fileOwnerId is present (forked workflow)
  useEffect(() => {
    if (fileOwnerId) {
      setOwnerFilesLoading(true)
      setOwnerFilesError(null)
      getFilesByOwnerAPI(fileOwnerId)
        .then((response) => {
          setOwnerFiles(response.results || [])
        })
        .catch(() => {
          setOwnerFiles([])
          setOwnerFilesError(
            'Failed to load shared files from original workflow'
          )
        })
        .finally(() => {
          setOwnerFilesLoading(false)
        })
    } else {
      setOwnerFiles([])
      setOwnerFilesError(null)
    }
  }, [fileOwnerId])

  // Merge user files with owner files, avoiding duplicates
  const files = useMemo(() => {
    if (!fileOwnerId || ownerFiles.length === 0) {
      return userFiles
    }
    const userFileIds = new Set(userFiles.map((f) => f.id))
    const uniqueOwnerFiles = ownerFiles.filter((f) => !userFileIds.has(f.id))
    return [...userFiles, ...uniqueOwnerFiles]
  }, [userFiles, ownerFiles, fileOwnerId])

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
            filesLoading={ownerFilesLoading}
            filesError={ownerFilesError}
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
        {nodeType === WorkflowNodeType.File && (
          <FileNodeConfig
            nodeData={nodeData as FileNodeData}
            updateNodeData={updateNodeData}
            files={files}
            filesLoading={ownerFilesLoading}
            filesError={ownerFilesError}
          />
        )}
      </div>
    </div>
  )
}
