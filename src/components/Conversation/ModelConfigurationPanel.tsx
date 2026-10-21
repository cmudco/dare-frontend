import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Info, Settings } from 'lucide-react'

import { MODEL_CONFIG } from '@/config/modelConfig'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import {
  getActiveModels,
  updateConversation,
} from '@/redux/asyncThunks/conversation'
import {
  updateAudioTranscriptionEnabled,
  updateImageGenerationEnabled,
  updateModelSettings,
  updateSelectedModel,
} from '@/redux/conversationSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { ModelSettings } from '@/redux/types/conversation'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Switch } from '../ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import ModelSettingsFields from './ModelSettingsFields'
import { defaultMaxTokensFor } from '@/utils/modelConfigUtils'

const ModelConfigurationPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const enableImageGeneration = useFeatureFlag('enableImageGeneration')
  const enableAudioTranscription = useFeatureFlag('enableAudioTranscription')

  const defaultWebSearch = useSelector(
    (state: RootState) => state.conversation.webSearchEnabled
  )
  const defaultWebFetch = useSelector(
    (state: RootState) => state.conversation.webFetchEnabled
  )
  const defaultCodeSandbox = useSelector(
    (state: RootState) => state.conversation.codeSandboxEnabled
  )
  const defaultArtifacts = useSelector(
    (state: RootState) => state.conversation.artifactsEnabled
  )
  const settings: ModelSettings = {
    temperature: activeConversation?.temperature ?? MODEL_CONFIG.temperature,
    effort: activeConversation?.effort ?? null,
    maxTokens: activeConversation?.maxTokens ?? MODEL_CONFIG.maxTokens,
    historyLimit: activeConversation?.historyLimit ?? MODEL_CONFIG.historyLimit,
    webSearchEnabled: activeConversation?.webSearchEnabled ?? defaultWebSearch,
    webFetchEnabled: activeConversation?.webFetchEnabled ?? defaultWebFetch,
    codeSandboxEnabled:
      activeConversation?.codeSandboxEnabled ?? defaultCodeSandbox,
    artifactsEnabled: activeConversation?.artifactsEnabled ?? defaultArtifacts,
  }
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
  const allModels = useSelector(
    (state: RootState) => state.conversation.activeModels
  )
  const messageCount = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages.length
  )
  const walletMeta = useSelector(
    (state: RootState) => state.conversation.activeWalletMeta
  )
  const selectedEntry = useSelector((state: RootState) =>
    state.conversation.pickerEntries.find(
      (entry) => entry.id === state.conversation.selectedModel
    )
  )

  React.useEffect(() => {
    if (allModels.length === 0) {
      dispatch(getActiveModels())
    }
  }, [allModels.length, dispatch])
  const showImageGeneration = walletMeta?.supportsImageGeneration ?? true
  const showAudioTranscription = walletMeta?.supportsAudioTranscription ?? true
  const usesAdaptiveThinking = selectedEntry?.supportsAdaptiveThinking ?? false
  const automaticDefaultKeyRef = React.useRef<string | null>(null)

  const applySettings = (patch: Partial<ModelSettings>) => {
    dispatch(updateModelSettings(patch))
    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: patch,
        })
      )
    }
  }

  React.useEffect(() => {
    const selectionKey = `${activeConversation?.conversationId ?? 'none'}:${selectedEntry?.id ?? 'none'}`
    if (automaticDefaultKeyRef.current === selectionKey) return
    automaticDefaultKeyRef.current = selectionKey

    if (
      activeConversation &&
      usesAdaptiveThinking &&
      messageCount === 0 &&
      activeConversation.maxTokens <= MODEL_CONFIG.maxTokens
    ) {
      dispatch(
        updateModelSettings({
          maxTokens: MODEL_CONFIG.adaptiveThinkingMaxTokens,
        })
      )
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { maxTokens: MODEL_CONFIG.adaptiveThinkingMaxTokens },
        })
      )
    }
  }, [
    activeConversation,
    dispatch,
    messageCount,
    selectedEntry?.id,
    usesAdaptiveThinking,
  ])

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
        dispatch(updateSelectedModel(String(dalleModel.id)))
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
        dispatch(updateSelectedModel(String(transcriberModel.id)))
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

  const resetToDefaults = () => {
    if (!activeConversation) return
    const defaults: ModelSettings = {
      temperature: MODEL_CONFIG.temperature,
      effort: null,
      maxTokens: defaultMaxTokensFor(selectedEntry),
      historyLimit: MODEL_CONFIG.historyLimit,
      webSearchEnabled: false,
      webFetchEnabled: false,
      codeSandboxEnabled: false,
      artifactsEnabled: false,
    }
    dispatch(updateModelSettings(defaults))
    dispatch(updateImageGenerationEnabled(false))
    dispatch(updateAudioTranscriptionEnabled(false))
    dispatch(
      updateConversation({
        conversationId: activeConversation.conversationId,
        updates: {
          ...defaults,
          imageGenerationEnabled: false,
          audioTranscriptionEnabled: false,
        },
      })
    )
  }

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            data-tour='model-config'
            variant='ghost'
            className='h-9 w-9 p-0 hover:bg-accent'
          >
            <Settings className='h-5 w-5 text-muted-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={8}
          className='max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-1rem)] touch-pan-y touch-pinch-zoom [scrollbar-gutter:stable] overflow-x-hidden overflow-y-auto overscroll-contain border border-border bg-popover p-4'
        >
          <div className='flex flex-col justify-center gap-4 text-foreground'>
            {activeConversation?.conversationId && (
              <div className='flex items-center justify-between border-b border-border pb-2'>
                <h3 className='font-medium text-foreground'>Configuration</h3>
                <Button
                  size='sm'
                  onClick={resetToDefaults}
                  className='bg-primary text-xs text-primary-foreground hover:bg-primary/90'
                >
                  Reset to Defaults
                </Button>
              </div>
            )}

            <ModelSettingsFields
              settings={settings}
              onChange={applySettings}
              model={selectedEntry}
              walletMeta={walletMeta}
              extraToggles={
                <>
                  {/* Image Generation Toggle - Only show in Georgia Tech and Development */}
                  {enableImageGeneration && showImageGeneration && (
                    <div className='flex items-center justify-between border-b border-border pb-2'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium text-foreground'>
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
                                  {
                                    TOOLTIP_CONTENT.modelConfig.imageGeneration
                                      .tip
                                  }
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Switch
                        checked={imageGenerationEnabled}
                        onCheckedChange={handleImageGenerationToggle}
                      />
                    </div>
                  )}

                  {/* Audio Transcription Toggle - Only show when feature enabled */}
                  {enableAudioTranscription && showAudioTranscription && (
                    <div className='flex items-center justify-between border-b border-border pb-2'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2'>
                          <h4
                            className={
                              audioTranscriptionEnabled
                                ? 'bg-linear-to-r from-purple-600 via-violet-500 to-indigo-600 bg-clip-text font-medium text-transparent'
                                : 'font-medium text-foreground'
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
                                <p className='font-semibold'>
                                  Audio Transcription
                                </p>
                                <p className='text-sm'>
                                  Convert audio files to text using Whisper or
                                  Gemini models.
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  💡 Upload audio files in Media tab when
                                  enabled
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Switch
                        checked={audioTranscriptionEnabled}
                        onCheckedChange={handleAudioTranscriptionToggle}
                      />
                    </div>
                  )}
                </>
              }
            />

            {activeConversation?.conversationId && (
              <p className='mt-2 border-t border-border pt-2 text-xs text-muted-foreground'>
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
