import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateTemperature,
  updateMaxTokens,
  updateHistoryLimit,
  updateWebSearchEnabled,
  updateImageGenerationEnabled,
  updateAudioTranscriptionEnabled,
  updateArtifactsEnabled,
  updateSelectedModel,
} from '../../redux/conversationSlice'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Settings, Info } from 'lucide-react'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { updateConversation } from '@/redux/asyncThunks/conversation'
import { features } from '@/config/environment'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'

const ModelConfigurationPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )

  const temperature =
    activeConversation?.temperature ?? MODEL_CONFIG.temperature
  const maxTokens = activeConversation?.maxTokens ?? MODEL_CONFIG.maxTokens
  const historyLimit =
    activeConversation?.historyLimit ?? MODEL_CONFIG.historyLimit
  const webSearchEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.webSearchEnabled ??
      state.conversation.webSearchEnabled
  )
  const imageGenerationEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.imageGenerationEnabled ??
      state.conversation.imageGenerationEnabled
  )
  const audioTranscriptionEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.audioTranscriptionEnabled ??
      state.conversation.audioTranscriptionEnabled
  )
  const artifactsEnabled = useSelector(
    (state: RootState) =>
      activeConversation?.artifactsEnabled ??
      state.conversation.artifactsEnabled
  )
  const allModels = useSelector(
    (state: RootState) => state.conversation.allModels
  )

  const handleTemperatureChange = (values: number[]) => {
    dispatch(updateTemperature(values[0]))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { temperature: values[0] },
        })
      )
    }
  }

  const handleMaxTokensChange = (values: number[]) => {
    dispatch(updateMaxTokens(values[0]))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { maxTokens: values[0] },
        })
      )
    }
  }

  const handleHistoryLimitChange = (values: number[]) => {
    dispatch(updateHistoryLimit(values[0]))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { historyLimit: values[0] },
        })
      )
    }
  }

  const handleWebSearchToggle = (checked: boolean) => {
    dispatch(updateWebSearchEnabled(checked))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { webSearchEnabled: checked },
        })
      )
    }
  }

  const handleImageGenerationToggle = (checked: boolean) => {
    dispatch(updateImageGenerationEnabled(checked))

    // Auto-select DALL-E model when enabled
    if (checked) {
      const dalleModel =
        allModels.find(
          (model) =>
            model.identifier === 'dall-e-3' ||
            model.name.toLowerCase().includes('dall-e-3')
        ) ||
        allModels.find(
          (model) =>
            model.identifier === 'dall-e-2' ||
            model.name.toLowerCase().includes('dall-e-2')
        )

      if (dalleModel) {
        dispatch(updateSelectedModel(dalleModel.id))
      }
    }

    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { imageGenerationEnabled: checked },
        })
      )
    }
  }

  const handleAudioTranscriptionToggle = (checked: boolean) => {
    dispatch(updateAudioTranscriptionEnabled(checked))

    // Auto-select Whisper or Gemini model when enabled
    if (checked) {
      const transcriberModel =
        allModels.find(
          (model) =>
            model.identifier === 'whisper-1' ||
            model.name.toLowerCase().includes('whisper')
        ) || allModels.find((model) => model.isAudioTranscriber)

      if (transcriberModel) {
        dispatch(updateSelectedModel(transcriberModel.id))
      }
    }

    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { audioTranscriptionEnabled: checked },
        })
      )
    }
  }

  const handleArtifactsToggle = (checked: boolean) => {
    dispatch(updateArtifactsEnabled(checked))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { artifactsEnabled: checked },
        })
      )
    }
  }

  const resetToDefaults = () => {
    if (activeConversation) {
      dispatch(updateTemperature(MODEL_CONFIG.temperature))
      dispatch(updateMaxTokens(MODEL_CONFIG.maxTokens))
      dispatch(updateHistoryLimit(MODEL_CONFIG.historyLimit))
      dispatch(updateWebSearchEnabled(false))
      dispatch(updateImageGenerationEnabled(false))
      dispatch(updateAudioTranscriptionEnabled(false))
      dispatch(updateArtifactsEnabled(false))

      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: {
            temperature: MODEL_CONFIG.temperature,
            maxTokens: MODEL_CONFIG.maxTokens,
            historyLimit: MODEL_CONFIG.historyLimit,
            webSearchEnabled: false,
            imageGenerationEnabled: false,
            audioTranscriptionEnabled: false,
            artifactsEnabled: false,
          },
        })
      )
    }
  }

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            className='h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-white/10'
          >
            <Settings className='h-5 w-5 text-gray-600 dark:text-gray-300' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 border border-border bg-popover p-4'>
          <div className='flex flex-col justify-center gap-4 text-gray-900 dark:text-white'>
            {activeConversation?.conversationId && (
              <div className='flex items-center justify-between border-b pb-2 dark:border-dark-icon-unselected'>
                <h3 className='font-medium dark:text-white'>Configuration</h3>
                <Button
                  size='sm'
                  onClick={resetToDefaults}
                  className='text-xs dark:bg-dark-button-primary dark:text-white dark:hover:bg-dark-button-primary/80'
                >
                  Reset to Defaults
                </Button>
              </div>
            )}

            <div className='space-y-4'>
              {/* Web Search Toggle */}
              <div className='flex items-center justify-between border-b pb-2 dark:border-dark-icon-unselected'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-medium dark:text-white'>Web Search</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <div className='space-y-2'>
                          <p className='font-semibold'>
                            {TOOLTIP_CONTENT.modelConfig.webSearch.title}
                          </p>
                          <p className='text-sm'>
                            {TOOLTIP_CONTENT.modelConfig.webSearch.description}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            💡 {TOOLTIP_CONTENT.modelConfig.webSearch.tip}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Enable real-time web search for up-to-date information
                  </p>
                </div>
                <Switch
                  checked={webSearchEnabled}
                  onCheckedChange={handleWebSearchToggle}
                />
              </div>

              {/* Image Generation Toggle - Only show in Georgia Tech and Development */}
              {features.enableImageGeneration && (
                <div className='flex items-center justify-between border-b pb-2 dark:border-dark-icon-unselected'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-medium dark:text-white'>
                        Image Generation
                      </h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <div className='space-y-2'>
                            <p className='font-semibold'>
                              {
                                TOOLTIP_CONTENT.modelConfig.imageGeneration
                                  .title
                              }
                            </p>
                            <p className='text-sm'>
                              {
                                TOOLTIP_CONTENT.modelConfig.imageGeneration
                                  .description
                              }
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              💡{' '}
                              {TOOLTIP_CONTENT.modelConfig.imageGeneration.tip}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Enable AI image generation with DALL-E models
                    </p>
                  </div>
                  <Switch
                    checked={imageGenerationEnabled}
                    onCheckedChange={handleImageGenerationToggle}
                  />
                </div>
              )}

              {/* Audio Transcription Toggle - Only show when feature enabled */}
              {features.enableAudioTranscription && (
                <div className='flex items-center justify-between border-b pb-2 dark:border-dark-icon-unselected'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <h4
                        className={
                          audioTranscriptionEnabled
                            ? 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 bg-clip-text font-medium text-transparent'
                            : 'font-medium dark:text-white'
                        }
                      >
                        Audio Transcription
                      </h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <div className='space-y-2'>
                            <p className='font-semibold'>Audio Transcription</p>
                            <p className='text-sm'>
                              Convert audio files to text using Whisper or
                              Gemini models.
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              💡 Upload audio files in Media tab when enabled
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Enable audio-to-text transcription with Whisper/Gemini
                    </p>
                  </div>
                  <Switch
                    checked={audioTranscriptionEnabled}
                    onCheckedChange={handleAudioTranscriptionToggle}
                  />
                </div>
              )}

              {/* Artifacts Toggle - Only show when feature enabled */}
              {features.enableArtifacts && (
                <div className='flex items-center justify-between border-b pb-2 dark:border-dark-icon-unselected'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <h4
                        className={
                          artifactsEnabled
                            ? 'bg-gradient-to-r from-[#f7931e] via-[#8b5cf6] to-[#00c2ff] bg-clip-text font-medium text-transparent'
                            : 'font-medium dark:text-white'
                        }
                      >
                        Artifacts
                      </h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <div className='space-y-2'>
                            <p className='font-semibold'>
                              {TOOLTIP_CONTENT.modelConfig.artifacts.title}
                            </p>
                            <p className='text-sm'>
                              {
                                TOOLTIP_CONTENT.modelConfig.artifacts
                                  .description
                              }
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              💡 {TOOLTIP_CONTENT.modelConfig.artifacts.tip}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <Switch
                    checked={artifactsEnabled}
                    onCheckedChange={handleArtifactsToggle}
                  />
                </div>
              )}
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-medium dark:text-white'>Temperature</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.modelConfig.temperature.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.modelConfig.temperature.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          💡 {TOOLTIP_CONTENT.modelConfig.temperature.tip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-black/20 dark:text-white'>
                  {temperature.toFixed(1)}
                </span>
              </div>

              <Slider
                value={[temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleTemperatureChange}
                className='my-4 cursor-pointer'
              />

              <div className='flex justify-between px-1 text-xs text-gray-500 dark:text-gray-400'>
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div className='space-y-4 border-t pt-2 dark:border-dark-icon-unselected'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-medium dark:text-white'>Max Tokens</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.modelConfig.maxTokens.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.modelConfig.maxTokens.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          💡 {TOOLTIP_CONTENT.modelConfig.maxTokens.tip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-black/20 dark:text-white'>
                  {maxTokens}
                </span>
              </div>

              <Slider
                value={[maxTokens]}
                min={1}
                max={8192}
                step={256}
                onValueChange={handleMaxTokensChange}
                className='my-4 cursor-pointer'
              />
            </div>

            <div className='space-y-4 border-t pt-2 dark:border-dark-icon-unselected'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-medium dark:text-white'>History Limit</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 cursor-help text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.modelConfig.historyLimit.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.modelConfig.historyLimit.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          💡 {TOOLTIP_CONTENT.modelConfig.historyLimit.tip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-black/20 dark:text-white'>
                  {historyLimit === 50 ? 'Full Context' : historyLimit}
                </span>
              </div>

              <Slider
                value={[historyLimit]}
                min={1}
                max={50}
                step={1}
                onValueChange={handleHistoryLimitChange}
                className='my-4 cursor-pointer'
              />

              <div className='flex justify-between px-1 text-xs text-gray-500 dark:text-gray-400'>
                <span>Minimal</span>
                <span>Standard</span>
                <span>Max</span>
              </div>
            </div>

            {activeConversation?.conversationId && (
              <p className='mt-2 border-t pt-2 text-xs text-gray-500 dark:border-dark-icon-unselected dark:text-gray-400'>
                These settings are specific to this conversation and will be
                remembered when you return.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

export default ModelConfigurationPanel
