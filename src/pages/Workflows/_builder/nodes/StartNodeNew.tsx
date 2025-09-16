import { Handle, Position, type NodeProps } from '@xyflow/react'
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
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { updateNodeData, clearFieldError } from '@/redux/slices/flowSlice'

export default function StartNodeNew({ id, selected }: NodeProps) {
  const dispatch = useDispatch()
  const errors = useSelector((state: RootState) => state.flow.errors[id] || {})
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [mode, setMode] = useState<'sequential' | 'parallel'>('sequential')

  const handleTitleChange = (value: string) => {
    console.log('📝 StartNode title changed:', value)
    setTitle(value)

    if (errors.title) {
      dispatch(clearFieldError({ nodeId: id, field: 'title' }))
    }

    dispatch(
      updateNodeData({
        nodeId: id,
        data: { title: value, description, mode },
      })
    )
  }

  const handleDescriptionChange = (value: string) => {
    console.log('📝 StartNode description changed:', value)
    setDescription(value)

    if (errors.description) {
      dispatch(clearFieldError({ nodeId: id, field: 'description' }))
    }

    dispatch(
      updateNodeData({
        nodeId: id,
        data: { title, description: value, mode },
      })
    )
  }

  const handleModeChange = (value: 'sequential' | 'parallel') => {
    console.log('📝 StartNode mode changed:', value)
    setMode(value)
    dispatch(
      updateNodeData({
        nodeId: id,
        data: { title, description, mode: value },
      })
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
          Start Workflow (Redux)
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='title' className='text-xs font-medium'>
            Title
          </Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder='Enter workflow title'
            className={`bg-background text-sm ${errors.title ? 'border-destructive focus:border-destructive' : ''}`}
          />
          {errors.title && (
            <p className='mt-1 text-xs text-destructive'>{errors.title}</p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='description' className='text-xs font-medium'>
            Description
          </Label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder='Enter your description here'
            className={`resize-none bg-background text-sm ${errors.description ? 'border-destructive focus:border-destructive' : ''}`}
            rows={3}
          />
          {errors.description && (
            <p className='mt-1 text-xs text-destructive'>
              {errors.description}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='mode' className='text-xs font-medium'>
            Execution Mode
          </Label>
          <Select value={mode} onValueChange={handleModeChange}>
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
          {mode === 'sequential'
            ? 'Steps execute one after another in sequence'
            : 'Multiple steps can execute simultaneously from this start point'}
        </div>
      </CardContent>
      <Handle
        type='source'
        position={Position.Right}
        className='h-3 w-3 border-2 border-white bg-primary'
      />
    </Card>
  )
}
