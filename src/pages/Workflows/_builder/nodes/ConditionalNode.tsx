import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GitBranch,
  Info,
  Plus,
  Trash2,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setEdges,
  updateNodeDataById,
  toggleNodeCollapse,
  removeNodeWithEdges,
} from '@/redux/workflowBuilderSlice'
import { renderStatusPill } from '@/utils/workflowUtils'
import React from 'react'
import { HumanValidationModal } from '@/components/WorkflowManager/HumanValidationModal'
import { submitHumanValidationV2 } from '@/redux/asyncThunks/workflow'
import { updateWorkflowRunStatus } from '@/redux/workflowBuilderSlice'
import { useWorkflowRunVersion } from '@/hooks/useWorkflowRunVersion'
import { useRoutingNode } from '@/hooks/useRoutingNode'
import { VersionDropdown } from '@/components/WorkflowBuilder/VersionDropdown'
import {
  RoutingDecisionDisplay,
  HumanValidationPrompt,
} from '@/components/WorkflowBuilder/routing'
import type { ConditionalNodeData as ConditionalNodeDataType } from '@/types/workflowNodes'

export interface ConditionalRoute {
  name: string
  description: string
}

export default function ConditionalNode({ id, data, selected }: NodeProps) {
  const nodeData =
    (data as Partial<ConditionalNodeDataType>) ||
    ({} as Partial<ConditionalNodeDataType>)
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const updateNodeInternals = useUpdateNodeInternals()
  const [showValidationModal, setShowValidationModal] = useState(false)

  // VERSION SELECTION: Hook handles all version dropdown logic
  const versionState = useWorkflowRunVersion(id)

  // ROUTING NODE STATE: Shared hook for all routing nodes
  const {
    stepStatus,
    selectedRoute,
    hasPendingValidation,
    pendingValidation,
    aiAnalysis,
    aiRecommendation,
    isHumanValidated,
    userChoice,
  } = useRoutingNode(id)

  const routes = nodeData.routes || [
    { name: 'Route A', description: '' },
    { name: 'Route B', description: '' },
  ]

  const requireHumanValidation = nodeData.requireHumanValidation || false

  // Calculate input handles - conditional nodes accept only one input from chatOutput
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return edge.target === id && sourceNode?.type === 'chatOutput'
  })

  // Single input handle for conditional nodes
  const hasInput = connectedInputEdges.length > 0

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<ConditionalNodeDataType>) => {
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
      // Use V2 API - returns updated workflowRun with nodeStates
      const resultAction = await dispatch(
        submitHumanValidationV2({
          workflowRunId: currentRun.id,
          nodeId,
          chosenRoute,
        })
      )
      // Update Redux directly with the returned workflowRun
      if (submitHumanValidationV2.fulfilled.match(resultAction)) {
        dispatch(updateWorkflowRunStatus(resultAction.payload))
      }
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

  const isCollapsed = nodeData?.isCollapsed || false

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <div className='space-y-2'>
          <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/20'>
                <GitBranch className='h-3 w-3 text-blue-600' />
              </div>
              Conditional
            </div>
            <div className='flex items-center gap-1'>
              {renderStatusPill(stepStatus)}
              <Button
                size='sm'
                variant='ghost'
                onClick={() => dispatch(toggleNodeCollapse(id))}
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
                onClick={() => dispatch(removeNodeWithEdges({ nodeId: id }))}
                className='h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                title='Delete node'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </CardTitle>
          <VersionDropdown
            versionRuns={versionState.versionRuns}
            selectedRunId={versionState.selectedRunId}
            onRunChange={versionState.handleRunChange}
            show={versionState.showVersionDropdown}
          />
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-4'>
          {/* Prompt Selector */}
          <div className='space-y-2'>
            <Label htmlFor='prompt' className='text-xs font-medium'>
              Prompt Template
            </Label>
            <Select
              value={nodeData.prompt ? nodeData.prompt.toString() : ''}
              onValueChange={(value) => {
                updateNodeData({ prompt: Number(value) })
              }}
            >
              <SelectTrigger id='prompt' className='text-sm'>
                <SelectValue placeholder='Select a prompt' />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LLM Model Selector */}
          <div className='space-y-2'>
            <Label htmlFor='llm' className='text-xs font-medium'>
              LLM Model
            </Label>
            <Select
              value={nodeData.llm ? nodeData.llm.toString() : ''}
              onValueChange={(value) => {
                updateNodeData({ llm: Number(value) })
              }}
            >
              <SelectTrigger id='llm' className='text-sm'>
                <SelectValue placeholder='Select an LLM' />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Decision Display - Uses shared component */}
          {stepStatus === 'completed' && selectedRoute && (
            <RoutingDecisionDisplay
              selectedRoute={selectedRoute}
              isHumanValidated={isHumanValidated}
              aiAnalysis={aiAnalysis}
              aiRecommendation={aiRecommendation}
              userChoice={userChoice}
            />
          )}

          {/* Human Validation Alert - Uses shared component */}
          {hasPendingValidation && pendingValidation && (
            <HumanValidationPrompt
              aiRecommendation={aiRecommendation}
              aiAnalysis={aiAnalysis}
              onOpenModal={() => setShowValidationModal(true)}
            />
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
        </CardContent>
      )}

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
