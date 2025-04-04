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
        <Button
          className='ml-4 flex justify-center items-center font-normal normal-case rounded-lg w-12 h-12 py-0 whitespace-nowrap'
          variant='outline'
        >
          <Settings className='!w-5 !h-5' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-4'>
        <div className='space-y-6'>
          {activeConversation?.conversationId && (
            <div className='flex justify-between items-center pb-2 border-b'>
              <h3 className='font-medium'>Model Configuration</h3>
              <Button size='sm' onClick={resetToDefaults} className='text-xs'>
                Reset to Defaults
              </Button>
            </div>
          )}

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h4 className='font-medium'>Temperature</h4>
              <span className='bg-gray-100 px-2 py-1 rounded-md text-sm font-mono'>
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

            <div className='flex justify-between text-xs text-gray-500 px-1'>
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>

            <div className={`mt-2 text-sm ${getTemperatureColor(temperature)}`}>
              {getTemperatureDescription(temperature)}
            </div>

            <p className='text-xs text-gray-500 mt-2'>
              Temperature controls randomness. Lower values are more
              deterministic, while higher values produce more varied responses.
              Settings are saved automatically.
            </p>
          </div>

          <div className='space-y-4 pt-2 border-t'>
            <div className='flex justify-between items-center'>
              <h4 className='font-medium'>Max Tokens</h4>
              <span className='bg-gray-100 px-2 py-1 rounded-md text-sm font-mono'>
                {maxTokens}
              </span>
            </div>

            <Slider
              value={[maxTokens]}
              min={256}
              max={8192}
              step={256}
              onValueChange={handleMaxTokensChange}
              className='my-4 cursor-pointer'
            />

                        <Slider
                            value={[maxTokens]}
                            min={1}
                            max={8192}
                            step={256}
                            onValueChange={handleMaxTokensChange}
                            className="my-4 cursor-pointer"
                        />

            <div className={`mt-2 text-sm ${getMaxTokensColor(maxTokens)}`}>
              {getMaxTokensDescription(maxTokens)}
            </div>

            <p className='text-xs text-gray-500 mt-2'>
              Max tokens controls the maximum length of the model's response.
              Higher values allow for longer, more detailed answers. Settings
              are saved automatically.
            </p>
          </div>

          {activeConversation?.conversationId && (
            <p className='text-xs text-gray-500 mt-2 pt-2 border-t'>
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
