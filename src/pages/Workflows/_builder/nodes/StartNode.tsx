import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, GitBranch, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useErrorsContext } from '../ErrorsContext'

export default function StartNode({ id, data, selected }: NodeProps) {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [mode, setMode] = useState<'sequential' | 'parallel'>(((data as any)?.mode || 'sequential') as 'sequential' | 'parallel')
  const rf = useReactFlow()
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  
  // Determine how many output handles to render on Start
  // In parallel mode we want one handle per existing Step node so
  // switching from sequential -> parallel immediately exposes enough
  // connection points for all steps (even before edges are rebuilt).
  const getParallelHandleCount = () => {
    const nodes = rf.getNodes()
    const edges = rf.getEdges()

    // Consider existing edges in case handles were already assigned
    const startToStepEdges = edges.filter(
      (edge) => edge.source === id && nodes.find((n) => n.id === edge.target && n.type === 'step')
    )
    const connectedCount = startToStepEdges.length

    // Track the max handle index already in use (e.g. output-3)
    let maxHandleIndex = 0
    startToStepEdges.forEach((e) => {
      const m = String(e.sourceHandle || '').match(/output-(\d+)/)
      if (m) {
        const idx = Number(m[1])
        if (idx > maxHandleIndex) maxHandleIndex = idx
      }
    })

    // Otherwise, only show joints for existing connections (keeps UI tidy when
    // adding a new Step in parallel but not yet connected).
    return Math.max(connectedCount, maxHandleIndex, 1)
  }

  // write changes back into node data so builder reads fresh values
  useEffect(() => {
    rf.setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        const nextData: any = { ...n.data, title, description, mode }
        return { ...n, data: nextData }
      })
    )
  }, [title, description, mode, id, rf])

  // hydrate from incoming node data (prefill in edit mode)
  const hydratedOnceRef = useRef<string | null>(null)
  useEffect(() => {
    const d: any = data || {}
    const key = d?.instanceKey ?? null
    if (hydratedOnceRef.current === key) return
    if (typeof d.title === 'string') setTitle(d.title)
    if (typeof d.description === 'string') setDescription(d.description)
    if (d.mode === 'sequential' || d.mode === 'parallel') setMode(d.mode)
    hydratedOnceRef.current = key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const renderOutputHandles = () => {
    if (mode === 'parallel') {
      const handleCount = getParallelHandleCount()
      const handles = []
      for (let i = 0; i < handleCount; i++) {
        const base = 45
        const gap = 9
        const topPosition = Math.min(base + i * gap, 88)
        handles.push(
          <Handle
            key={`output-${i + 1}`}
            type='source'
            position={Position.Right}
            id={`output-${i + 1}`}
            style={{ top: `${topPosition}%` }}
            className='h-3 w-3 border-2 border-white bg-primary'
          />
        )
      }
      return <>{handles}</>
    }
    return <Handle type='source' position={Position.Right} className='h-3 w-3 border-2 border-white bg-primary' />
  }

  return (
    <Card className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}>
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
          <Label htmlFor='title' className='text-xs font-medium'>Title</Label>
          <Input id='title' value={title} onChange={(e) => { setTitle(e.target.value); clearNodeError(String(id), 'title') }} placeholder='Enter workflow title' required className={`text-sm bg-background ${
            (errorsByNodeId as any)[id]?.title ? 'border-destructive' : ''
          }`} />
          {(errorsByNodeId as any)[id]?.title && <p className='mt-1 text-xs text-destructive'>{(errorsByNodeId as any)[id]?.title}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='description' className='text-xs font-medium'>Description</Label>
          <Textarea id='description' value={description} onChange={(e) => { setDescription(e.target.value); clearNodeError(String(id), 'description') }} placeholder='Enter your description here' required className={`text-sm resize-none bg-background ${
            (errorsByNodeId as any)[id]?.description ? 'border-destructive' : ''
          }`} rows={3} />
          {(errorsByNodeId as any)[id]?.description && <p className='mt-1 text-xs text-destructive'>{(errorsByNodeId as any)[id]?.description}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='mode' className='text-xs font-medium'>Execution Mode</Label>
          <Select value={mode} onValueChange={(value: 'sequential' | 'parallel') => setMode(value)}>
            <SelectTrigger className='text-sm bg-background'>
              <SelectValue placeholder='Select execution mode' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='sequential'>
                <div className='flex items-center gap-2'><ArrowRight className='h-3 w-3' />Sequential</div>
              </SelectItem>
              <SelectItem value='parallel'>
                <div className='flex items-center gap-2'><GitBranch className='h-3 w-3' />Parallel</div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='text-xs text-muted-foreground'>
          {mode === 'sequential' ? 'Steps execute one after another in sequence' : 'Multiple steps can execute simultaneously from this start point'}
        </div>
      </CardContent>
      {renderOutputHandles()}
    </Card>
  )
}
