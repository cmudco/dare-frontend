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
  GripVertical,
  HelpCircle,
  X,
  FileText,
  Database,
  Minus,
  Plus,
  Settings,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { WorkflowStepProps, Step } from '@/redux/types/workflow'
import { Slider } from '../ui/slider'
import { MODEL_CONFIG } from '@/config/modelConfig'
import { Label } from '../ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import {
  getTemperatureColor,
  getTemperatureDescription,
  getMaxTokensColor,
  getMaxTokensDescription,
} from '@/utils/modelConfigUtils'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import WorkflowEmbeddingSettings from './WorkflowEmbeddingSettings'
import { MultiSelect } from '../ui/multi-select'

export const WorkflowCreateStep: React.FC<WorkflowStepProps> = ({
  index,
  step,
  prompts,
  files,
  llms,
  totalSteps,
  onStepChange,
  onStepRemove,
  onStepReorder,
  error,
  touched,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  const onChange = (field: keyof Step, value: unknown) => {
    if (field === 'usePreviousStepFiles' && value === true) {
      onStepChange(index, 'files', [])
    }
    if (field === 'usePreviousStepEmbeddings' && value === true) {
      onStepChange(index, 'embeddings', [])
    }
    onStepChange(index, field, value)
  }

  const handlePromptChange = (promptId: string) => {
    const selectedPrompt = prompts.find((p) => p.id == promptId)
    onChange('prompt', selectedPrompt || null)
  }

  const handleFileSelect = (
    fileIds: string[],
    type: 'files' | 'embeddings'
  ) => {
    const selectedFiles = fileIds
      .map((id) => files.find((f) => f.id === parseInt(id)))
      .filter(Boolean) as typeof files
    onChange(type, selectedFiles)
  }

  const handleFileRemove = (fileId: number, type: 'files' | 'embeddings') => {
    const currentFiles = step[type] || []
    const updatedFiles = currentFiles.filter((f) => f.id !== fileId)
    onChange(type, updatedFiles)
  }

  const handleLLMChange = (llmId: string) => {
    if (llmId === 'none') {
      onChange('llm', null)
    } else {
      const selectedLLM = llms.find((l) => l.id === parseInt(llmId))
      onChange('llm', selectedLLM || null)
    }
  }

  const handleSliderChange = (field: keyof Step, values: number[]) => {
    onChange(field, values[0])
  }

  const maxTokens = step.maxTokens ?? MODEL_CONFIG.maxTokens
  const temperature = step.temperature ?? MODEL_CONFIG.temperature

  const getAvailableFiles = () => {
    return files.map((file) => ({
      value: file.id.toString(),
      label: file.name,
    }))
  }

  const getSelectedFileIds = (type: 'files' | 'embeddings') => {
    const selectedFiles = step[type] || []
    return selectedFiles.map((file) => file.id.toString())
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
        <CollapsibleTrigger asChild>
          <div className='flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted'>
            <div className='flex items-center space-x-3'>
              <GripVertical className='h-4 w-4 text-muted-foreground' />
              <div className='flex items-center space-x-2'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600'>
                  {index + 1}
                </div>
                <h3 className='font-medium text-foreground'>
                  {step.prompt?.title || `Step ${index + 1}`}
                </h3>
              </div>
              {step.usePreviousStepFiles && (
                <div className='flex items-center gap-1'>
                  <FileText className='h-3 w-3 text-orange-500' />
                  <span className='text-xs text-orange-600'>
                    Files from step {index}
                  </span>
                </div>
              )}
              {!step.usePreviousStepFiles &&
                step.files &&
                step.files.length > 0 && (
                  <div className='flex items-center gap-1'>
                    <FileText className='h-3 w-3 text-green-500' />
                    <span className='text-xs text-green-600'>
                      {step.files.length} file{step.files.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              {step.usePreviousStepEmbeddings && (
                <div className='flex items-center gap-1'>
                  <Database className='h-3 w-3 text-orange-500' />
                  <span className='text-xs text-orange-600'>
                    Embeddings from step {index}
                  </span>
                </div>
              )}
              {!step.usePreviousStepEmbeddings &&
                step.embeddings &&
                step.embeddings.length > 0 && (
                  <div className='flex items-center gap-1'>
                    <Database className='h-3 w-3 text-blue-500' />
                    <span className='text-xs text-blue-600'>
                      {step.embeddings.length} embedding
                      {step.embeddings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex gap-0.5'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index > 0) {
                      onStepReorder(index, index - 1)
                    }
                  }}
                  disabled={index === 0}
                  className='h-6 w-6 p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30'
                  title={index === 0 ? 'Already at top' : 'Move step up'}
                >
                  <ChevronUp className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index < totalSteps - 1) {
                      onStepReorder(index, index + 1)
                    }
                  }}
                  disabled={index === totalSteps - 1}
                  className='h-6 w-6 p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30'
                  title={
                    index === totalSteps - 1
                      ? 'Already at bottom'
                      : 'Move step down'
                  }
                >
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onStepRemove(index)
                }}
                className='h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700'
                title='Remove step'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
              {isOpen ? (
                <Minus className='h-4 w-4 text-muted-foreground' />
              ) : (
                <Plus className='h-4 w-4 text-muted-foreground' />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='space-y-4 p-4 pt-0'>
            {/* Prompt Selection */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Prompt *</label>
              <Select
                value={step.prompt?.id || ''}
                onValueChange={handlePromptChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a prompt' />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error?.prompt && touched?.prompt && (
                <p className='mt-1 text-xs text-red-500'>
                  {error.prompt as string}
                </p>
              )}
            </div>

            {/* Files and Embeddings Section */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Files for Full Content */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                    <FileText className='h-4 w-4 text-green-500' />
                    Content Files
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className='h-3 w-3 text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='max-w-xs text-sm'>
                            Files that will be processed with their full content
                            included in the prompt context.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {/* Use Previous Step Files Toggle */}
                  {index > 0 && (
                    <div className='flex items-center justify-between rounded-md border border-dashed border-orange-200 bg-orange-50 p-3'>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={`use-previous-files-${index}`}
                          checked={step.usePreviousStepFiles || false}
                          onChange={(e) =>
                            onChange('usePreviousStepFiles', e.target.checked)
                          }
                          className='rounded border-orange-300 text-orange-600 focus:ring-orange-500'
                        />
                        <label
                          htmlFor={`use-previous-files-${index}`}
                          className='text-sm font-medium text-orange-700'
                        >
                          Use same files from Step {index}
                        </label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='h-4 w-4 text-orange-500' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='max-w-xs text-sm'>
                              When enabled, this step will automatically use the
                              same content files as the previous step,
                              eliminating the need to manually select files
                              again.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  {!step.usePreviousStepFiles && (
                    <MultiSelect
                      options={getAvailableFiles()}
                      selectedValues={getSelectedFileIds('files')}
                      onSelectionChange={(fileIds) =>
                        handleFileSelect(fileIds, 'files')
                      }
                      placeholder='Add content files'
                    />
                  )}

                  {step.usePreviousStepFiles && (
                    <div className='rounded-md border border-orange-200 bg-orange-100 p-3'>
                      <p className='text-sm font-medium text-orange-700'>
                        🔗 Using files from Step {index}
                      </p>
                      <p className='mt-1 text-xs text-orange-600'>
                        Files will be automatically inherited from the previous
                        step during execution.
                      </p>
                    </div>
                  )}

                  {!step.usePreviousStepFiles &&
                    step.files &&
                    step.files.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex flex-wrap gap-2'>
                          {step.files.map((file) => (
                            <Badge
                              key={file.id}
                              variant='secondary'
                              className='flex items-center gap-1 border-green-200 bg-green-50 px-2 py-1 text-green-700'
                            >
                              <FileText className='h-3 w-3' />
                              <span className='text-xs'>{file.name}</span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleFileRemove(file.id, 'files')
                                }
                                className='h-4 w-4 p-0 hover:bg-green-200'
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Files for Embedding Search */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center justify-between gap-2 text-sm font-medium'>
                    <div className='flex items-center gap-2'>
                      <Database className='h-4 w-4 text-blue-500' />
                      Embedding Files
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='h-3 w-3 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='max-w-xs text-sm'>
                              Files that will be searched using semantic
                              similarity to find relevant context snippets.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-5 w-5 p-0 text-muted-foreground transition-colors hover:text-primary'
                          aria-label='Embedding settings'
                        >
                          <Settings className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align='start'
                        side='right'
                        sideOffset={8}
                        className='w-auto p-0'
                      >
                        <WorkflowEmbeddingSettings
                          step={step}
                          onChange={onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {/* Use Previous Step Embeddings Toggle */}
                  {index > 0 && (
                    <div className='flex items-center justify-between rounded-md border border-dashed border-blue-200 bg-blue-50 p-3'>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={`use-previous-embeddings-${index}`}
                          checked={step.usePreviousStepEmbeddings || false}
                          onChange={(e) =>
                            onChange(
                              'usePreviousStepEmbeddings',
                              e.target.checked
                            )
                          }
                          className='rounded border-blue-300 text-blue-600 focus:ring-blue-500'
                        />
                        <label
                          htmlFor={`use-previous-embeddings-${index}`}
                          className='text-sm font-medium text-blue-700'
                        >
                          Use same embeddings from Step {index}
                        </label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='h-4 w-4 text-blue-500' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='max-w-xs text-sm'>
                              When enabled, this step will automatically use the
                              same embedding files as the previous step for
                              semantic search.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {!step.usePreviousStepEmbeddings && (
                    <MultiSelect
                      options={getAvailableFiles()}
                      selectedValues={getSelectedFileIds('embeddings')}
                      onSelectionChange={(fileIds) =>
                        handleFileSelect(fileIds, 'embeddings')
                      }
                      placeholder='Add embedding files'
                    />
                  )}

                  {step.usePreviousStepEmbeddings && (
                    <div className='rounded-md border border-blue-200 bg-blue-100 p-3'>
                      <p className='text-sm font-medium text-blue-700'>
                        🔗 Using embeddings from Step {index}
                      </p>
                      <p className='mt-1 text-xs text-blue-600'>
                        Embedding files will be automatically inherited from the
                        previous step during execution.
                      </p>
                    </div>
                  )}

                  {!step.usePreviousStepEmbeddings &&
                    step.embeddings &&
                    step.embeddings.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex flex-wrap gap-2'>
                          {step.embeddings.map((file) => (
                            <Badge
                              key={file.id}
                              variant='secondary'
                              className='flex items-center gap-1 border-blue-200 bg-blue-50 px-2 py-1 text-blue-700'
                            >
                              <Database className='h-3 w-3' />
                              <span className='text-xs'>{file.name}</span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleFileRemove(file.id, 'embeddings')
                                }
                                className='h-4 w-4 p-0 hover:bg-blue-200'
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* LLM Selection */}
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
                  <SelectItem value='none'>None (Use default)</SelectItem>
                  {llms.map((llm) => (
                    <SelectItem key={llm.id} value={llm.id.toString()}>
                      {llm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error?.llm && touched?.llm && (
                <p className='mt-1 text-xs text-red-500'>
                  {error.llm as string}
                </p>
              )}
            </div>

            <hr className='my-4' />

            {/* Temperature Slider */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor={`temperature-slider-${index}`}
                  className='text-sm font-medium'
                >
                  Temperature
                </Label>
                <div className='flex items-center gap-2'>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getTemperatureColor(
                      temperature
                    )}`}
                  >
                    {temperature.toFixed(1)}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='max-w-xs text-sm'>
                          Temperature controls how creative or focused the AI
                          responses are. Lower values (0.1-0.3) make responses
                          more consistent and factual, while higher values
                          (0.7-1.0) make them more creative and varied.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Slider
                id={`temperature-slider-${index}`}
                min={0.1}
                max={1.0}
                step={0.1}
                value={[temperature]}
                onValueChange={(values) =>
                  handleSliderChange('temperature', values)
                }
                className='w-full'
              />
              <p className='text-xs text-muted-foreground'>
                {getTemperatureDescription(temperature)}
              </p>
            </div>

            {/* Max Tokens Slider */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor={`max-tokens-slider-${index}`}
                  className='text-sm font-medium'
                >
                  Max Tokens
                </Label>
                <div className='flex items-center gap-2'>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getMaxTokensColor(
                      maxTokens
                    )}`}
                  >
                    {maxTokens.toLocaleString()}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className='h-4 w-4 text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='max-w-xs text-sm'>
                          Maximum tokens controls the length of the AI response.
                          Higher values allow for longer responses but consume
                          more tokens.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Slider
                id={`max-tokens-slider-${index}`}
                min={100}
                max={8000}
                step={100}
                value={[maxTokens]}
                onValueChange={(values) =>
                  handleSliderChange('maxTokens', values)
                }
                className='w-full'
              />
              <p className='text-xs text-muted-foreground'>
                {getMaxTokensDescription(maxTokens)}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
