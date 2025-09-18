import { Handle, Position, type NodeProps } from '@xyflow/react'
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
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  Settings,
  FileText,
  Database,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { updateNodeDataById } from '@/redux/workflowBuilderSlice'
import { useErrorsContext } from '../ErrorsContext'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'

export type StepNodeData = {
  prompt: string | null
  contentFiles: string[]
  embeddingFiles: string[]
  llm: string | null
  stepNumber: number
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  apiId?: number
}

export default function StepNode({ id, data, selected }: NodeProps) {
  const nodeData = (data as unknown as StepNodeData) || ({} as StepNodeData)
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = (errorsByNodeId[id] || {}) as Record<string, string>
  const dispatch = useAppDispatch()

  // Local state for form inputs
  const [prompt, setPrompt] = useState(
    nodeData.prompt ? String(nodeData.prompt) : ''
  )
  const [contentFiles, setContentFiles] = useState<string[]>(
    nodeData.contentFiles || []
  )
  const [embeddingFiles, setEmbeddingFiles] = useState<string[]>(
    nodeData.embeddingFiles || []
  )
  const [llm, setLlm] = useState<string | number>(nodeData.llm ?? '')
  const [maxTokens, setMaxTokens] = useState<number>(
    Number(nodeData?.maxTokens ?? 2048)
  )
  const [temperature, setTemperature] = useState<number>(
    Number(nodeData?.temperature ?? 0.7)
  )
  const [maxContextSnippets, setMaxContextSnippets] = useState<number>(
    Number(nodeData?.maxContextSnippets ?? 4)
  )
  const [documentSimilarityThreshold, setDocumentSimilarityThreshold] =
    useState<number>(Number(nodeData?.documentSimilarityThreshold ?? 0.2))
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Redux selectors
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const files = useAppSelector((s) => s.files.files)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const { currentRun } = useAppSelector((s) => s.workflowBuilder)

  // Update Redux when form changes
  const updateNodeData = (updates: Partial<StepNodeData>) => {
    dispatch(updateNodeDataById({ nodeId: id, newData: updates }))
  }

  // Sync local state with props data when it changes (from Redux)
  useEffect(() => {
    const newData = data as StepNodeData
    if (newData.prompt !== undefined && newData.prompt !== prompt) {
      setPrompt(newData.prompt ? String(newData.prompt) : '')
    }
    if (newData.llm !== undefined && newData.llm !== llm) {
      setLlm(newData.llm ?? '')
    }
    if (
      newData.contentFiles &&
      JSON.stringify(newData.contentFiles) !== JSON.stringify(contentFiles)
    ) {
      setContentFiles(newData.contentFiles)
    }
    if (
      newData.embeddingFiles &&
      JSON.stringify(newData.embeddingFiles) !== JSON.stringify(embeddingFiles)
    ) {
      setEmbeddingFiles(newData.embeddingFiles)
    }
    if (newData.maxTokens !== undefined && newData.maxTokens !== maxTokens) {
      setMaxTokens(newData.maxTokens)
    }
    if (
      newData.temperature !== undefined &&
      newData.temperature !== temperature
    ) {
      setTemperature(newData.temperature)
    }
  }, [data])

  // Get the status of this step from the current workflow run
  const getStepStatus = () => {
    if (!currentRun || !currentRun.steps) return null
    const runStep = currentRun.steps.find(
      (rs) => (rs.order || rs.step) === nodeData.stepNumber
    )
    return runStep?.status || null
  }

  const stepStatus = getStepStatus()

  // Render status pill for the step
  const renderStatusPill = () => {
    if (!stepStatus) return null

    const getStatusIcon = () => {
      switch (stepStatus) {
        case WorkflowRunStepStatus.Pending:
          return <Clock className='h-3 w-3' />
        case WorkflowRunStepStatus.Running:
          return <Loader2 className='h-3 w-3 animate-spin' />
        case WorkflowRunStepStatus.Completed:
          return <CheckCircle className='h-3 w-3' />
        case WorkflowRunStepStatus.Failed:
          return <XCircle className='h-3 w-3' />
        default:
          return null
      }
    }

    const getStatusColor = () => {
      switch (stepStatus) {
        case WorkflowRunStepStatus.Pending:
          return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        case WorkflowRunStepStatus.Running:
          return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
        case WorkflowRunStepStatus.Completed:
          return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
        case WorkflowRunStepStatus.Failed:
          return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        default:
          return 'bg-muted text-muted-foreground border-border'
      }
    }

    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className='capitalize'>{stepStatus}</span>
      </div>
    )
  }

  return (
    <Card
      className={`w-80 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
              <Brain className='h-3 w-3 text-primary' />
            </div>
            Step {nodeData.stepNumber}
          </div>
          {renderStatusPill()}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='prompt' className='text-xs font-medium'>
            Prompt
          </Label>
          <Select
            value={prompt}
            onValueChange={(value) => {
              setPrompt(value)
              updateNodeData({ prompt: value })
              clearNodeError(id, 'prompt')
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

        {/* Content Files */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-xs font-medium'>
            <FileText className='h-3 w-3' />
            Content Files
          </Label>
          <div className='flex flex-wrap gap-1'>
            {contentFiles.map((fileId) => {
              const file = files.find((f) => f.id.toString() === fileId)
              return (
                <Badge key={fileId} variant='secondary' className='text-xs'>
                  {file?.name || `File ${fileId}`}
                  <Button
                    size='sm'
                    variant='ghost'
                    className='ml-1 h-4 w-4 p-0'
                    onClick={() => {
                      const newFiles = contentFiles.filter(
                        (id) => id !== fileId
                      )
                      setContentFiles(newFiles)
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
                if (value && !contentFiles.includes(value)) {
                  const newFiles = [...contentFiles, value]
                  setContentFiles(newFiles)
                  updateNodeData({ contentFiles: newFiles })
                }
              }}
            >
              <SelectTrigger className='bg-background text-sm'>
                <SelectValue placeholder='+ Add' />
              </SelectTrigger>
              <SelectContent>
                {files
                  .filter((f) => !contentFiles.includes(f.id.toString()))
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
            {embeddingFiles.map((fileId) => {
              const file = files.find((f) => f.id.toString() === fileId)
              return (
                <Badge key={fileId} variant='secondary' className='text-xs'>
                  {file?.name || `File ${fileId}`}
                  <Button
                    size='sm'
                    variant='ghost'
                    className='ml-1 h-4 w-4 p-0'
                    onClick={() => {
                      const newFiles = embeddingFiles.filter(
                        (id) => id !== fileId
                      )
                      setEmbeddingFiles(newFiles)
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
                if (value && !embeddingFiles.includes(value)) {
                  const newFiles = [...embeddingFiles, value]
                  setEmbeddingFiles(newFiles)
                  updateNodeData({ embeddingFiles: newFiles })
                }
              }}
            >
              <SelectTrigger className='bg-background text-sm'>
                <SelectValue placeholder='+ Add' />
              </SelectTrigger>
              <SelectContent>
                {files
                  .filter((f) => !embeddingFiles.includes(f.id.toString()))
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
            value={llm.toString()}
            onValueChange={(value) => {
              setLlm(value)
              updateNodeData({ llm: value })
              clearNodeError(id, 'llm')
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
                Max Tokens: {maxTokens}
              </Label>
              <Slider
                value={[maxTokens]}
                onValueChange={(value) => {
                  setMaxTokens(value[0])
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
                Temperature: {temperature}
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => {
                  setTemperature(value[0])
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
                Max Context Snippets: {maxContextSnippets}
              </Label>
              <Slider
                value={[maxContextSnippets]}
                onValueChange={(value) => {
                  setMaxContextSnippets(value[0])
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
                Document Similarity Threshold: {documentSimilarityThreshold}
              </Label>
              <Slider
                value={[documentSimilarityThreshold]}
                onValueChange={(value) => {
                  setDocumentSimilarityThreshold(value[0])
                  updateNodeData({ documentSimilarityThreshold: value[0] })
                }}
                max={1}
                min={0}
                step={0.1}
                className='w-full'
              />
            </div>
          </div>
        )}
      </CardContent>

      <Handle
        type='target'
        position={Position.Left}
        className='h-4 w-4 bg-secondary'
      />
      <Handle
        type='source'
        position={Position.Right}
        className='h-4 w-4 border-2 border-white bg-primary'
      />
    </Card>
  )
}
