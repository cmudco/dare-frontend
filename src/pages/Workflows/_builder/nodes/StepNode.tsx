import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, FileText, Database, Brain, X, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
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
  errors?: { prompt?: string }
}

export default function StepNode({ id, data, selected }: NodeProps) {
  const nodeData = (data as unknown as StepNodeData) || ({} as StepNodeData)
  const { errorsByNodeId, clearNodeError } = useErrorsContext()
  const fieldErrors = errorsByNodeId[id] || {}
  const [prompt, setPrompt] = useState(nodeData.prompt ? String(nodeData.prompt) : '')
  const [contentFiles, setContentFiles] = useState<string[]>(nodeData.contentFiles || [])
  const [embeddingFiles, setEmbeddingFiles] = useState<string[]>(nodeData.embeddingFiles || [])
  const [llm, setLlm] = useState<string | number>(nodeData.llm ?? '')
  const [maxTokens, setMaxTokens] = useState<number>(Number(nodeData?.maxTokens ?? 2048))
  const [temperature, setTemperature] = useState<number>(Number(nodeData?.temperature ?? 0.7))
  const [maxContextSnippets, setMaxContextSnippets] = useState<number>(Number(nodeData?.maxContextSnippets ?? 4))
  const [documentSimilarityThreshold, setDocumentSimilarityThreshold] = useState<number>(Number(nodeData?.documentSimilarityThreshold ?? 0.2))

  const rf = useReactFlow()
  const prompts = useAppSelector((s) => s.prompt.prompts)
  const files = useAppSelector((s) => s.files.files)
  const availableModels = useAppSelector((s) => s.conversation.availableModels)
  const { selectedWorkflowRun } = useAppSelector((s) => s.workflow)
  
  // Get the status of this step from the current workflow run
  const getStepStatus = () => {
    if (!selectedWorkflowRun || !selectedWorkflowRun.steps) return null
    const runStep = selectedWorkflowRun.steps.find(rs => rs.order === nodeData.stepNumber)
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
      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className='capitalize'>{stepStatus}</span>
      </div>
    )
  }

  useEffect(() => {
    rf.setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n
        const nextData: any = {
          ...n.data,
          prompt,
          contentFiles,
          embeddingFiles,
          llm,
          maxTokens,
          temperature,
          maxContextSnippets,
          documentSimilarityThreshold,
        }
        return { ...n, data: nextData }
      })
    )
  }, [prompt, contentFiles, embeddingFiles, llm, maxTokens, temperature, maxContextSnippets, documentSimilarityThreshold, id, rf])

  // hydrate from incoming node data (prefill in edit mode)
  const hydratedOnceRef = useRef<string | null>(null)
  useEffect(() => {
    const d: any = nodeData
    const key = d?.instanceKey ?? null
    if (hydratedOnceRef.current === key) return
    if (d) {
      if (d.prompt != null) setPrompt(String(d.prompt))
      if (Array.isArray(d.contentFiles)) setContentFiles([...d.contentFiles])
      if (Array.isArray(d.embeddingFiles)) setEmbeddingFiles([...d.embeddingFiles])
      if (d.llm != null) setLlm(String(d.llm))
      if (typeof d.maxTokens === 'number') setMaxTokens(d.maxTokens)
      if (typeof d.temperature === 'number') setTemperature(d.temperature)
      if (typeof d.maxContextSnippets === 'number') setMaxContextSnippets(d.maxContextSnippets)
      if (typeof d.documentSimilarityThreshold === 'number') setDocumentSimilarityThreshold(d.documentSimilarityThreshold)
    }
    hydratedOnceRef.current = key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeData])

  const addContentFile = (fileId: string) => {
    if (!contentFiles.includes(fileId)) setContentFiles([...contentFiles, fileId])
  }
  const removeContentFile = (fileId: string) => setContentFiles(contentFiles.filter((id) => id !== fileId))
  const addEmbeddingFile = (fileId: string) => {
    if (!embeddingFiles.includes(fileId)) setEmbeddingFiles([...embeddingFiles, fileId])
  }
  const removeEmbeddingFile = (fileId: string) => setEmbeddingFiles(embeddingFiles.filter((id) => id !== fileId))

  const promptError = fieldErrors.prompt

  return (
    <Card className={`w-96 border-border ${selected ? 'ring-2 ring-primary/60' : ''}`}>
      <Handle type='target' position={Position.Left} className='h-3 w-3 border-2 border-white bg-secondary' />
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium text-card-foreground'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
              <Settings className='h-3 w-3 text-primary' />
            </div>
            Step {nodeData.stepNumber}
          </div>
          {renderStatusPill()}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label className='flex items-center gap-1 text-xs font-medium'>
            <FileText className='h-3 w-3' />
            Select Prompt
          </Label>
          <Select value={prompt} onValueChange={(v) => { setPrompt(v); clearNodeError(id, 'prompt') }}>
            <SelectTrigger className={`text-sm bg-background ${promptError ? 'border-destructive' : ''}`}>
              <SelectValue placeholder='Choose a prompt'>
                {prompt && prompts.find((p) => String(p.id) === String(prompt))?.title}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {promptError && (
            <p className='mt-1 text-xs text-destructive'>{promptError}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='flex items-center gap-1 text-xs font-medium'>
            <FileText className='h-3 w-3' />
            Content Files
          </Label>
          <div className='mb-2 flex flex-wrap gap-1'>
            {contentFiles.map((fileId) => {
              const file = files.find((f) => String(f.id) === fileId)
              return (
                <Badge key={fileId} variant='secondary' className='text-xs'>
                  {file?.name}
                  <Button size='sm' variant='ghost' className='ml-1 h-4 w-4 p-0' onClick={() => removeContentFile(fileId)}>
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )
            })}
          </div>
          <Select onValueChange={addContentFile} value={''}>
            <SelectTrigger className='text-sm bg-background'>
              <SelectValue placeholder='Add content file' />
            </SelectTrigger>
            <SelectContent>
              {files.filter((f) => !contentFiles.includes(String(f.id))).map((file) => (
                <SelectItem key={file.id} value={String(file.id)}>{file.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='flex items-center gap-1 text-xs font-medium'>
            <Database className='h-3 w-3' />
            Embedding Files
          </Label>
          <div className='mb-2 flex flex-wrap gap-1'>
            {embeddingFiles.map((fileId) => {
              const file = files.find((f) => String(f.id) === fileId)
              return (
                <Badge key={fileId} variant='outline' className='text-xs'>
                  {file?.name}
                  <Button size='sm' variant='ghost' className='ml-1 h-4 w-4 p-0' onClick={() => removeEmbeddingFile(fileId)}>
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )
            })}
          </div>
          <Select onValueChange={addEmbeddingFile} value={''}>
            <SelectTrigger className='text-sm bg-background'>
              <SelectValue placeholder='Add embedding file' />
            </SelectTrigger>
            <SelectContent>
              {files.filter((f) => !embeddingFiles.includes(String(f.id))).map((file) => (
                <SelectItem key={file.id} value={String(file.id)}>{file.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='flex items-center gap-1 text-xs font-medium'>
            <Brain className='h-3 w-3' />
            Select LLM
          </Label>
          <Select value={String(llm)} onValueChange={(v) => setLlm(v)}>
            <SelectTrigger className='text-sm bg-background'>
              <SelectValue placeholder='Choose an LLM'>
                {llm && availableModels.find((m) => String(m.id) === String(llm))?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={String(model.id)}>{model.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1'>
            <Label className='text-xs'>Max Tokens</Label>
            <Input type='number' value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className='h-8 text-sm bg-background' />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Temperature ({temperature.toFixed(2)})</Label>
            <Slider min={0} max={2} step={0.01} value={[temperature]} onValueChange={(v) => setTemperature(v[0] ?? 0.7)} />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Max Context Snippets</Label>
            <Input type='number' value={maxContextSnippets} onChange={(e) => setMaxContextSnippets(Number(e.target.value))} className='h-8 text-sm bg-background' />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Similarity Threshold ({documentSimilarityThreshold.toFixed(2)})</Label>
            <Slider min={0} max={1} step={0.01} value={[documentSimilarityThreshold]} onValueChange={(v) => setDocumentSimilarityThreshold(v[0] ?? 0.2)} />
          </div>
        </div>
      </CardContent>
      <Handle type='source' position={Position.Right} className='h-3 w-3 border-2 border-white bg-primary' />
    </Card>
  )
}


