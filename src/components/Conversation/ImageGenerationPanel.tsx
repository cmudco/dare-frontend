import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { RootState, AppDispatch } from '../../redux/store'
import { updateImageGenerationSettings } from '../../redux/conversationSlice'
import { Wand2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  IMAGE_SIZE_CONFIG,
  IMAGE_QUALITY_CONFIG,
  IMAGE_STYLE_CONFIG,
  calculateImageCost,
  type ImageSizeType,
  type ImageQualityType,
  type ImageStyleType,
} from '@/utils/constants/imageGeneration'
import type { ImageGenerationSettings } from '@/redux/types/conversation'

const ImageGenerationPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const reduxSettings = useSelector(
    (state: RootState) => state.conversation.imageGenerationSettings
  )

  const [settings, setSettings] =
    useState<ImageGenerationSettings>(reduxSettings)
  const [cost, setCost] = useState<number>(
    calculateImageCost(reduxSettings.size, reduxSettings.quality)
  )

  // Calculate cost whenever settings change
  useEffect(() => {
    const newCost = calculateImageCost(settings.size, settings.quality)
    setCost(newCost)
  }, [settings])

  // Dispatch settings changes to Redux
  useEffect(() => {
    dispatch(updateImageGenerationSettings(settings))
  }, [settings, dispatch])

  const handleSizeChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      size: value as ImageSizeType,
    }))
  }

  const handleQualityChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      quality: value as ImageQualityType,
    }))
  }

  const handleStyleChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      style: value as ImageStyleType,
    }))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='dark:hover:bg-dare-gradient/90 group flex h-9 items-center gap-2 rounded-md bg-sky-50 px-3 hover:bg-sky-100 dark:bg-dare-gradient'
          title='Image Generation Settings'
        >
          <Wand2 className='h-5 w-5 text-gray-700 dark:text-white' />
          <span className='bg-dare-gradient bg-clip-text text-sm font-medium text-transparent dark:bg-none dark:text-white'>
            Image Settings
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
              <Wand2 className='h-5 w-5 text-gray-700 dark:text-white' />
              <span className='bg-dare-gradient bg-clip-text text-transparent dark:bg-none dark:text-white'>
                DALL-E 3 Settings
              </span>
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Configure image generation parameters
            </p>
          </div>

          {/* Image Size */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Image Size
            </label>
            <Select value={settings.size} onValueChange={handleSizeChange}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMAGE_SIZE_CONFIG).map(([size, config]) => (
                  <SelectItem key={size} value={size}>
                    <div className='flex flex-col items-start'>
                      <span className='font-medium'>{config.label}</span>
                      <span className='text-xs text-muted-foreground'>
                        {config.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quality */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Quality
            </label>
            <Select
              value={settings.quality}
              onValueChange={handleQualityChange}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMAGE_QUALITY_CONFIG).map(
                  ([quality, config]) => (
                    <SelectItem key={quality} value={quality}>
                      <div className='flex flex-col items-start'>
                        <span className='font-medium'>{config.label}</span>
                        <span className='text-xs text-muted-foreground'>
                          {config.description}
                        </span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Style */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>Style</label>
            <Select value={settings.style} onValueChange={handleStyleChange}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMAGE_STYLE_CONFIG).map(([style, config]) => (
                  <SelectItem key={style} value={style}>
                    <div className='flex flex-col items-start'>
                      <span className='font-medium'>{config.label}</span>
                      <span className='text-xs text-muted-foreground'>
                        {config.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Estimation */}
          <div className='dark:bg-dare-gradient/10 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='bg-dare-gradient bg-clip-text text-sm font-medium text-transparent dark:bg-none dark:text-white'>
                  Estimated Cost
                </p>
                <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-300'>
                  Per image generated
                </p>
              </div>
              <div className='text-right'>
                <p className='bg-dare-gradient bg-clip-text text-2xl font-bold text-transparent dark:bg-none dark:text-white'>
                  ${cost.toFixed(2)}
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-300'>USD</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className='rounded-md bg-muted p-3'>
            <p className='text-xs text-muted-foreground'>
              <span className='font-medium'>Note:</span> Images are generated
              using DALL-E 3. Pricing is based on OpenAI's current rates and may
              change.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ImageGenerationPanel
