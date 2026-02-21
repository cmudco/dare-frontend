import { Plus, Trash2, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'

// Structured Output Node Data Type
export interface StructuredOutputNodeData {
  routes?: { name: string; description: string }[]
  textInput?: string
  prompt?: number | null
  promptTitle?: string | null
  llm?: number | null
  requireHumanValidation?: boolean
}

interface StructuredOutputNodeConfigProps {
  nodeData: StructuredOutputNodeData
  updateNodeData: (updates: Record<string, unknown>) => void
  prompts: Array<{ id: number; title: string; version?: number }>
  availableModels: Array<{ id: number; name: string }>
}

export default function StructuredOutputNodeConfig({
  nodeData,
  updateNodeData,
  prompts,
  availableModels,
}: StructuredOutputNodeConfigProps) {
  const routes = nodeData?.routes || [
    { name: '1', description: 'First route' },
    { name: '2', description: 'Second route' },
  ]

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

  const addRoute = () => {
    const newRoutes = [
      ...routes,
      { name: `${routes.length + 1}`, description: '' },
    ]
    updateNodeData({ routes: newRoutes })
  }

  const removeRoute = (index: number) => {
    if (routes.length <= 2) return
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

  return (
    <div className='space-y-4'>
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
          {nodeData?.prompt && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => updateNodeData({ prompt: null })}
              className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
            >
              Clear
            </Button>
          )}
        </div>
        <Select
          value={nodeData?.prompt ? nodeData.prompt.toString() : undefined}
          onValueChange={(value) => {
            updateNodeData({ prompt: Number(value) })
          }}
        >
          <SelectTrigger id='prompt' className='text-sm'>
            <SelectValue placeholder='Use default routing prompt'>
              {nodeData?.prompt
                ? (() => {
                    const found = prompts.find((p) => p.id === nodeData.prompt)
                    if (found)
                      return `${found.title} ${found.version ? `(v${found.version})` : ''}`
                    return nodeData.promptTitle || 'Use default routing prompt'
                  })()
                : 'Use default routing prompt'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt) => (
              <SelectItem
                key={prompt.id}
                value={prompt.id.toString()}
                textValue={prompt.title}
              >
                {prompt.title} {prompt.version ? `(v${prompt.version})` : ''}
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
          value={nodeData?.llm ? nodeData.llm.toString() : ''}
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

      {/* Human Validation Toggle */}
      <div className='flex items-center space-x-2 rounded-md border border-muted bg-muted/30 p-3'>
        <Checkbox
          id='human-validation'
          checked={nodeData?.requireHumanValidation || false}
          onCheckedChange={(checked) => {
            updateNodeData({ requireHumanValidation: checked })
          }}
        />
        <div className='flex-1'>
          <Label
            htmlFor='human-validation'
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
      </div>
    </div>
  )
}
