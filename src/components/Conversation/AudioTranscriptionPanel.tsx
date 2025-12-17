import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { RootState, AppDispatch } from '../../redux/store'
import { updateAudioTranscriptionSettings } from '../../redux/conversationSlice'
import { Mic } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  TRANSCRIPTION_LANGUAGES,
  TranscriptionModel,
  type LanguageCode,
  WHISPER_PRICING,
} from '@/utils/constants/audioTranscription'
import type { AudioTranscriptionSettings } from '@/redux/types/conversation'

const AudioTranscriptionPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reduxSettings = useSelector(
    (state: RootState) => state.conversation.audioTranscriptionSettings
  )

  const [settings, setSettings] =
    useState<AudioTranscriptionSettings>(reduxSettings)

  // Dispatch settings changes to Redux
  useEffect(() => {
    dispatch(updateAudioTranscriptionSettings(settings))
  }, [settings, dispatch])

  const handleLanguageChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      language: value as LanguageCode,
    }))
  }

  const handleModelChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      model: value as TranscriptionModel,
    }))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='dark:hover:bg-dare-gradient/90 group flex h-9 items-center gap-2 rounded-md bg-purple-50 px-3 hover:bg-purple-100 dark:bg-dare-gradient'
          title='Audio Transcription Settings'
        >
          <Mic className='h-5 w-5 text-gray-700 dark:text-white' />
          <span className='bg-dare-gradient bg-clip-text text-sm font-medium text-transparent dark:bg-none dark:text-white'>
            Transcription Settings
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-96 rounded-lg border-border bg-popover p-6 shadow-xl'
      >
        <div className='space-y-6'>
          {/* Header */}
          <div className='border-b border-border pb-4'>
            <h3 className='flex items-center gap-2 text-lg font-semibold'>
              <Mic className='h-5 w-5 text-gray-700 dark:text-white' />
              <span className='bg-dare-gradient bg-clip-text text-transparent dark:bg-none dark:text-white'>
                Whisper Transcription
              </span>
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Configure audio transcription parameters
            </p>
          </div>

          {/* Transcription Model */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Transcription Model
            </label>
            <Select value={settings.model} onValueChange={handleModelChange}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TranscriptionModel.WHISPER}>
                  <div className='flex flex-col items-start'>
                    <span className='font-medium'>Whisper-1</span>
                    <span className='text-xs text-muted-foreground'>
                      OpenAI's high-accuracy transcription model
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Language
            </label>
            <Select
              value={settings.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='max-h-80'>
                {TRANSCRIPTION_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{lang.name}</span>
                      {lang.code !== 'auto' && (
                        <span className='text-xs text-muted-foreground'>
                          ({lang.code})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              {settings.language === 'auto'
                ? 'Language will be automatically detected'
                : `Transcribe audio in ${TRANSCRIPTION_LANGUAGES.find((l) => l.code === settings.language)?.name}`}
            </p>
          </div>

          {/* Pricing Information */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <h4 className='mb-2 text-sm font-medium text-foreground'>
              Pricing
            </h4>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <div className='flex justify-between'>
                <span>Cost per minute:</span>
                <span className='font-medium text-foreground'>
                  ${WHISPER_PRICING.pricePerMinute.toFixed(3)}
                </span>
              </div>
              <p className='mt-2 text-xs italic'>
                Estimated cost will be shown after transcription completes
              </p>
            </div>
          </div>

          {/* Features */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <h4 className='mb-2 text-sm font-medium text-foreground'>
              Features
            </h4>
            <ul className='space-y-1 text-xs text-muted-foreground'>
              <li>✓ Support for 99+ languages</li>
              <li>✓ High accuracy transcription</li>
              <li>✓ Handles background noise</li>
              <li>✓ Audio files up to 100MB</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AudioTranscriptionPanel
