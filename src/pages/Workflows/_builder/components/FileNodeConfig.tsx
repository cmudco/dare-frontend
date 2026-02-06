import { X, FileText, Database, Type } from 'lucide-react'
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
import { RetrievalMode, QuerySource } from '@/utils/constants/workflows'

export interface FileNodeData {
  files?: number[]
  retrievalMode?: RetrievalMode
  similarityThreshold?: number
  maxResults?: number
  querySource?: QuerySource
  textInput?: string
  includeMetadata?: boolean
  stepNumber?: number
}

interface FileNodeConfigProps {
  nodeData: FileNodeData
  updateNodeData: (updates: Record<string, unknown>) => void
  files: Array<{ id: number; name: string }>
}

export default function FileNodeConfig({
  nodeData,
  updateNodeData,
  files,
}: FileNodeConfigProps) {
  const [localTextInput, setLocalTextInput] = useState(
    nodeData?.textInput || ''
  )

  useEffect(() => {
    setLocalTextInput(nodeData?.textInput || '')
  }, [nodeData?.textInput])

  // Debounced sync to Redux
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localTextInput !== (nodeData?.textInput || '')) {
        updateNodeData({ textInput: localTextInput })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [localTextInput, nodeData?.textInput, updateNodeData])

  const retrievalMode = nodeData?.retrievalMode || RetrievalMode.Embeddings
  const showEmbeddingsSettings =
    retrievalMode === RetrievalMode.Embeddings ||
    retrievalMode === RetrievalMode.Both

  return (
    <div className='space-y-4'>
      {/* File Selector */}
      <div className='space-y-2'>
        <Label className='flex items-center gap-2 text-xs font-medium'>
          <FileText className='h-3 w-3' />
          Files
        </Label>
        <div className='flex flex-wrap gap-1'>
          {(nodeData?.files || []).map((fileId) => {
            const file = files.find((f) => f.id === fileId)
            return (
              <Badge key={fileId} variant='secondary' className='text-xs'>
                {file?.name || `File ${fileId}`}
                <Button
                  size='sm'
                  variant='ghost'
                  className='ml-1 h-4 w-4 p-0'
                  onClick={() => {
                    const newFiles = (nodeData?.files || []).filter(
                      (id) => id !== fileId
                    )
                    updateNodeData({ files: newFiles })
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
              const currentFiles = nodeData?.files || []
              if (value && !currentFiles.includes(fileId)) {
                updateNodeData({ files: [...currentFiles, fileId] })
              }
            }}
          >
            <SelectTrigger className='w-full bg-background text-sm'>
              <SelectValue placeholder='+ Add file' />
            </SelectTrigger>
            <SelectContent>
              {files
                .filter((f) => !(nodeData?.files || []).includes(f.id))
                .map((file) => (
                  <SelectItem key={file.id} value={file.id.toString()}>
                    {file.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Retrieval Mode */}
      <div className='space-y-2'>
        <Label className='flex items-center gap-2 text-xs font-medium'>
          <Database className='h-3 w-3' />
          Retrieval Mode
        </Label>
        <Select
          value={retrievalMode}
          onValueChange={(value) => {
            updateNodeData({ retrievalMode: value })
          }}
        >
          <SelectTrigger className='bg-background text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RetrievalMode.Embeddings}>
              Embeddings (Vector Search)
            </SelectItem>
            <SelectItem value={RetrievalMode.Content}>
              Content (Full Text)
            </SelectItem>
            <SelectItem value={RetrievalMode.Both}>
              Both (Embeddings + Content)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>
          {retrievalMode === RetrievalMode.Embeddings &&
            'Search for relevant snippets using vector similarity.'}
          {retrievalMode === RetrievalMode.Content &&
            'Extract the full text content from files.'}
          {retrievalMode === RetrievalMode.Both &&
            'Combine vector search snippets with full text content.'}
        </p>
      </div>

      {/* Query Source */}
      <div className='space-y-2'>
        <Label className='text-xs font-medium'>Query Source</Label>
        <Select
          value={nodeData?.querySource || QuerySource.PreviousStep}
          onValueChange={(value) => {
            updateNodeData({ querySource: value })
          }}
        >
          <SelectTrigger className='bg-background text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuerySource.PreviousStep}>
              Previous Step Output
            </SelectItem>
            <SelectItem value={QuerySource.TextInput}>
              Custom Text Input
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Input (only when querySource is text_input) */}
      {nodeData?.querySource === QuerySource.TextInput && (
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-xs font-medium'>
            <Type className='h-3 w-3' />
            Query Text
          </Label>
          <Textarea
            placeholder='Enter your search query...'
            value={localTextInput}
            onChange={(e) => setLocalTextInput(e.target.value)}
            className='min-h-[80px] resize-y text-sm'
          />
          <p className='text-xs text-muted-foreground'>
            This text will be used as the search query for retrieval.
          </p>
        </div>
      )}

      {/* Embeddings Settings */}
      {showEmbeddingsSettings && (
        <div className='space-y-4 border-t pt-4'>
          <div className='space-y-2'>
            <Label className='text-xs font-medium'>
              Similarity Threshold: {nodeData?.similarityThreshold ?? 0.5}
            </Label>
            <Slider
              value={[nodeData?.similarityThreshold ?? 0.5]}
              onValueChange={(value) => {
                updateNodeData({ similarityThreshold: value[0] })
              }}
              max={1}
              min={0}
              step={0.05}
              className='w-full'
            />
            <p className='text-xs text-muted-foreground'>
              Minimum similarity score for matched snippets.
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='text-xs font-medium'>
              Max Results: {nodeData?.maxResults ?? 10}
            </Label>
            <Slider
              value={[nodeData?.maxResults ?? 10]}
              onValueChange={(value) => {
                updateNodeData({ maxResults: value[0] })
              }}
              max={50}
              min={1}
              step={1}
              className='w-full'
            />
          </div>
        </div>
      )}

      {/* Include Metadata */}
      <div className='flex items-center justify-between rounded-md border border-muted bg-muted/20 p-3'>
        <div className='flex-1'>
          <Label className='cursor-pointer text-xs font-medium'>
            Include Metadata
          </Label>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Include file names and similarity scores in output
          </p>
        </div>
        <Switch
          checked={nodeData?.includeMetadata ?? true}
          onCheckedChange={(checked) => {
            updateNodeData({ includeMetadata: checked })
          }}
          className='ml-2'
        />
      </div>
    </div>
  )
}
