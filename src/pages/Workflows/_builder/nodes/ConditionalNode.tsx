import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { GitBranch, Info } from 'lucide-react'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setEdges, updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { getStepStatus, renderStatusPill } from '@/utils/workflowUtils'
import React from 'react'

export type ConditionalNodeData = {
  customPrompt: string
  routeAName: string
  routeBName: string
  routeADescription?: string
  routeBDescription?: string
  stepNumber: number
  selectedRoute?: string // Store which route was selected during execution
  id?: string
}

export default function ConditionalNode({ id, data, selected }: NodeProps) {
  const nodeData =
    (data as unknown as ConditionalNodeData) || ({} as ConditionalNodeData)
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const updateNodeInternals = useUpdateNodeInternals()

  // Calculate input handles - conditional nodes accept only one input from chatOutput
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return edge.target === id && sourceNode?.type === 'chatOutput'
  })

  // Single input handle for conditional nodes
  const hasInput = connectedInputEdges.length > 0

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<ConditionalNodeData>) => {
    dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
  }

  const pruneInvalidConditionalEdges = (
    newRouteAName: string,
    newRouteBName: string
  ) => {
    const allowedHandles = new Set([
      `output-${newRouteAName}`,
      `output-${newRouteBName}`,
    ])

    const filtered = edges.filter((e) => {
      if (e.source !== id) return true
      // Keep only edges whose sourceHandle matches our current route names
      return e.sourceHandle ? allowedHandles.has(e.sourceHandle) : false
    })

    if (filtered.length !== edges.length) {
      dispatch(setEdges(filtered))
    }
  }

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, nodeData.routeAName, nodeData.routeBName, edges])

  const handlePromptChange = (value: string) => {
    updateNodeData({ customPrompt: value })

    if (fieldErrors.customPrompt) {
      clearNodeError(id, 'customPrompt')
    }
  }

  const handleRouteANameChange = (value: string) => {
    updateNodeData({ routeAName: value })
    // Prune invalid edges when route names change (only if both routes have values)
    const routeBName = nodeData.routeBName || ''
    if (value && routeBName) {
      pruneInvalidConditionalEdges(value, routeBName)
    }

    if (fieldErrors.routeAName) {
      clearNodeError(id, 'routeAName')
    }
  }

  const handleRouteBNameChange = (value: string) => {
    updateNodeData({ routeBName: value })
    // Prune invalid edges when route names change (only if both routes have values)
    const routeAName = nodeData.routeAName || ''
    if (routeAName && value) {
      pruneInvalidConditionalEdges(routeAName, value)
    }

    if (fieldErrors.routeBName) {
      clearNodeError(id, 'routeBName')
    }
  }

  const handleRouteADescriptionChange = (value: string) => {
    updateNodeData({ routeADescription: value })

    if (fieldErrors.routeADescription) {
      clearNodeError(id, 'routeADescription')
    }
  }

  const handleRouteBDescriptionChange = (value: string) => {
    updateNodeData({ routeBDescription: value })

    if (fieldErrors.routeBDescription) {
      clearNodeError(id, 'routeBDescription')
    }
  }

  // Get current values from Redux state (nodeData) - allow empty values for editing
  const currentRouteAName = nodeData.routeAName ?? ''
  const currentRouteBName = nodeData.routeBName ?? ''
  const currentCustomPrompt =
    nodeData.customPrompt ||
    'Evaluate the input and choose the appropriate route.'
  const currentRouteADescription = nodeData.routeADescription || ''
  const currentRouteBDescription = nodeData.routeBDescription || ''

  // Get the selected route from workflow run data
  const stepStatus = getStepStatus(currentRun, nodeData?.stepNumber)
  const stepRun = currentRun?.steps?.find(
    (s) => (s.order || s.step_node) === nodeData?.stepNumber
  )
  const selectedRoute = stepRun?.response // Backend should store selected route in response

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/20'>
              <GitBranch className='h-3 w-3 text-blue-600' />
            </div>
            Conditional
          </div>
          {renderStatusPill(getStepStatus(currentRun, nodeData?.stepNumber))}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Custom Prompt */}
        <div className='space-y-2'>
          <Label htmlFor='customPrompt' className='text-xs font-medium'>
            Evaluation Prompt
          </Label>
          <Textarea
            id='customPrompt'
            placeholder='Describe how to evaluate and route the input...'
            value={currentCustomPrompt}
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

        {/* Route Configuration */}
        <div className='space-y-3'>
          <Label className='text-xs font-medium'>Route Configuration</Label>

          {/* Route A */}
          <div className='space-y-2'>
            <Label
              htmlFor='routeAName'
              className='text-xs text-muted-foreground'
            >
              Route A Name
            </Label>
            <Input
              id='routeAName'
              placeholder='Route A'
              value={currentRouteAName}
              onChange={(e) => handleRouteANameChange(e.target.value)}
              className={`text-sm ${
                fieldErrors.routeAName ? 'border-destructive' : ''
              }`}
            />
            {fieldErrors.routeAName && (
              <p className='mt-1 text-xs text-destructive'>
                {fieldErrors.routeAName}
              </p>
            )}
            <Input
              placeholder='Optional description for Route A'
              value={currentRouteADescription}
              onChange={(e) => handleRouteADescriptionChange(e.target.value)}
              className={`text-sm ${
                fieldErrors.routeADescription ? 'border-destructive' : ''
              }`}
            />
            {fieldErrors.routeADescription && (
              <p className='mt-1 text-xs text-destructive'>
                {fieldErrors.routeADescription}
              </p>
            )}
          </div>

          {/* Route B */}
          <div className='space-y-2'>
            <Label
              htmlFor='routeBName'
              className='text-xs text-muted-foreground'
            >
              Route B Name
            </Label>
            <Input
              id='routeBName'
              placeholder='Route B'
              value={currentRouteBName}
              onChange={(e) => handleRouteBNameChange(e.target.value)}
              className={`text-sm ${
                fieldErrors.routeBName ? 'border-destructive' : ''
              }`}
            />
            {fieldErrors.routeBName && (
              <p className='mt-1 text-xs text-destructive'>
                {fieldErrors.routeBName}
              </p>
            )}
            <Input
              placeholder='Optional description for Route B'
              value={currentRouteBDescription}
              onChange={(e) => handleRouteBDescriptionChange(e.target.value)}
              className={`text-sm ${
                fieldErrors.routeBDescription ? 'border-destructive' : ''
              }`}
            />
            {fieldErrors.routeBDescription && (
              <p className='mt-1 text-xs text-destructive'>
                {fieldErrors.routeBDescription}
              </p>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-xs font-medium'>
            <Info className='h-3 w-3' />
            How It Works
          </Label>
          <div className='rounded-md border border-muted bg-muted/30 p-3'>
            <div className='space-y-1 text-xs text-muted-foreground'>
              <div className='font-medium'>AI evaluates input and chooses:</div>
              <div className='flex justify-between'>
                <span>{currentRouteAName || 'Route A'}:</span>
                <span
                  className={`font-medium ${selectedRoute === (currentRouteAName || 'Route A') ? 'text-green-600' : 'text-blue-600'}`}
                >
                  {selectedRoute === (currentRouteAName || 'Route A') &&
                  stepStatus === 'completed'
                    ? '✓ SELECTED'
                    : currentRouteADescription || 'Custom route A'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>{currentRouteBName || 'Route B'}:</span>
                <span
                  className={`font-medium ${selectedRoute === (currentRouteBName || 'Route B') ? 'text-green-600' : 'text-purple-600'}`}
                >
                  {selectedRoute === (currentRouteBName || 'Route B') &&
                  stepStatus === 'completed'
                    ? '✓ SELECTED'
                    : currentRouteBDescription || 'Custom route B'}
                </span>
              </div>
              {/* {stepStatus === 'completed' && selectedRoute && (
                <div className='mt-2 rounded bg-green-50 p-2 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300'>
                  <span className='font-medium'>Route Selected:</span> {selectedRoute}
                </div>
              )} */}
              <div className='mt-2 text-xs text-muted-foreground'>
                Accepts single input from output node only
              </div>
            </div>
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

      {/* Single input handle on the left */}
      <Handle
        type='target'
        position={Position.Left}
        id='input-1'
        style={{
          top: '50%',
        }}
        className={`h-3 w-3 ${
          hasInput ? 'bg-blue-500' : 'bg-muted-foreground'
        }`}
      />

      {/* Two output handles on the right with custom route names */}
      {[
        {
          name: currentRouteAName || 'Route A',
          color: 'bg-blue-500',
          position: 35,
        },
        {
          name: currentRouteBName || 'Route B',
          color: 'bg-purple-500',
          position: 65,
        },
      ].map((route) => (
        <React.Fragment key={route.name}>
          <Handle
            type='source'
            position={Position.Right}
            id={`output-${route.name}`}
            style={{
              top: `${route.position}%`,
            }}
            className={`h-3 w-3 border-2 border-white ${route.color}`}
          />
          {/* Label positioned to the right of handle */}
          <div
            className='pointer-events-none absolute z-10 text-xs font-medium text-muted-foreground'
            style={{
              left: '105%', // Position to the right of the card
              top: `${route.position}%`,
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {route.name}
          </div>
        </React.Fragment>
      ))}
    </Card>
  )
}
