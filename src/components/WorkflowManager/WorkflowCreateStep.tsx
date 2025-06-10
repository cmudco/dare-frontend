import React, { useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  ChevronsUpDown,
  GripVertical,
  HelpCircle,
  Database,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { WorkflowStepProps } from '@/redux/types/workflow'
import { Slider } from '../ui/slider'
import { MODEL_CONFIG } from '@/config/modelConfig'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import WorkflowEmbeddingSettings from './WorkflowEmbeddingSettings'
import {
  getTemperatureColor,
  getTemperatureDescription,
  getMaxTokensColor,
  getMaxTokensDescription,
} from '@/utils/modelConfigUtils'

export const WorkflowCreateStep: React.FC<WorkflowStepProps> = ({
  index,
  step,
  prompts,
  files,
  llms,
  onRemove,
  onMove,
  onChange,
  error,
  touched,
  totalSteps,
  isOpenByDefault,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault && index === 0)

  const currentMaxTokens = step.maxTokens ?? MODEL_CONFIG.maxTokens
  const currentTemperature = step.temperature ?? MODEL_CONFIG.temperature

  const handlePromptChange = (value: string) => {
    const newPrompt = prompts.find((p) => p.id == value)
    onChange('prompt', newPrompt || null)
  }

  const handleFileChange = (value: string) => {
    if (value === 'none') {
      onChange('file', null)
    } else {
      const newFile = files.find((f) => f.id === parseInt(value))
      onChange('file', newFile || null)
    }
  }

  const handleLLMChange = (value: string) => {
    if (value === 'none') {
      onChange('llm', null)
    } else {
      const newLLM = llms.find((l) => l.id === parseInt(value))
      onChange('llm', newLLM || null)
    }
  }

  const handleMaxTokensChange = (values: number[]) => {
    onChange('maxTokens', values[0])
  }

  const handleTemperatureChange = (values: number[]) => {
    onChange('temperature', values[0])
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='overflow-hidden rounded-md border bg-white'
    >
      <div className='flex items-center justify-between bg-gray-50 p-3'>
        <div className='flex items-center'>
          <div className='mr-3 cursor-move'>
            <GripVertical className='h-5 w-5 text-gray-400' />
          </div>
          <span className='text-sm font-medium'>Step {index + 1}</span>
          {step.id && (
            <span className='ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800'>
              Saved
            </span>
          )}
        </div>

        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => onMove('up')}
            className='h-8 w-8 p-0'
            disabled={index === 0}
          >
            <ChevronUp className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => onMove('down')}
            className='h-8 w-8 p-0'
            disabled={index === totalSteps! - 1}
          >
            <ChevronDown className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onRemove}
            className='h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
          <CollapsibleTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
            >
              <ChevronsUpDown className='h-4 w-4' />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className='space-y-6 border-t p-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Select Prompt</label>
            <Select
              value={step.prompt?.id.toString() || ''}
              onValueChange={handlePromptChange}
            >
              <SelectTrigger
                className={
                  error?.prompt && touched?.prompt ? 'border-red-500' : ''
                }
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
            {error?.prompt && touched?.prompt && (
              <p className='mt-1 text-xs text-red-500'>{error.prompt}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Select File</label>
            <Select
              value={step.file?.id?.toString() || 'none'}
              onValueChange={handleFileChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a file' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None</SelectItem>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id.toString()}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.file && touched?.file && (
              <p className='mt-1 text-xs text-red-500'>{error.file}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Select LLM</label>
            <Select
              value={step.llm?.id?.toString() || 'none'}
              onValueChange={handleLLMChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select an LLM' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None</SelectItem>
                {llms.map((llm) => (
                  <SelectItem key={llm.id} value={llm.id.toString()}>
                    {llm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error?.llm && touched?.llm && (
              <p className='mt-1 text-xs text-red-500'>{error.llm as string}</p>
            )}
          </div>

          <hr className='my-4' />

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor={`temperature-slider-${index}`}
                className='text-sm font-medium'
              >
                Temperature
              </Label>
              <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm'>
                {currentTemperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id={`temperature-slider-${index}`}
              value={[currentTemperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={handleTemperatureChange}
              className='my-2 cursor-pointer'
            />
            <div className='flex justify-between px-1 text-xs text-gray-500'>
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
            <div
              className={`mt-1 text-xs ${getTemperatureColor(currentTemperature)}`}
            >
              {getTemperatureDescription(currentTemperature)}
            </div>
            {error?.temperature && touched?.temperature && (
              <p className='mt-1 text-xs text-red-500'>
                {error.temperature as string}
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor={`max-tokens-slider-${index}`}
                className='text-sm font-medium'
              >
                Max Tokens
              </Label>
              <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm'>
                {currentMaxTokens}
              </span>
            </div>
            <Slider
              id={`max-tokens-slider-${index}`}
              value={[currentMaxTokens]}
              min={1}
              max={
                MODEL_CONFIG.maxTokens > 4096 ? MODEL_CONFIG.maxTokens : 8192
              }
              step={128}
              onValueChange={handleMaxTokensChange}
              className='my-2 cursor-pointer'
            />
            <div
              className={`mt-1 text-xs ${getMaxTokensColor(currentMaxTokens)}`}
            >
              {getMaxTokensDescription(currentMaxTokens)}
            </div>
            {error?.maxTokens && touched?.maxTokens && (
              <p className='mt-1 text-xs text-red-500'>
                {error.maxTokens as string}
              </p>
            )}
          </div>

          <TooltipProvider>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label className='text-sm font-medium'>Use Embeddings</Label>
                  <p className='text-xs text-gray-500'>
                    Enable document embeddings for context-aware responses
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    checked={step.isEmbeddings || false}
                    onCheckedChange={(checked) =>
                      onChange('isEmbeddings', checked)
                    }
                  />
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 p-0'
                      >
                        <HelpCircle className='h-4 w-4 text-gray-500' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='left'
                      className='z-[60] rounded-md bg-gray-900 p-2 text-white'
                    >
                      <p className='w-[280px] text-xs'>
                        When enabled, this step will use document embeddings to
                        provide context-aware responses based on the selected
                        file.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {step.isEmbeddings && (
                <div className='mt-2 flex items-center space-x-2 rounded-md bg-blue-50 p-2'>
                  <Database className='h-4 w-4 text-blue-600' />
                  <p className='text-xs text-blue-700'>
                    Embeddings enabled for this step
                  </p>
                </div>
              )}
            </div>
          </TooltipProvider>

          {step.isEmbeddings && (
            <WorkflowEmbeddingSettings step={step} onChange={onChange} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
