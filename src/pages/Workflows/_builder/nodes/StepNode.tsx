import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Brain,
  Settings,
  FileText,
  Database,
  X,
  Type,
  Split,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  setEdges,
  updateNodeDataById,
  toggleNodeCollapse,
  removeNodeWithEdges,
} from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { getStepStatus, renderStatusPill } from '@/utils/workflowUtils'
import type { StructuredOutputNodeData } from './StructuredOutputNode'
import {
  ROUTE_HANDLE_PREFIX,
  HANDLE_NUMBERS,
  HANDLE_COLORS,
  ROUTE_COLORS,
} from '@/utils/constants/workflowBuilder'
import type { Agent } from '@/redux/types/agent'

export type StepNodeData = {
  prompt: number | null
  contentFiles: number[]
  embeddingFiles: number[]
  llm: number | null
  stepNumber: number
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  apiId?: number
  usePreviousStepFiles?: boolean
  usePreviousStepEmbeddings?: boolean
  textInput?: string
  useStructuredOutputNode?: boolean
  enableWebSearch?: boolean
  id?: string
  isCollapsed?: boolean
}

export default function StepNode({ id, data, selected }: NodeProps) {
  const nodeId = id as string // ReactFlow guarantees id is string when component renders
  const stepData = data as StepNodeData
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[nodeId] || {}) as Record<string, string>
  const dispatch = useAppDispatch()

  const [showAdvanced, setShowAdvanced] = useState(false)

  const prompts = useAppSelector((s) => s.prompt.prompts)
  const files = useAppSelector((s) => s.files.files)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const agents = useAppSelector((s) => s.agent.agents)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)
  const edges = useAppSelector((s) => s.workflowBuilder.edges)
  const nodes = useAppSelector((s) => s.workflowBuilder.nodes)
  const updateNodeInternals = useUpdateNodeInternals()

  // Check if this step node is connected to a start node
  const isConnectedToStart = edges.some((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return edge.target === nodeId && sourceNode?.type === 'start'
  })

  const useStructuredOutputNode = stepData.useStructuredOutputNode || false

  // Calculate input handles based on actual connections (excluding start nodes)
  const connectedInputEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return (
      edge.target === nodeId &&
      (sourceNode?.type === 'step' ||
        sourceNode?.type === 'chatOutput' ||
        sourceNode?.type === 'conditional')
    )
  })

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<StepNodeData>) => {
    dispatch(updateNodeDataById({ nodeId: nodeId, newData: updates }))
  }

  // Inject agent properties into step node
  const injectAgentProperties = (agent: Agent) => {
    updateNodeData({
      prompt: agent.prompt,
      contentFiles: agent.contentFiles || [],
      embeddingFiles: agent.embeddingFiles || [],
      llm: agent.llm,
      maxTokens: agent.maxTokens,
      temperature: agent.temperature,
      maxContextSnippets: agent.maxContextSnippets,
      documentSimilarityThreshold: agent.documentSimilarityThreshold,
      enableWebSearch: agent.enableWebSearch,
    })
  }

  const connectedStructuredOutputEdge = edges.find((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    return edge.target === nodeId && sourceNode?.type === 'structuredOutput'
  })

  const connectedStructuredOutputNode = connectedStructuredOutputEdge
    ? nodes.find((n) => n.id === connectedStructuredOutputEdge.source)
    : undefined

  const structuredRoutes: { name: string; description?: string }[] =
    (
      (connectedStructuredOutputNode?.data as Partial<StructuredOutputNodeData>) ||
      {}
    ).routes || []

  const structuredNodeId = connectedStructuredOutputNode?.id
  const routesCount = structuredRoutes.length

  const routeNames = useMemo(
    () => structuredRoutes.map((r) => r.name).join(','),
    [structuredRoutes]
  )

  useEffect(() => {
    updateNodeInternals(nodeId)
  }, [
    updateNodeInternals,
    nodeId,
    useStructuredOutputNode,
    structuredNodeId,
    routesCount,
    routeNames, // Track route name changes, not just count
  ])

  // When using a structured output node, prune any invalid or stale outgoing edges from this step
  useEffect(() => {
    if (!useStructuredOutputNode) return
    if (!connectedStructuredOutputNode) return

    const allowedHandles = new Set(
      structuredRoutes.map((r) => `${ROUTE_HANDLE_PREFIX}${r.name}`)
    )

    const filtered = edges.filter((e) => {
      if (e.source !== nodeId) return true
      return e.sourceHandle ? allowedHandles.has(e.sourceHandle) : false
    })

    if (filtered.length !== edges.length) {
      dispatch(setEdges(filtered))
    }
  }, [dispatch, edges, nodeId, connectedStructuredOutputNode, structuredRoutes])

  const stepStatus = getStepStatus(currentRun, stepData?.stepNumber)

  const isCollapsed = stepData?.isCollapsed || false

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
              <Brain className='h-3 w-3 text-primary' />
            </div>
            Step {stepData?.stepNumber}
          </div>
          <div className='flex items-center gap-1'>
            {renderStatusPill(stepStatus)}
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
        {/* Agent Template Selector in Header */}
        {!isCollapsed && agents.length > 0 && (
          <div className='mt-2 flex items-center gap-2'>
            <Select
              value=''
              onValueChange={(value) => {
                const selectedAgent = agents.find((a) => a.id === Number(value))
                if (selectedAgent) {
                  injectAgentProperties(selectedAgent)
                }
              }}
            >
              <SelectTrigger className='h-7 bg-blue-50 text-xs dark:bg-blue-900/20'>
                <SelectValue placeholder='Load agent...' />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='prompt' className='text-xs font-medium'>
              Prompt
            </Label>
            <Select
              value={stepData.prompt ? stepData.prompt.toString() : ''}
              onValueChange={(value) => {
                updateNodeData({ prompt: Number(value) })
                clearNodeError(nodeId, 'prompt')
              }}
            >
              <SelectTrigger
                className={`bg-background text-sm ${
                  fieldErrors.prompt ? 'border-destructive' : ''
                }`}
              >
                <SelectValue placeholder='Select a prompt' />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.title}
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

          <div className='space-y-2'>
            <Label
              htmlFor='textInput'
              className='flex items-center gap-2 text-xs font-medium'
            >
              <Type className='h-3 w-3' />
              Text Input (Optional)
            </Label>
            <Textarea
              id='textInput'
              placeholder='Enter text to be included in this step...'
              value={stepData.textInput || ''}
              onChange={(e) => {
                updateNodeData({ textInput: e.target.value })
              }}
              className='min-h-[80px] resize-y text-sm'
            />
            <p className='text-xs text-muted-foreground'>
              This text will be passed directly to the LLM along with any
              selected files.
            </p>
          </div>

          {/* Content Files */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2 text-xs font-medium'>
              <FileText className='h-3 w-3' />
              Content Files
            </Label>
            <div className='flex flex-wrap gap-1'>
              {(stepData.contentFiles || []).map((fileId) => {
                const file = files.find((f) => f.id === fileId)
                return (
                  <Badge key={fileId} variant='secondary' className='text-xs'>
                    {file?.name || `File ${fileId}`}
                    <Button
                      size='sm'
                      variant='ghost'
                      className='ml-1 h-4 w-4 p-0'
                      onClick={() => {
                        const newFiles = (stepData.contentFiles || []).filter(
                          (id) => id !== fileId
                        )
                        updateNodeData({ contentFiles: newFiles })
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                )
              })}
              <Select
                value=''
                onValueChange={(value) => {
                  const fileId = Number(value)
                  const currentFiles = stepData.contentFiles || []
                  if (value && !currentFiles.includes(fileId)) {
                    const newFiles = [...currentFiles, fileId]
                    updateNodeData({ contentFiles: newFiles })
                  }
                }}
              >
                <SelectTrigger className='bg-background text-sm'>
                  <SelectValue placeholder='+ Add' />
                </SelectTrigger>
                <SelectContent>
                  {files
                    .filter(
                      (f) => !(stepData.contentFiles || []).includes(f.id)
                    )
                    .map((file) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Embedding Files */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2 text-xs font-medium'>
              <Database className='h-3 w-3' />
              Embedding Files
            </Label>
            <div className='flex flex-wrap gap-1'>
              {(stepData.embeddingFiles || []).map((fileId) => {
                const file = files.find((f) => f.id === fileId)
                return (
                  <Badge key={fileId} variant='secondary' className='text-xs'>
                    {file?.name || `File ${fileId}`}
                    <Button
                      size='sm'
                      variant='ghost'
                      className='ml-1 h-4 w-4 p-0'
                      onClick={() => {
                        const newFiles = (stepData.embeddingFiles || []).filter(
                          (id) => id !== fileId
                        )
                        updateNodeData({ embeddingFiles: newFiles })
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                )
              })}
              <Select
                value=''
                onValueChange={(value) => {
                  const fileId = Number(value)
                  const currentFiles = stepData.embeddingFiles || []
                  if (value && !currentFiles.includes(fileId)) {
                    const newFiles = [...currentFiles, fileId]
                    updateNodeData({ embeddingFiles: newFiles })
                  }
                }}
              >
                <SelectTrigger className='bg-background text-sm'>
                  <SelectValue placeholder='+ Add' />
                </SelectTrigger>
                <SelectContent>
                  {files
                    .filter(
                      (f) => !(stepData.embeddingFiles || []).includes(f.id)
                    )
                    .map((file) => (
                      <SelectItem key={file.id} value={file.id.toString()}>
                        {file.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='llm' className='text-xs font-medium'>
              LLM Model
            </Label>
            <Select
              value={stepData.llm ? stepData.llm.toString() : ''}
              onValueChange={(value) => {
                updateNodeData({ llm: Number(value) })
                clearNodeError(nodeId, 'llm')
              }}
            >
              <SelectTrigger
                className={`bg-background text-sm ${
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

          <div className='flex items-center space-x-2 rounded-md border border-muted bg-muted/30 p-3'>
            <Checkbox
              id={`use-structured-output-node-${nodeId}`}
              checked={useStructuredOutputNode}
              onCheckedChange={(checked) => {
                updateNodeData({ useStructuredOutputNode: !!checked })
              }}
            />
            <div className='flex-1'>
              <Label
                htmlFor={`use-structured-output-node-${nodeId}`}
                className='flex cursor-pointer items-center gap-2 text-xs font-medium'
              >
                <Split className='h-3 w-3' />
                Use Structured Output Node
              </Label>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Connect a Structured Output node to define routing paths
              </p>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full text-xs'
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className='mr-2 h-3 w-3' />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className='space-y-4 border-t pt-4'>
              <div className='space-y-2'>
                <Label className='text-xs font-medium'>
                  Max Tokens: {stepData.maxTokens || 2048}
                </Label>
                <Slider
                  value={[stepData.maxTokens || 2048]}
                  onValueChange={(value) => {
                    updateNodeData({ maxTokens: value[0] })
                  }}
                  max={8192}
                  min={100}
                  step={100}
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-medium'>
                  Temperature: {stepData.temperature || 0.7}
                </Label>
                <Slider
                  value={[stepData.temperature || 0.7]}
                  onValueChange={(value) => {
                    updateNodeData({ temperature: value[0] })
                  }}
                  max={2}
                  min={0}
                  step={0.1}
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-medium'>
                  Max Context Snippets: {stepData.maxContextSnippets || 4}
                </Label>
                <Slider
                  value={[stepData.maxContextSnippets || 4]}
                  onValueChange={(value) => {
                    updateNodeData({ maxContextSnippets: value[0] })
                  }}
                  max={20}
                  min={1}
                  step={1}
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs font-medium'>
                  Document Similarity Threshold:{' '}
                  {stepData.documentSimilarityThreshold || 0.2}
                </Label>
                <Slider
                  value={[stepData.documentSimilarityThreshold || 0.2]}
                  onValueChange={(value) => {
                    updateNodeData({ documentSimilarityThreshold: value[0] })
                  }}
                  max={1}
                  min={0}
                  step={0.1}
                  className='w-full'
                />
              </div>

              <div className='flex items-center justify-between rounded-md border border-muted bg-muted/20 p-3'>
                <div className='flex-1'>
                  <Label className='flex cursor-pointer items-center gap-2 text-xs font-medium'>
                    <Globe className='h-3 w-3' />
                    Enable Web Search
                  </Label>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    Allow the LLM to search the web for real-time information
                  </p>
                </div>
                <Switch
                  id={`enable-web-search-${nodeId}`}
                  checked={stepData.enableWebSearch || false}
                  onCheckedChange={(checked) => {
                    updateNodeData({ enableWebSearch: checked })
                  }}
                  className='ml-2'
                />
              </div>
            </div>
          )}
        </CardContent>
      )}

      {/* Input handles - single static handle if connected to start, 5 fixed colorful handles otherwise */}
      {isConnectedToStart ? (
        // Traditional single input handle when connected to start node
        <Handle
          type='target'
          position={Position.Left}
          id='input-1'
          className='bg-secondary'
        />
      ) : (
        // Pre-create 5 handles at fixed positions with different colors
        <>
          {HANDLE_NUMBERS.map((num) => {
            const handleId = `input-${num}`
            const isConnected = connectedInputEdges.some(
              (edge) => edge.targetHandle === handleId
            )

            // Fixed positions: 20%, 35%, 50%, 65%, 80%
            const topPercent = 5 + num * 15

            // Show logic: always show connected handles + one extra for next connection
            const connectedCount = connectedInputEdges.length
            const shouldShow = num <= connectedCount + 1

            // Get color from constants
            const handleColor = HANDLE_COLORS[num - 1]

            return (
              <Handle
                key={handleId}
                type='target'
                position={Position.Left}
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
      )}

      {!useStructuredOutputNode && (
        <Handle
          type='source'
          position={Position.Right}
          id='default'
          className='border-2 border-white bg-primary'
        />
      )}

      {useStructuredOutputNode &&
        connectedStructuredOutputNode &&
        structuredRoutes.length > 0 && (
          <>
            {structuredRoutes.map((route, index) => {
              const color = ROUTE_COLORS[index % ROUTE_COLORS.length]

              const count = structuredRoutes.length
              const spacing = 80 / (count + 1)
              const position = (index + 1) * spacing + 10

              return (
                <React.Fragment key={`route-${route.name}`}>
                  <Handle
                    type='source'
                    position={Position.Right}
                    id={`${ROUTE_HANDLE_PREFIX}${route.name}`}
                    style={{ top: `${position}%` }}
                    className={`h-3 w-3 border-2 border-white ${color}`}
                  />
                  <div
                    className='pointer-events-none absolute z-10 text-xs font-medium text-muted-foreground'
                    style={{
                      right: '-5%',
                      top: `${position}%`,
                      transform: 'translate(100%, -50%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {route.name}
                  </div>
                </React.Fragment>
              )
            })}
          </>
        )}

      {useStructuredOutputNode && (
        <Handle
          type='target'
          position={Position.Bottom}
          id='structured-output-input'
          className='h-3 w-3 bg-purple-500'
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      )}
    </Card>
  )
}
