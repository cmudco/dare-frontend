import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Gauge, Info, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setEdges, updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { getStepStatus, renderStatusPill } from '@/utils/workflowUtils'
import React from 'react'

export type AggregatorNodeData = {
  scoringMode: 'quantitative' | 'qualitative'
  customPrompt: string
  stepNumber: number
  id?: string
}

export default function AggregatorNode({ id, data, selected }: NodeProps) {
  const nodeData =
    (data as unknown as AggregatorNodeData) || ({} as AggregatorNodeData)
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const updateNodeInternals = useUpdateNodeInternals()

  // Calculate input handles based on actual connections
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === id &&
      (sourceNode?.type === 'step' || sourceNode?.type === 'chatOutput')
    )
  })

  // Show connected inputs + one spare handle for new connections
  const inputHandleCount = Math.max(connectedInputEdges.length + 1, 1)

  // Local state for form inputs
  const [scoringMode, setScoringMode] = useState<
    'quantitative' | 'qualitative'
  >(nodeData.scoringMode || 'quantitative')
  const [customPrompt, setCustomPrompt] = useState(
    nodeData.customPrompt ||
      'Evaluate the quality of the responses and provide a score based on accuracy, relevance, and clarity.'
  )

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<AggregatorNodeData>) => {
    dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
  }

  // Sync local state with props data when it changes (from Redux)
  useEffect(() => {
    const newData = data as AggregatorNodeData
    if (newData.scoringMode && newData.scoringMode !== scoringMode) {
      setScoringMode(newData.scoringMode)
    }
    if (
      newData.customPrompt !== undefined &&
      newData.customPrompt !== customPrompt
    ) {
      setCustomPrompt(newData.customPrompt)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const pruneInvalidAggregatorEdges = (
    mode: 'quantitative' | 'qualitative'
  ) => {
    const allowedHandles =
      mode === 'qualitative'
        ? new Set(['output-true', 'output-false'])
        : new Set(['output-bad', 'output-average', 'output-good'])

    const filtered = edges.filter((e) => {
      if (e.source !== id) return true
      // keep only edges whose sourceHandle is valid for the current mode
      return e.sourceHandle ? allowedHandles.has(e.sourceHandle) : false
    })

    if (filtered.length !== edges.length) {
      dispatch(setEdges(filtered))
    }
  }

  const handleScoringModeToggle = () => {
    const newMode =
      scoringMode === 'quantitative' ? 'qualitative' : 'quantitative'

    setScoringMode(newMode)
    updateNodeData({ scoringMode: newMode })
    // Drop any aggregator->step edges that use handles not available in the new mode
    pruneInvalidAggregatorEdges(newMode)
  }

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, scoringMode, edges])

  const handlePromptChange = (value: string) => {
    setCustomPrompt(value)
    updateNodeData({ customPrompt: value })

    if (fieldErrors.customPrompt) {
      clearNodeError(id, 'customPrompt')
    }
  }

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/20'>
              <Gauge className='h-3 w-3 text-orange-600' />
            </div>
            Aggregator
          </div>
          {renderStatusPill(getStepStatus(currentRun, nodeData?.stepNumber))}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Scoring Mode Toggle */}
        <div className='space-y-2'>
          <Label className='text-xs font-medium'>Scoring Mode</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={`w-full justify-between text-xs ${
              fieldErrors.scoringMode ? 'border-destructive' : ''
            }`}
            onClick={handleScoringModeToggle}
          >
            <span className='capitalize'>{scoringMode}</span>
            {scoringMode === 'quantitative' ? (
              <ToggleRight className='h-4 w-4 text-orange-600' />
            ) : (
              <ToggleLeft className='h-4 w-4 text-orange-600' />
            )}
          </Button>
          {fieldErrors.scoringMode && (
            <p className='mt-1 text-xs text-destructive'>
              {fieldErrors.scoringMode}
            </p>
          )}
        </div>

        {/* Custom Prompt */}
        <div className='space-y-2'>
          <Label htmlFor='customPrompt' className='text-xs font-medium'>
            Custom Evaluation Prompt
          </Label>
          <Textarea
            id='customPrompt'
            placeholder='Enter your evaluation prompt...'
            value={customPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className={`resize-none text-sm ${
              fieldErrors.customPrompt ? 'border-destructive' : ''
            }`}
            rows={3}
          />
          {fieldErrors.customPrompt && (
            <p className='mt-1 text-xs text-destructive'>
              {fieldErrors.customPrompt}
            </p>
          )}
        </div>

        {/* Instructions Section */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-xs font-medium'>
            <Info className='h-3 w-3' />
            Scoring Guidelines
          </Label>
          <div className='rounded-md border border-muted bg-muted/30 p-3'>
            {scoringMode === 'quantitative' ? (
              <div className='space-y-1 text-xs text-muted-foreground'>
                <div className='flex justify-between'>
                  <span>Score 0-30:</span>
                  <span className='font-medium text-red-600'>Bad</span>
                </div>
                <div className='flex justify-between'>
                  <span>Score 31-60:</span>
                  <span className='font-medium text-yellow-600'>Average</span>
                </div>
                <div className='flex justify-between'>
                  <span>Score 61-100:</span>
                  <span className='font-medium text-green-600'>Good</span>
                </div>
              </div>
            ) : (
              <div className='space-y-1 text-xs text-muted-foreground'>
                <div className='flex justify-between'>
                  <span>Evaluation Result:</span>
                  <span className='font-medium text-green-600'>True</span>
                </div>
                <div className='flex justify-between'>
                  <span>Evaluation Result:</span>
                  <span className='font-medium text-red-600'>False</span>
                </div>
                <div className='mt-2 text-xs text-muted-foreground'>
                  Returns boolean based on evaluation criteria
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connection validation errors */}
        {fieldErrors.connections && (
          <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3'>
            <p className='text-xs font-medium text-destructive'>
              Connection Error
            </p>
            <div className='mt-1 text-xs text-destructive'>
              <pre className='whitespace-pre-wrap font-sans'>
                {fieldErrors.connections}
              </pre>
            </div>
          </div>
        )}
      </CardContent>

      {/* Dynamic input handles based on actual connections */}
      {Array.from({ length: inputHandleCount }, (_, index) => {
        const handleId = `input-${index + 1}`
        // Dynamic positioning based on number of handles
        const topPercent =
          inputHandleCount === 1
            ? 50
            : 25 + (index * 50) / (inputHandleCount - 1)
        const isConnected = index < connectedInputEdges.length

        return (
          <Handle
            key={handleId}
            type='target'
            position={Position.Left}
            id={handleId}
            style={{
              top: `${Math.min(Math.max(topPercent, 10), 90)}%`,
            }}
            className={`h-3 w-3 ${
              isConnected ? 'bg-orange-500' : 'bg-muted-foreground'
            }`}
          />
        )
      })}

      {/* Dynamic output handles based on scoring mode */}
      {(() => {
        const outputs =
          scoringMode === 'quantitative'
            ? [
                { id: 'bad', label: 'Bad', color: 'bg-red-500' },
                { id: 'average', label: 'Average', color: 'bg-yellow-500' },
                { id: 'good', label: 'Good', color: 'bg-green-500' },
              ]
            : [
                { id: 'false', label: 'False', color: 'bg-red-500' },
                { id: 'true', label: 'True', color: 'bg-green-500' },
              ]

        return outputs.map((output, index) => {
          const totalOutputs = outputs.length
          // Calculate proper vertical positioning
          const topPercent =
            totalOutputs === 2
              ? 30 + index * 40 // 30%, 70% for 2 outputs
              : 20 + index * 30 // 20%, 50%, 80% for 3 outputs

          return (
            <React.Fragment key={output.id}>
              <Handle
                type='source'
                position={Position.Right}
                id={`output-${output.id}`}
                style={{
                  top: `${topPercent}%`,
                }}
                className={`h-3 w-3 border-2 border-white ${output.color}`}
              />
              {/* Label positioned to the right of handle */}
              <div
                className='pointer-events-none absolute z-10 text-xs font-medium text-muted-foreground'
                style={{
                  left: '105%', // Position to the right of the card
                  top: `${topPercent}%`,
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                {output.label}
              </div>
            </React.Fragment>
          )
        })
      })()}
    </Card>
  )
}
