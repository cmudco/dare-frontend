import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Play,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateNodeDataById,
  toggleNodeCollapse,
  removeNodeWithEdges,
  setEdges,
  markStepExecuted,
  setCurrentPartialRunId,
  updateWorkflowRunStatus,
} from '@/redux/workflowBuilderSlice'
import { renderStatusPill } from '@/utils/workflowUtils'
import { HumanValidationModal } from '@/components/WorkflowManager/HumanValidationModal'
import {
  executeSingleStepV2,
  submitHumanValidationV2,
} from '@/redux/asyncThunks/workflow'
import { unwrapResult } from '@reduxjs/toolkit'
import { toast } from '@/utils/toast'
import { useWorkflowRunVersion } from '@/hooks/useWorkflowRunVersion'
import { useRoutingNode } from '@/hooks/useRoutingNode'
import { VersionDropdown } from '@/components/WorkflowBuilder/VersionDropdown'
import {
  RoutingDecisionDisplay,
  HumanValidationPrompt,
} from '@/components/WorkflowBuilder/routing'
import type { StructuredOutputNodeData as StructuredOutputNodeDataType } from '@/types/workflowNodes'
import { ROUTE_HANDLE_PREFIX } from '@/utils/constants/workflowBuilder'

export interface StructuredOutputRoute {
  name: string
  description: string
}

