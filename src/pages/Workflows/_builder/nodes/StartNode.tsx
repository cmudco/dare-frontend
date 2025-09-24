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
import { Play, GitBranch, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useErrorsContext } from '../ErrorsContext'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setEdges, updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { rebuildEdgesForMode } from '@/utils/workflowBuilder/rebuildEdgesForMode'
import { edgesChanged } from '@/utils/workflowBuilder/edgesChanged'

type Mode = 'sequential' | 'parallel'
type StartData = {
  title?: string
  description?: string
  mode?: Mode
  spareHandle?: boolean
}

export default function StartNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string // ReactFlow guarantees id is string when component renders
  const startData = data as StartData

  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const startFieldErrors = (errorsByNodeId[nodeId] || {}) as Record<
    string,
    string
  >
  const dispatch = useAppDispatch()
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)

  // Update Redux when user changes values
  const updateNodeData = (updates: Partial<StartData>) => {
    dispatch(updateNodeDataById({ nodeId: nodeId, newData: updates }))
  }

  // Get number of step nodes for parallel mode handle rendering
  const stepCount = nodes.filter((n) => n.type === 'step').length
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(nodeId)
  }, [updateNodeInternals, nodeId, startData?.mode, stepCount])

  useEffect(() => {
    if (!nodes.some((n) => n.id === nodeId)) return

    const rebuiltEdges = rebuildEdgesForMode(
      nodeId,
      startData?.mode || 'sequential',
      nodes
    )
    if (edgesChanged(edges, rebuiltEdges)) {
      dispatch(setEdges(rebuiltEdges))
    }
  }, [dispatch, startData?.mode])

  const renderOutputHandles = () => {
    if ((startData?.mode || 'sequential') === 'parallel') {
      // Render handles for each step + one extra for potential new steps
      const handleCount = Math.max(stepCount, 1)
      const handles = []
      for (let i = 0; i < handleCount; i++) {
        const topPosition = 45 + i * 10 // Simple spacing
        handles.push(
          <Handle
            key={`output-${i + 1}`}
            type='source'
            position={Position.Right}
            id={`output-${i + 1}`}
            style={{ top: `${Math.min(topPosition, 85)}%` }}
            className='h-4 w-4 border-2 border-white bg-primary'
          />
        )
      }
      return <>{handles}</>
    }

    // Sequential mode - single handle
    return (
      <Handle
        type='source'
        position={Position.Right}
        className='h-3 w-3 border-2 border-white bg-primary'
      />
    )
  }

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium text-card-foreground'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
            <Play className='h-3 w-3 text-primary' />
          </div>
          Start Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='title' className='text-xs font-medium'>
            Title
          </Label>
          <Input
            id='title'
            value={startData?.title || ''}
            onChange={(e) => {
              const newTitle = e.target.value
              updateNodeData({ title: newTitle })
              clearNodeError(nodeId, 'title')
            }}
            placeholder='Enter workflow title'
            required
            className={`bg-background text-sm ${
              startFieldErrors.title ? 'border-destructive' : ''
            }`}
          />
          {startFieldErrors.title && (
            <p className='mt-1 text-xs text-destructive'>
              {startFieldErrors.title}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='description' className='text-xs font-medium'>
            Description
          </Label>
          <Textarea
            id='description'
            value={startData?.description || ''}
            onChange={(e) => {
              const newDescription = e.target.value
              updateNodeData({ description: newDescription })
              clearNodeError(nodeId, 'description')
            }}
            placeholder='Enter your description here'
            required
            className={`resize-none bg-background text-sm ${
              startFieldErrors.description ? 'border-destructive' : ''
            }`}
            rows={3}
          />
          {startFieldErrors.description && (
            <p className='mt-1 text-xs text-destructive'>
              {startFieldErrors.description}
            </p>
          )}
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
      </CardContent>
      {renderOutputHandles()}
    </Card>
  )
}
