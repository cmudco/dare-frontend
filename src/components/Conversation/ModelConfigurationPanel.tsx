import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateTemperature,
  updateMaxTokens,
} from '../../redux/conversationSlice'
import { Slider } from '../ui/slider'
import { Settings } from 'lucide-react'
import { MODEL_CONFIG } from '../../config/modelConfig'
import { clearConversationSettings } from '@/utils/localStorage'
import {
  getTemperatureColor,
  getTemperatureDescription,
  getMaxTokensColor,
  getMaxTokensDescription,
} from '@/utils/modelConfigUtils'

const ModelConfigurationPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )

  const temperature = useSelector(
    (state: RootState) =>
      state.conversation.temperature ?? MODEL_CONFIG.temperature
  )

  const maxTokens = useSelector(
    (state: RootState) => state.conversation.maxTokens ?? MODEL_CONFIG.maxTokens
  )

  const handleTemperatureChange = (values: number[]) => {
    dispatch(updateTemperature(values[0]))
  }

  const handleMaxTokensChange = (values: number[]) => {
    dispatch(updateMaxTokens(values[0]))
  }

  const resetToDefaults = () => {
    if (activeConversation?.conversationId) {
      clearConversationSettings(activeConversation.conversationId)
      dispatch(updateTemperature(MODEL_CONFIG.temperature))
      dispatch(updateMaxTokens(MODEL_CONFIG.maxTokens))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='h-9 w-9 p-0 hover:bg-gray-200'>
          <Settings className='h-5 w-5 text-gray-600' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-4'>
        <div className='flex flex-col justify-center gap-4'>
          {activeConversation?.conversationId && (
            <div className='flex items-center justify-between border-b pb-2'>
              <h3 className='font-medium'>Configuration</h3>
              <Button size='sm' onClick={resetToDefaults} className='text-xs'>
                Reset to Defaults
              </Button>
            </div>
          )}

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Temperature</h4>
              <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm'>
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

            <div className='flex justify-between px-1 text-xs text-gray-500'>
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>

            <div className={`mt-2 text-sm ${getTemperatureColor(temperature)}`}>
              {getTemperatureDescription(temperature)}
            </div>
          </div>

          <div className='space-y-4 border-t pt-2'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Max Tokens</h4>
              <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm'>
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

            <div className={`mt-2 text-sm ${getMaxTokensColor(maxTokens)}`}>
              {getMaxTokensDescription(maxTokens)}
            </div>
          </div>

          {activeConversation?.conversationId && (
            <p className='mt-2 border-t pt-2 text-xs text-gray-500'>
              These settings are specific to this conversation and will be
              remembered when you return.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ModelConfigurationPanel