export default function StructuredOutputNode({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData =
    (data as Partial<StructuredOutputNodeDataType>) ||
    ({} as Partial<StructuredOutputNodeDataType>)
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const {
    currentRun,
    currentPartialRunId,
    executedStepNodeIds,
    loadedWorkflow,
    manualModeEnabled,
  } = useAppSelector((s) => s.workflowBuilder)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const updateNodeInternals = useUpdateNodeInternals()
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [isExecutingNode, setIsExecutingNode] = useState(false)

  // Check if this node has been executed in current partial run
  const isNodeExecuted = executedStepNodeIds.includes(id)

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

  // Memoize routes to prevent dependency issues in useMemo hook below
  const routes = useMemo(
    () =>
      nodeData.routes || [
        { name: '1', description: 'First route' },
        { name: '2', description: 'Second route' },
      ],
    [nodeData.routes]
  )

  // Local state for text input to prevent cursor jumping on re-render
  const [localTextInput, setLocalTextInput] = useState(nodeData.textInput || '')

  // Sync local state when external data changes (e.g., undo/redo, load workflow)
  useEffect(() => {
    setLocalTextInput(nodeData.textInput || '')
  }, [nodeData.textInput])

  // Update Redux when form changes
  const updateNodeData = useCallback(
    (updates: Partial<StructuredOutputNodeDataType>) => {
      dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
    },
    [dispatch, id]
  )

  // Debounced sync to Redux for text input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTextInput !== (nodeData.textInput || '')) {
        updateNodeData({ textInput: localTextInput })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localTextInput, nodeData.textInput, updateNodeData])

  // Clean up edges when routes change to remove invalid connections
  const pruneInvalidEdges = (newRoutes: StructuredOutputRoute[]) => {
    const allowedHandles = new Set(
      newRoutes.map((route) => `${ROUTE_HANDLE_PREFIX}${route.name}`)
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
        name: `${routes.length + 1}`,
        description: '',
      },
    ]
    updateNodeData({ routes: newRoutes })
    pruneInvalidEdges(newRoutes)
  }

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return // Minimum 2 routes
    const newRoutes = routes.filter((_, i) => i !== index)
    updateNodeData({ routes: newRoutes })
    pruneInvalidEdges(newRoutes)
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
    pruneInvalidEdges(newRoutes)
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

  // Execute this structured output node manually (for manual mode)
  const handleExecuteNode = async () => {
    if (!loadedWorkflow?.id) {
      toast.error('No workflow loaded')
      return
    }

    setIsExecutingNode(true)
    try {
      // Use V2 API - returns full workflowRun with nodeStates
      const resultAction = await dispatch(
        executeSingleStepV2({
          workflowId: loadedWorkflow.id,
          stepNodeId: id,
          workflowRunId: currentPartialRunId,
        })
      )
      const result = unwrapResult(resultAction)

      if (result.success) {
        toast.success('Structured Output node executed successfully')
        dispatch(markStepExecuted(id))
        dispatch(setCurrentPartialRunId(result.workflowRun.id))

        // V2: Update Redux directly with the returned workflowRun (includes nodeStates)
        dispatch(updateWorkflowRunStatus(result.workflowRun))
      } else {
        // Display error from backend (already formatted)
        toast.error(result.error || 'Node execution failed', 8000)
      }
    } catch (error) {
      // Error is already a formatted string from errorHandler
      toast.error(String(error), 8000)
    } finally {
      setIsExecutingNode(false)
    }
  }

  const routeNames = useMemo(
    () => routes.map((r) => r.name).join(','),
    [routes]
  )

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, routes.length, routeNames])

  const isCollapsed = nodeData?.isCollapsed || false

  return (
    <Card
      className={`w-80 ${
        isNodeExecuted
          ? 'border-green-500/50 bg-green-50/30 dark:bg-green-950/20'
          : 'border-border'
      } ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <div className='space-y-2'>
          <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 dark:bg-purple-500/20'>
                <GitBranch className='h-3 w-3 text-purple-600' />
              </div>
              <span>Conditional</span>
            </div>
            <div className='flex items-center gap-1'>
              {renderStatusPill(stepStatus)}
              {isNodeExecuted && (
                <CheckCircle2 className='h-4 w-4 text-green-500' />
              )}
              {manualModeEnabled && (
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={handleExecuteNode}
                  disabled={isExecutingNode}
                  className='h-6 w-6 p-0 text-purple-600 hover:bg-purple-500/10'
                  title='Run this node'
                >
                  {isExecutingNode ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Play className='h-4 w-4' />
                  )}
                </Button>
              )}
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
          {/* Text Input Field */}
          <div className='space-y-2'>
            <Label htmlFor='textInput' className='text-xs font-medium'>
              Input Text (Optional)
            </Label>
            <Textarea
              id='textInput'
              placeholder='Enter input text to evaluate for routing decision...'
              value={localTextInput}
              onChange={(e) => setLocalTextInput(e.target.value)}
              className='min-h-[80px] text-sm'
            />
            <p className='text-xs text-muted-foreground'>
              This text will be evaluated to determine which route to take.
            </p>
          </div>

          {/* Prompt Selector */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='prompt' className='text-xs font-medium'>
                Prompt Template (Optional)
              </Label>
              {nodeData.prompt && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    updateNodeData({ prompt: null })
                  }}
                  className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
                >
                  Clear
                </Button>
              )}
            </div>
            <Select
              value={nodeData.prompt ? nodeData.prompt.toString() : undefined}
              onValueChange={(value) => {
                updateNodeData({ prompt: Number(value) })
              }}
            >
              <SelectTrigger id='prompt' className='text-sm'>
                <SelectValue placeholder='Use default routing prompt' />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Falls back to base routing prompt if not selected.
            </p>
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

          {/* Execution Result Display - Uses shared component */}
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
              aiRecommendation={pendingValidation.aiRecommendation ?? null}
              aiAnalysis={pendingValidation.aiAnalysis ?? null}
              onOpenModal={() => setShowValidationModal(true)}
            />
          )}

          {/* Human Validation Toggle */}
          <div className='flex items-center space-x-2 rounded-md border border-muted bg-muted/30 p-3'>
            <Checkbox
              id={`human-validation-${id}`}
              checked={nodeData.requireHumanValidation || false}
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
          <div className='space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-medium'>
                Structured Routes ({routes.length})
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
                className='space-y-2 rounded-md border border-muted bg-white/80 p-3 dark:bg-background/50'
              >
                <div className='flex items-center justify-between'>
                  <Label className='text-xs text-muted-foreground'>
                    Route {index + 1}
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
                  placeholder='Route value (e.g., "1", "2", "success")'
                  value={route.name}
                  onChange={(e) => updateRoute(index, 'name', e.target.value)}
                  className='text-sm'
                />
                <Input
                  placeholder='Description (optional)'
                  value={route.description}
                  onChange={(e) =>
                    updateRoute(index, 'description', e.target.value)
                  }
                  className='text-sm'
                />
              </div>
            ))}

            {/* Instructions Section */}
            <div className='space-y-2 rounded-md border border-purple-300 bg-purple-100/50 p-3 dark:border-purple-700 dark:bg-purple-900/30'>
              <Label className='flex items-center gap-2 text-xs font-medium text-purple-900 dark:text-purple-100'>
                <Info className='h-3 w-3' />
                How It Works
              </Label>
              <div className='space-y-1 text-xs text-purple-700 dark:text-purple-300'>
                <p>
                  AI analyzes the input and automatically chooses which path
                  your workflow should take. Perfect for decision-making and
                  branching logic.
                </p>
                <p className='mt-2 font-medium'>Your defined routes:</p>
                <ul className='ml-4 list-disc space-y-0.5'>
                  {routes.map((route, index) => {
                    const colors = [
                      'text-blue-600',
                      'text-purple-600',
                      'text-orange-600',
                      'text-green-600',
                      'text-pink-600',
                    ]
                    return (
                      <li key={index} className={colors[index % colors.length]}>
                        <span className='font-medium'>{route.name}</span>
                        {route.description && (
                          <span className='text-muted-foreground'>
                            : {route.description}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <p className='mt-2 text-[10px] italic text-purple-500 dark:text-purple-400'>
                  Technical: This is a Structured Output node using AI to
                  produce deterministic routing decisions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      {/* Input handle - accepts connections from previous nodes */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        className='h-3 w-3 bg-purple-500'
      />

      {/* Output handles - one for each route */}
      {routes.map((route, index) => {
        const totalRoutes = routes.length
        const spacing = 100 / (totalRoutes + 1)
        const topPercentage = spacing * (index + 1)

        return (
          <Handle
            key={`${ROUTE_HANDLE_PREFIX}${route.name}-${index}`}
            type='source'
            position={Position.Right}
            id={`${ROUTE_HANDLE_PREFIX}${route.name}`}
            style={{ top: `${topPercentage}%`, transform: 'translateY(-50%)' }}
            className='h-3 w-3 bg-purple-500'
          />
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
