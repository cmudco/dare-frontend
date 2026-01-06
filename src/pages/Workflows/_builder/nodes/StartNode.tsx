import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  GitBranch,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateNodeDataById,
  toggleNodeCollapse,
  removeNodeWithEdges,
} from '@/redux/workflowBuilderSlice'
import { Button } from '@/components/ui/button'
import {
  HANDLE_NUMBERS,
  HANDLE_COLORS,
} from '@/utils/constants/workflowBuilder'

type Mode = 'sequential' | 'parallel'
type StartData = {
  title?: string
  description?: string
  mode?: Mode
  spareHandle?: boolean
  isCollapsed?: boolean
}

export default function StartNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string // ReactFlow guarantees id is string when component renders
  const startData = data as StartData

  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)

  // Local state for text inputs to prevent cursor jumping on re-render
  const [localTitle, setLocalTitle] = useState(startData?.title || '')
  const [localDescription, setLocalDescription] = useState(
    startData?.description || ''
  )

  // Sync local state when external data changes (e.g., undo/redo, load workflow)
  useEffect(() => {
    setLocalTitle(startData?.title || '')
  }, [startData?.title])

  useEffect(() => {
    setLocalDescription(startData?.description || '')
  }, [startData?.description])

  // Update Redux when user changes values
  const updateNodeData = useCallback(
    (updates: Partial<StartData>) => {
      dispatch(updateNodeDataById({ nodeId: nodeId, newData: updates }))
    },
    [dispatch, nodeId]
  )

  // Debounced sync to Redux for text inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTitle !== (startData?.title || '')) {
        updateNodeData({ title: localTitle })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localTitle, startData?.title, updateNodeData])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localDescription !== (startData?.description || '')) {
        updateNodeData({ description: localDescription })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localDescription, startData?.description, updateNodeData])

  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(nodeId)
  }, [updateNodeInternals, nodeId])

  // Calculate input connections from previous chains (e.g., Chat Output nodes)
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === nodeId &&
      (sourceNode?.type === 'chatOutput' || sourceNode?.type === 'start')
    )
  })

  // Calculate output connections to step nodes
  const connectedOutputEdges = edges.filter((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target)
    return edge.source === nodeId && targetNode?.type === 'step'
  })

  // Render input handles for chain connections (from Chat Output nodes)
  const renderInputHandles = () => {
    const hasInputConnection = connectedInputEdges.length > 0
    const isChainedStartNode = hasInputConnection

    return (
      <>
        {HANDLE_NUMBERS.slice(0, 3).map((num) => {
          const handleId = `input-${num}`
          const isConnected = connectedInputEdges.some(
            (edge) => edge.targetHandle === handleId
          )

          // Fixed positions for input handles
          const topPercent = 20 + num * 30

          // Show logic: always show first handle, show more if connected
          const connectedCount = connectedInputEdges.length
          const shouldShow = num <= Math.max(1, connectedCount + 1)

          // Use primary color for chain input handles
          const handleColor = isChainedStartNode
            ? 'bg-purple-500 border-purple-400'
            : 'bg-blue-500 border-blue-400'

          return (
            <Handle
              key={handleId}
              type='target'
              position={Position.Left}
              id={handleId}
              style={{
                top: `${topPercent}%`,
              }}
              className={`transition-all duration-200 ${
                isConnected
                  ? `${handleColor} !opacity-100 ring-2 ring-purple-300`
                  : shouldShow
                    ? `${handleColor} !opacity-40 hover:!opacity-80`
                    : '!opacity-0'
              }`}
            />
          )
        })}
      </>
    )
  }

  // Render multiple output handles (same pattern as StepNode inputs)
  const renderOutputHandles = () => {
    return (
      <>
        {HANDLE_NUMBERS.map((num) => {
          const handleId = `output-${num}`
          const isConnected = connectedOutputEdges.some(
            (edge) => edge.sourceHandle === handleId
          )

          // Fixed positions: 20%, 35%, 50%, 65%, 80%
          const topPercent = 5 + num * 15

          // Show logic: always show connected handles + one extra for next connection
          const connectedCount = connectedOutputEdges.length
          const shouldShow = num <= connectedCount + 1

          // Get color from constants
          const handleColor = HANDLE_COLORS[num - 1]

          return (
            <Handle
              key={handleId}
              type='source'
              position={Position.Right}
              id={handleId}
              style={{
                top: `${topPercent}%`,
              }}
              className={`transition-all duration-200 ${
                isConnected
                  ? `${handleColor} !opacity-100`
                  : shouldShow
                    ? `${handleColor} !opacity-50 hover:!opacity-80`
                    : '!opacity-0'
              }`}
            />
          )
        })}
      </>
    )
  }

  const isCollapsed = startData?.isCollapsed || false
  const isChainedStartNode = connectedInputEdges.length > 0

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''} ${
        isChainedStartNode ? 'border-l-4 border-l-purple-500' : ''
      }`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isChainedStartNode
                  ? 'bg-purple-500/20 dark:bg-purple-500/30'
                  : 'bg-primary/10 dark:bg-primary/20'
              }`}
            >
              <Play
                className={`h-3 w-3 ${isChainedStartNode ? 'text-purple-600 dark:text-purple-400' : 'text-primary'}`}
              />
            </div>
            <span>
              {isChainedStartNode ? 'Chained Workflow' : 'Start Workflow'}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => dispatch(toggleNodeCollapse(nodeId))}
              className='h-6 w-6 p-0'
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronUp className='h-4 w-4' />
              )}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => dispatch(removeNodeWithEdges({ nodeId }))}
              className='h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
              title='Delete node'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-xs font-medium'>
              Title
            </Label>
            <Input
              id='title'
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder='Enter workflow title'
              required
              className='bg-background text-sm'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description' className='text-xs font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder='Enter your description here'
              required
              className='resize-none bg-background text-sm'
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='mode' className='text-xs font-medium'>
              Execution Mode
            </Label>
            <Select
              value={startData?.mode || 'sequential'}
              onValueChange={(value: 'sequential' | 'parallel') => {
                updateNodeData({ mode: value })
              }}
            >
              <SelectTrigger className='bg-background text-sm'>
                <SelectValue placeholder='Select execution mode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='sequential'>
                  <div className='flex items-center gap-2'>
                    <ArrowRight className='h-3 w-3' />
                    Sequential
                  </div>
                </SelectItem>
                <SelectItem value='parallel'>
                  <div className='flex items-center gap-2'>
                    <GitBranch className='h-3 w-3' />
                    Parallel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='text-xs text-muted-foreground'>
            {(startData?.mode || 'sequential') === 'sequential'
              ? 'Steps execute one after another in sequence'
              : 'Multiple steps can execute simultaneously from this start point'}
          </div>
          {isChainedStartNode && (
            <div className='mt-2 rounded-md bg-purple-50 p-2 text-xs text-purple-700 dark:bg-purple-950/30 dark:text-purple-300'>
              <div className='flex items-center gap-1.5'>
                <ArrowRight className='h-3 w-3' />
                <span>This workflow receives input from a previous chain</span>
              </div>
            </div>
          )}
        </CardContent>
      )}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Card>
  )
}
