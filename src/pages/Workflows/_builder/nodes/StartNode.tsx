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
import { useEffect } from 'react'
import { useErrorsContext } from '../ErrorsContext'
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

  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const startFieldErrors = (errorsByNodeId[nodeId] || {}) as Record<
    string,
    string
  >
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)

  // Update Redux when user changes values
  const updateNodeData = (updates: Partial<StartData>) => {
    dispatch(updateNodeDataById({ nodeId: nodeId, newData: updates }))
  }

  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(nodeId)
  }, [updateNodeInternals, nodeId])

  // Calculate output connections to step nodes
  const connectedOutputEdges = edges.filter((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target)
    return edge.source === nodeId && targetNode?.type === 'step'
  })

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

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
              <Play className='h-3 w-3 text-primary' />
            </div>
            Start Workflow
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
      )}
      {renderOutputHandles()}
    </Card>
  )
}
