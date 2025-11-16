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
import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  updateNodeDataById,
  toggleNodeCollapse,
  removeNodeWithEdges,
} from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { renderStatusPill } from '@/utils/workflowUtils'
import { HumanValidationModal } from '@/components/WorkflowManager/HumanValidationModal'
import { submitHumanValidationAPI } from '@/api/workflows'
import { getWorkflowRunById } from '@/redux/asyncThunks/workflow'
import { useWorkflowRunVersion } from '@/hooks/useWorkflowRunVersion'
import { VersionDropdown } from '@/components/WorkflowBuilder/VersionDropdown'
import {
  getDisplayRun,
  getStepFromRun,
  extractRoutingDecision,
} from '@/utils/workflowRunHelpers'
import type { StructuredOutputNodeData as StructuredOutputNodeDataType } from '@/types/workflowNodes'

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
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const { currentRun, availableRuns, selectedRunIds } = useAppSelector(
    (s) => s.workflowBuilder
  )
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const updateNodeInternals = useUpdateNodeInternals()
  const [showValidationModal, setShowValidationModal] = useState(false)

  // VERSION SELECTION: Hook handles all version dropdown logic
  const versionState = useWorkflowRunVersion(id)

  // Check if this node has a pending validation
  const pendingValidation = currentRun?.pendingValidations?.find(
    (v) => v.nodeId === id
  )
  const hasPendingValidation = !!pendingValidation

  // Memoize routes to prevent dependency issues in useMemo hook below
  const routes = useMemo(
    () =>
      nodeData.routes || [
        { name: '1', description: 'First route' },
        { name: '2', description: 'Second route' },
      ],
    [nodeData.routes]
  )

  // Structured Output node config only; Step hosts outward connectors
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)

  // Find the step node that this structured output node is connected to
  const connectedStepEdge = edges.find((edge) => {
    return edge.source === id && edge.target
  })

  const connectedStepNode = connectedStepEdge
    ? nodes.find((n) => n.id === connectedStepEdge.target)
    : undefined

  const connectedStepNumber = connectedStepNode?.data?.stepNumber as
    | number
    | undefined

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<StructuredOutputNodeDataType>) => {
    dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
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
  }

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return // Minimum 2 routes
    const newRoutes = routes.filter((_, i) => i !== index)
    updateNodeData({ routes: newRoutes })
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

  const routeNames = useMemo(
    () => routes.map((r) => r.name).join(','),
    [routes]
  )

  useEffect(() => {
    updateNodeInternals(id)
  }, [updateNodeInternals, id, routes.length, routeNames])

  // DATA RETRIEVAL: Get the run to display (handles all modes automatically)
  const displayRun = getDisplayRun(
    id,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  // STEP LOOKUP: Find the connected step node's data
  const stepRun = getStepFromRun(displayRun, connectedStepNumber)

  // DATA EXTRACTION: Pull out routing decision values
  const {
    selectedRoute,
    aiAnalysis,
    aiRecommendation,
    isHumanValidated,
    userChoice,
  } = extractRoutingDecision(stepRun, pendingValidation)

  const stepStatus = stepRun?.status || null

  const isCollapsed = nodeData?.isCollapsed || false

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <div className='space-y-2'>
          <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 dark:bg-purple-500/20'>
                <GitBranch className='h-3 w-3 text-purple-600' />
              </div>
              <span>Structured Output</span>
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
                clearNodeError(id, 'prompt')
              }}
            >
              <SelectTrigger
                id='prompt'
                className={`text-sm ${
                  fieldErrors.prompt ? 'border-destructive' : ''
                }`}
              >
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
            {fieldErrors.prompt && (
              <p className='mt-1 text-xs text-destructive'>
                {fieldErrors.prompt}
              </p>
            )}
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
                clearNodeError(id, 'llm')
              }}
            >
              <SelectTrigger
                id='llm'
                className={`text-sm ${
                  fieldErrors.llm ? 'border-destructive' : ''
                }`}
              >
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
            {fieldErrors.llm && (
              <p className='mt-1 text-xs text-destructive'>{fieldErrors.llm}</p>
            )}
          </div>

          {/* Execution Result Display */}
          {stepStatus === 'completed' && selectedRoute && (
            <div className='rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
              <div className='mb-2 flex items-center gap-2'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20'>
                  <span className='text-xs font-bold text-green-600 dark:text-green-400'>
                    ✓
                  </span>
                </div>
                <span className='font-semibold text-green-900 dark:text-green-100'>
                  {isHumanValidated ? 'User Decision' : 'Output Route Selected'}
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
                {/* Show AI recommendation if user chose differently */}
                {isHumanValidated &&
                  userChoice &&
                  aiRecommendation &&
                  userChoice !== aiRecommendation && (
                    <div className='rounded-md bg-blue-50/50 p-2 dark:bg-blue-900/20'>
                      <p className='text-xs text-blue-700 dark:text-blue-300'>
                        AI recommended:{' '}
                        <span className='font-medium'>{aiRecommendation}</span>
                      </p>
                    </div>
                  )}
                {aiAnalysis && (
                  <div className='rounded-md bg-white/50 p-3 dark:bg-black/20'>
                    <p className='mb-1 text-xs font-medium text-green-700 dark:text-green-300'>
                      AI Analysis:
                    </p>
                    <p className='text-sm text-green-900 dark:text-green-100'>
                      {aiAnalysis}
                    </p>
                  </div>
                )}
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
              {pendingValidation.aiRecommendation && (
                <div className='mb-3 rounded-md border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
                  <div className='mb-1 flex items-center gap-2'>
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20'>
                      <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                        AI
                      </span>
                    </div>
                    <span className='text-xs font-semibold text-blue-900 dark:text-blue-100'>
                      AI Suggests: {pendingValidation.aiRecommendation}
                    </span>
                  </div>
                  {pendingValidation.aiAnalysis && (
                    <p className='ml-7 text-xs text-blue-700 dark:text-blue-300'>
                      {pendingValidation.aiAnalysis}
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
                Output Routes ({routes.length})
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
                  Connect this node to a Step node. The LLM response should
                  return one of the route values defined above.
                </p>
                <p className='font-medium'>Example routes:</p>
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
      )}
      {/* Top handle - connects to Step node's top target handle */}
      <Handle
        type='source'
        position={Position.Top}
        id='output-to-step'
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className='h-3 w-3 bg-purple-500'
      />

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
