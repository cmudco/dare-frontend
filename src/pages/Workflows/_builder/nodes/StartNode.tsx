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
import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useErrorsContext } from '../ErrorsContext'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setEdges } from '@/redux/workflowBuilderSlice'

type Mode = 'sequential' | 'parallel'
type StartData = {
  title?: string
  description?: string
  mode?: Mode
  spareHandle?: boolean
  instanceKey?: string
}

export default function StartNode({ id, data, selected }: NodeProps) {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [mode, setMode] = useState<Mode>(
    ((data as StartData)?.mode || 'sequential') as Mode
  )
  const rf = useReactFlow()
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const startFieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const reduxEdges = useAppSelector((s) => s.workflowBuilder.edges)

  // Determine how many output handles to render on Start
  // In parallel mode we want one handle per existing Step node so
  // switching from sequential -> parallel immediately exposes enough
  // connection points for all steps (even before edges are rebuilt).
  const getParallelHandleCount = () => {
    const nodes = rf.getNodes()
    const edges = rf.getEdges()

    // Consider existing edges in case handles were already assigned
    const startToStepEdges = edges.filter(
      (edge) =>
        edge.source === id &&
        nodes.find((n) => n.id === edge.target && n.type === 'step')
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
        const nextData: StartData = {
          ...(n.data as StartData),
          title,
          description,
          mode,
        }
        return { ...n, data: nextData }
      })
    )
  }, [title, description, mode, id, rf])

  // When mode changes, rebuild Start-related edges for consistency with mode
  useEffect(() => {
    const nodes = rf.getNodes()
    const nodesMap = new Map(nodes.map((n) => [n.id, n]))
    const isType = (id: string | null | undefined, t: string) => {
      if (!id) return false
      return nodesMap.get(id)?.type === t
    }

    // Extract step nodes sorted by stepNumber
    const stepNodes = nodes
      .filter((n) => n.type === 'step')
      .slice()
      .sort(
        (a, b) =>
          Number((a.data as { stepNumber?: number } | undefined)?.stepNumber) -
          Number((b.data as { stepNumber?: number } | undefined)?.stepNumber)
      )

    // Keep existing Step -> Output edges (authoritative mapping)
    const stepToOutputEdges = reduxEdges.filter(
      (e) => isType(e.source, 'step') && isType(e.target, 'chatOutput')
    )

    const startToStepEdges = () => {
      if (mode === 'parallel') {
        return stepNodes.map((step, idx) => ({
          id: `e-start-${step.id}`,
          source: id,
          target: step.id,
          type: 'smoothstep' as const,
          sourceHandle: `output-${idx + 1}`,
        }))
      }
      if (stepNodes.length === 0) return []
      const first = stepNodes[0]
      return [
        {
          id: `e-start-${first.id}`,
          source: id,
          target: first.id,
          type: 'smoothstep' as const,
          sourceHandle: null,
        },
      ]
    }

    const outputToStepEdges = () => {
      if (mode !== 'sequential') return []
      const links: Array<{
        id: string
        source: string
        target: string
        type: 'smoothstep'
      }> = []
      // Map step id -> its output id via step->output edges
      const stepToOutputMap = new Map<string, string>()
      stepToOutputEdges.forEach((e) => {
        stepToOutputMap.set(e.source, e.target)
      })
      for (let i = 0; i < stepNodes.length - 1; i++) {
        const curr = stepNodes[i]
        const next = stepNodes[i + 1]
        const outId = stepToOutputMap.get(curr.id)
        if (!outId) continue
        links.push({
          id: `e-${outId}-${next.id}`,
          source: outId,
          target: next.id,
          type: 'smoothstep' as const,
        })
      }
      return links
    }

    const desiredEdges = [
      ...stepToOutputEdges,
      ...startToStepEdges(),
      ...outputToStepEdges(),
    ]

    // Build comparable signatures to avoid redundant dispatches
    const sig = (e: {
      id: string
      source: string
      target: string
      sourceHandle?: string | null
      type?: string
    }) =>
      `${e.id}|${e.source}|${e.target}|${e.sourceHandle ?? ''}|${e.type ?? ''}`
    const desiredSig = desiredEdges.map(sig).sort().join(';')
    const currentSig = reduxEdges
      .filter((e) => {
        // keep only edges we manage
        const sType = nodesMap.get(e.source)?.type
        const tType = nodesMap.get(e.target)?.type
        return (
          (sType === 'step' && tType === 'chatOutput') ||
          (sType === 'chatOutput' && tType === 'step') ||
          (sType === 'start' && tType === 'step')
        )
      })
      .map(sig)
      .sort()
      .join(';')

    if (desiredSig !== currentSig) {
      dispatch(setEdges(desiredEdges))
    }
  }, [mode, id, rf, reduxEdges, dispatch])

  // hydrate from incoming node data (prefill in edit mode)
  const hydratedOnceRef = useRef<string | null>(null)
  useEffect(() => {
    const d: StartData = (data as StartData) || {}
    const key = d?.instanceKey ?? null

    console.log('🎯 START NODE HYDRATION:', {
      nodeId: id,
      data: d,
      instanceKey: key,
      previousKey: hydratedOnceRef.current,
      willHydrate: hydratedOnceRef.current !== key,
    })

    if (hydratedOnceRef.current === key) return
    if (typeof d.title === 'string') setTitle(d.title)
    if (typeof d.description === 'string') setDescription(d.description)
    if (d.mode === 'sequential' || d.mode === 'parallel') setMode(d.mode)
    hydratedOnceRef.current = key

    console.log('✅ START NODE HYDRATED:', {
      title: d.title,
      description: d.description,
      mode: d.mode,
    })
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
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              clearNodeError(String(id), 'title')
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
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              clearNodeError(String(id), 'description')
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
            value={mode}
            onValueChange={(value: 'sequential' | 'parallel') => setMode(value)}
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
          {mode === 'sequential'
            ? 'Steps execute one after another in sequence'
            : 'Multiple steps can execute simultaneously from this start point'}
        </div>
      </CardContent>
      {renderOutputHandles()}
    </Card>
  )
}
