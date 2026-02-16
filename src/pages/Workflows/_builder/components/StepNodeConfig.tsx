import { X, FileText, Database, Globe, Type, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'
import type { Agent } from '@/redux/types/agent'

// Step Node Data Type
interface FileNameMap {
  [id: number]: string
}

export interface StepNodeData {
  agent?: number | null
  prompt: number | null
  promptTitle?: string | null
  contentFiles: number[]
  contentFileNames?: FileNameMap
  embeddingFiles: number[]
  embeddingFileNames?: FileNameMap
  llm: number | null
  maxTokens?: number
  temperature?: number
  maxContextSnippets?: number
  documentSimilarityThreshold?: number
  textInput?: string
  enableWebSearch?: boolean
}

interface StepNodeConfigProps {
  nodeData: StepNodeData
  updateNodeData: (updates: Record<string, unknown>) => void
  prompts: Array<{ id: number; title: string; version?: number }>
  files: Array<{ id: number; name: string }>
  availableModels: Array<{ id: number; name: string }>
  agents?: Agent[]
}

export default function StepNodeConfig({
  nodeData,
  updateNodeData,
  prompts,
  files,
  availableModels,
  agents = [],
}: StepNodeConfigProps) {
  const [localTextInput, setLocalTextInput] = useState(
    nodeData?.textInput || ''
  )

  // Sync local state when external data changes
  useEffect(() => {
    setLocalTextInput(nodeData?.textInput || '')
  }, [nodeData?.textInput])

  // Debounced sync to Redux for text input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTextInput !== (nodeData?.textInput || '')) {
        updateNodeData({ textInput: localTextInput })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localTextInput, nodeData?.textInput, updateNodeData])

  // Handle agent selection - prefill all configuration from the agent template
  const handleAgentSelect = (agentId: string) => {
    if (agentId === 'none') {
      // Clear agent selection
      updateNodeData({ agent: null })
      return
    }

    const selectedAgent = agents.find((a) => a.id === Number(agentId))
    if (selectedAgent) {
      // Prefill all fields from the agent template
      updateNodeData({
        agent: selectedAgent.id,
        prompt: selectedAgent.prompt,
        llm: selectedAgent.llm,
        contentFiles: selectedAgent.contentFiles || [],
        embeddingFiles: selectedAgent.embeddingFiles || [],
        maxTokens: selectedAgent.maxTokens,
        temperature: selectedAgent.temperature,
        maxContextSnippets: selectedAgent.maxContextSnippets,
        documentSimilarityThreshold: selectedAgent.documentSimilarityThreshold,
        enableWebSearch: selectedAgent.enableWebSearch,
      })
    }
  }

  return (
    <div className='space-y-4'>
      {/* Agent Template Selector */}
      {agents.length > 0 && (
        <div className='space-y-2'>
          <Label
            htmlFor='agent'
            className='flex items-center gap-2 text-xs font-medium'
          >
            <Bot className='h-3 w-3' />
            Agent Template
          </Label>
          <Select
            value={nodeData?.agent ? nodeData.agent.toString() : 'none'}
            onValueChange={handleAgentSelect}
          >
            <SelectTrigger className='bg-background text-sm'>
              <SelectValue placeholder='Select an agent to prefill...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>None (Manual Configuration)</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id.toString()}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            Selecting an agent will prefill all settings below
          </p>
        </div>
      )}

      {/* Prompt */}
      <div className='space-y-2'>
        <Label htmlFor='prompt' className='text-xs font-medium'>
          Prompt
        </Label>
        <Select
          value={nodeData?.prompt ? nodeData.prompt.toString() : ''}
          onValueChange={(value) => {
            updateNodeData({ prompt: Number(value) })
          }}
        >
          <SelectTrigger className='bg-background text-sm'>
            <SelectValue placeholder='Select a prompt'>
              {nodeData?.prompt
                ? (() => {
                    const found = prompts.find((p) => p.id === nodeData.prompt)
                    if (found)
                      return `${found.title} ${found.version ? `(v${found.version})` : ''}`
                    return nodeData.promptTitle || `Prompt ${nodeData.prompt}`
                  })()
                : 'Select a prompt'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {prompts.map((p) => (
              <SelectItem
                key={p.id}
                value={p.id.toString()}
                textValue={p.title}
              >
                {p.title} {p.version ? `(v${p.version})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Input */}
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
          value={localTextInput}
          onChange={(e) => setLocalTextInput(e.target.value)}
          className='min-h-[80px] resize-y text-sm'
        />
        <p className='text-xs text-muted-foreground'>
          This text will be passed directly to the LLM along with any selected
          files.
        </p>
      </div>

      {/* Content Files */}
      <div className='space-y-2'>
        <Label className='flex items-center gap-2 text-xs font-medium'>
          <FileText className='h-3 w-3' />
          Content Files
        </Label>
        <div className='flex flex-wrap gap-1'>
          {(nodeData?.contentFiles || []).map((fileId) => {
            const file = files.find((f) => f.id === fileId)
            return (
              <Badge key={fileId} variant='secondary' className='text-xs'>
                {file?.name ||
                  nodeData?.contentFileNames?.[fileId] ||
                  `File ${fileId}`}
                <Button
                  size='sm'
                  variant='ghost'
                  className='ml-1 h-4 w-4 p-0'
                  onClick={() => {
                    const newFiles = (nodeData?.contentFiles || []).filter(
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
              const currentFiles = nodeData?.contentFiles || []
              if (value && !currentFiles.includes(fileId)) {
                updateNodeData({ contentFiles: [...currentFiles, fileId] })
              }
            }}
          >
            <SelectTrigger className='w-full bg-background text-sm'>
              <SelectValue placeholder='+ Add' />
            </SelectTrigger>
            <SelectContent>
              {files
                .filter((f) => !(nodeData?.contentFiles || []).includes(f.id))
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
          {(nodeData?.embeddingFiles || []).map((fileId) => {
            const file = files.find((f) => f.id === fileId)
            return (
              <Badge key={fileId} variant='secondary' className='text-xs'>
                {file?.name ||
                  nodeData?.embeddingFileNames?.[fileId] ||
                  `File ${fileId}`}
                <Button
                  size='sm'
                  variant='ghost'
                  className='ml-1 h-4 w-4 p-0'
                  onClick={() => {
                    const newFiles = (nodeData?.embeddingFiles || []).filter(
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
              const currentFiles = nodeData?.embeddingFiles || []
              if (value && !currentFiles.includes(fileId)) {
                updateNodeData({ embeddingFiles: [...currentFiles, fileId] })
              }
            }}
          >
            <SelectTrigger className='w-full bg-background text-sm'>
              <SelectValue placeholder='+ Add' />
            </SelectTrigger>
            <SelectContent>
              {files
                .filter((f) => !(nodeData?.embeddingFiles || []).includes(f.id))
                .map((file) => (
                  <SelectItem key={file.id} value={file.id.toString()}>
                    {file.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LLM Model */}
      <div className='space-y-2'>
        <Label htmlFor='llm' className='text-xs font-medium'>
          LLM Model
        </Label>
        <Select
          value={nodeData?.llm ? nodeData.llm.toString() : ''}
          onValueChange={(value) => {
            updateNodeData({ llm: Number(value) })
          }}
        >
          <SelectTrigger className='bg-background text-sm'>
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

      {/* Advanced Settings */}
      <div className='space-y-4 border-t pt-4'>
        <div className='space-y-2'>
          <Label className='text-xs font-medium'>
            Max Tokens: {nodeData?.maxTokens || 2048}
          </Label>
          <Slider
            value={[nodeData?.maxTokens || 2048]}
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
            Temperature: {nodeData?.temperature ?? 0.7}
          </Label>
          <Slider
            value={[nodeData?.temperature ?? 0.7]}
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
            Max Context Snippets: {nodeData?.maxContextSnippets || 4}
          </Label>
          <Slider
            value={[nodeData?.maxContextSnippets || 4]}
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
            {nodeData?.documentSimilarityThreshold ?? 0.2}
          </Label>
          <Slider
            value={[nodeData?.documentSimilarityThreshold ?? 0.2]}
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
              Allow the LLM to search the web
            </p>
          </div>
          <Switch
            checked={nodeData?.enableWebSearch || false}
            onCheckedChange={(checked) => {
              updateNodeData({ enableWebSearch: checked })
            }}
            className='ml-2'
          />
        </div>
      </div>
    </div>
  )
}
