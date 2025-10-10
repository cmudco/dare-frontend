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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GitBranch, Info, Plus, Trash2, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setEdges, updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { renderStatusPill } from '@/utils/workflowUtils'
import React from 'react'
import { HumanValidationModal } from '@/components/WorkflowManager/HumanValidationModal'
import { submitHumanValidationAPI } from '@/api/workflows'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'

export interface ConditionalRoute {
  name: string
  description: string
}

export type ConditionalNodeData = {
  customPrompt: string
  // New structure
  routes: ConditionalRoute[]
  requireHumanValidation: boolean
  stepNumber: number
  selectedRoute?: string // Store which route was selected during execution
  id?: string
}

export default function ConditionalNode({ id, data, selected }: NodeProps) {
  const nodeData = (data as ConditionalNodeData) || ({} as ConditionalNodeData)
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const updateNodeInternals = useUpdateNodeInternals()
  const [showValidationModal, setShowValidationModal] = useState(false)

  // Check if this node has a pending validation
  const pendingValidation = currentRun?.pendingValidations?.find(
    (v) => v.nodeId === id
  )
  const hasPendingValidation = !!pendingValidation

  const routes = nodeData.routes || [
    { name: 'Route A', description: '' },
    { name: 'Route B', description: '' },
  ]

  // Routes are now guaranteed to be in the new format from the backend.
  // Provide a default for new nodes that haven't been saved yet.

  const requireHumanValidation = nodeData.requireHumanValidation || false

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

  const pruneInvalidConditionalEdges = (newRoutes: ConditionalRoute[]) => {
    const allowedHandles = new Set(
      newRoutes.map((route) => `output-${route.name}`)
    )

    const filtered = edges.filter((e) => {
      if (e.source !== id) return true
      // Keep only edges whose sourceHandle matches our current route names
      return e.sourceHandle ? allowedHandles.has(e.sourceHandle) : false
    })

    if (filtered.length !== edges.length) {
      dispatch(setEdges(filtered))
    }
  }

  // Route management functions
  const addRoute = () => {
    const newRoutes = [
      ...routes,
      {
        name: `Route ${String.fromCharCode(65 + routes.length)}`,
        description: '',
      },
    ]
    updateNodeData({ routes: newRoutes })
    pruneInvalidConditionalEdges(newRoutes)
  }

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return // Minimum 2 routes
    const newRoutes = routes.filter((_, i) => i !== index)
    updateNodeData({ routes: newRoutes })
    pruneInvalidConditionalEdges(newRoutes)
  }

  const updateRoute = (
    index: number,
    field: 'name' | 'description',
    value: string
  ) => {
    const newRoutes = routes.map((route, i) =>
      i === index ? { ...route, [field]: value } : route
    )
    updateNodeData({ routes: newRoutes })
    if (field === 'name') {
      pruneInvalidConditionalEdges(newRoutes)
    }
  }

  const toggleHumanValidation = (checked: boolean) => {
    updateNodeData({ requireHumanValidation: checked })
  }

  const handleSubmitValidation = async (
    nodeId: string,
    chosenRoute: string
  ) => {
    if (!currentRun?.id) return

    try {
      await submitHumanValidationAPI(currentRun.id, nodeId, chosenRoute)
      // Refresh the workflow run to get updated status
      void dispatch(getWorkflowRunById(currentRun.id))
      setShowValidationModal(false)
    } catch (error) {
      console.error('Failed to submit validation:', error)
      throw error
    }
  }

  const routeNames = routes.map((r) => r.name).join(',')

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, routes.length, routeNames, edges])

  const handlePromptChange = (value: string) => {
    updateNodeData({ customPrompt: value })

    if (fieldErrors.customPrompt) {
      clearNodeError(id, 'customPrompt')
    }
  }

  const currentCustomPrompt =
    nodeData.customPrompt ||
    'Evaluate the input and choose the appropriate route.'

  // Get the step run for this conditional node
  // Match by order and look for the step with routing metadata (indicates conditional node)
  const stepRun =
    currentRun?.steps?.find(
      (s) =>
        s.order === nodeData?.stepNumber &&
        s.metadata?.routingDecision !== undefined
    ) || currentRun?.steps?.find((s) => s.id === pendingValidation?.stepId)

  const stepStatus = stepRun?.status || null
  const selectedRoute = stepRun?.response
  const metadata = stepRun?.metadata

  // Get AI analysis from pendingValidation if available (during human validation),
  // otherwise from metadata (after execution)
  const aiAnalysis = pendingValidation?.aiAnalysis || metadata?.analysis
  const aiRecommendation =
    pendingValidation?.aiRecommendation || metadata?.aiRecommendation
  const isHumanValidated = metadata?.isHumanValidated

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
          {renderStatusPill(stepStatus)}
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

        {/* AI Decision Display - Shows after execution */}
        {stepStatus === 'completed' && selectedRoute && aiAnalysis && (
          <div className='rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
                <span className='text-xs font-bold text-green-600 dark:text-green-400'>
                  ✓
                </span>
              </div>
              <span className='font-semibold text-green-900 dark:text-green-100'>
                {isHumanValidated ? 'User Decision' : 'AI Routing Decision'}
              </span>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-green-700 dark:text-green-300'>
                  Selected Route:
                </span>
                <span className='rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white'>
                  {selectedRoute}
                </span>
              </div>
              <div className='rounded-md bg-white/50 p-3 dark:bg-black/20'>
                <p className='mb-1 text-xs font-medium text-green-700 dark:text-green-300'>
                  {isHumanValidated ? 'AI Analysis:' : 'AI Reasoning:'}
                </p>
                <p className='text-sm text-green-900 dark:text-green-100'>
                  {aiAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Human Validation Alert - Shows when workflow is waiting */}
        {hasPendingValidation && pendingValidation && (
          <div className='rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
            <div className='mb-3 flex items-start gap-3'>
              <UserCheck className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400' />
              <div className='flex-1'>
                <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
                  Human Validation Required
                </h3>
                <p className='mt-1 text-sm text-purple-700 dark:text-purple-300'>
                  Choose which route the workflow should take to continue
                  execution.
                </p>
              </div>
            </div>

            {/* AI Recommendation in Node */}
            {aiRecommendation && (
              <div className='mb-3 rounded-md border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
                <div className='mb-1 flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20'>
                    <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                      AI
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-blue-900 dark:text-blue-100'>
                    AI Suggests: {aiRecommendation}
                  </span>
                </div>
                {aiAnalysis && (
                  <p className='ml-7 text-xs text-blue-700 dark:text-blue-300'>
                    {aiAnalysis}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => setShowValidationModal(true)}
              size='sm'
              className='w-full bg-purple-600 hover:bg-purple-700'
            >
              Make Decision
            </Button>
          </div>
        )}

        {/* Human Validation Toggle */}
        <div className='flex items-center space-x-2 rounded-md border border-muted bg-muted/30 p-3'>
          <Checkbox
            id={`human-validation-${id}`}
            checked={requireHumanValidation}
            onCheckedChange={toggleHumanValidation}
          />
          <div className='flex-1'>
            <Label
              htmlFor={`human-validation-${id}`}
              className='flex cursor-pointer items-center gap-2 text-xs font-medium'
            >
              <UserCheck className='h-3 w-3' />
              Require Human Validation
            </Label>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Pause workflow and ask user to choose route
            </p>
          </div>
        </div>

        {/* Route Configuration */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-medium'>
              Routes ({routes.length})
            </Label>
            <Button
              size='sm'
              variant='outline'
              onClick={addRoute}
              className='h-6 px-2 text-xs'
            >
              <Plus className='mr-1 h-3 w-3' />
              Add Route
            </Button>
          </div>

          {/* Dynamic Routes */}
          {routes.map((route, index) => (
            <div
              key={index}
              className='space-y-2 rounded-md border border-muted bg-muted/20 p-3'
            >
              <div className='flex items-center justify-between'>
                <Label className='text-xs text-muted-foreground'>
                  Route {String.fromCharCode(65 + index)}
                </Label>
                {routes.length > 2 && (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => removeRoute(index)}
                    className='h-5 w-5 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                )}
              </div>
              <Input
                placeholder='Route name'
                value={route.name}
                onChange={(e) => updateRoute(index, 'name', e.target.value)}
                className='text-sm'
              />
              <Input
                placeholder='Optional description'
                value={route.description}
                onChange={(e) =>
                  updateRoute(index, 'description', e.target.value)
                }
                className='text-sm'
              />
            </div>
          ))}
        </div>

        {/* Instructions Section */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-xs font-medium'>
            <Info className='h-3 w-3' />
            How It Works
          </Label>
          <div className='rounded-md border border-muted bg-muted/30 p-3'>
            <div className='space-y-1 text-xs text-muted-foreground'>
              <div className='font-medium'>
                {requireHumanValidation
                  ? 'User chooses route:'
                  : 'AI evaluates input and chooses:'}
              </div>
              {routes.map((route, index) => {
                const colors = [
                  'text-blue-600',
                  'text-purple-600',
                  'text-orange-600',
                  'text-green-600',
                  'text-pink-600',
                ]
                const isSelected =
                  selectedRoute === route.name && stepStatus === 'completed'
                return (
                  <div key={index} className='flex justify-between'>
                    <span>{route.name}:</span>
                    <span
                      className={`font-medium ${isSelected ? 'text-green-600' : colors[index % colors.length]}`}
                    >
                      {isSelected
                        ? '✓ SELECTED'
                        : route.description ||
                          `Route ${String.fromCharCode(65 + index)}`}
                    </span>
                  </div>
                )
              })}
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

      {/* Dynamic output handles on the right */}
      {routes.map((route, index) => {
        const colors = [
          'bg-blue-500',
          'bg-purple-500',
          'bg-orange-500',
          'bg-green-500',
          'bg-pink-500',
        ]
        const color = colors[index % colors.length]

        // Calculate evenly distributed positions
        const count = routes.length
        const spacing = 80 / (count + 1) // Use 80% of height, divided by count+1 for spacing
        const position = (index + 1) * spacing + 10 // Start at 10% from top

        return (
          <React.Fragment key={route.name}>
            <Handle
              type='source'
              position={Position.Right}
              id={`output-${route.name}`}
              style={{
                top: `${position}%`,
              }}
              className={`h-3 w-3 border-2 border-white ${color}`}
            />
            {/* Label positioned to the right of handle */}
            <div
              className='pointer-events-none absolute z-10 text-xs font-medium text-muted-foreground'
              style={{
                left: '105%', // Position to the right of the card
                top: `${position}%`,
                transform: 'translateY(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {route.name}
            </div>
          </React.Fragment>
        )
      })}

      {/* Human Validation Modal */}
      {pendingValidation && (
        <HumanValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          validation={pendingValidation}
          onSubmit={handleSubmitValidation}
        />
      )}
    </Card>
  )
}
