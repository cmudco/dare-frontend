import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateTemperature,
  updateMaxTokens,
  updateHistoryLimit,
} from '../../redux/conversationSlice'
import { Slider } from '../ui/slider'
import { Settings } from 'lucide-react'
import { MODEL_CONFIG } from '../../config/modelConfig'
import {
  getTemperatureColor,
  getTemperatureDescription,
  getMaxTokensColor,
  getMaxTokensDescription,
  getHistoryLimitColor,
  getHistoryLimitDescription,
} from '@/utils/modelConfigUtils'
import { updateConversation } from '@/redux/asyncThunks/conversation'

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

  const resetToDefaults = () => {
    if (activeConversation) {
      dispatch(updateTemperature(MODEL_CONFIG.temperature))
      dispatch(updateMaxTokens(MODEL_CONFIG.maxTokens))
      dispatch(updateHistoryLimit(MODEL_CONFIG.historyLimit))

      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: {
            temperature: MODEL_CONFIG.temperature,
            maxTokens: MODEL_CONFIG.maxTokens,
            historyLimit: MODEL_CONFIG.historyLimit,
          },
        })
      )
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          className='absolute right-[10px] h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-white/10'
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
            <div className='flex items-center justify-between'>
              <h4 className='font-medium dark:text-white'>Temperature</h4>
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

            <div className={`mt-2 text-sm ${getTemperatureColor(temperature)}`}>
              {getTemperatureDescription(temperature)}
            </div>
          </div>

          <div className='space-y-4 border-t pt-2 dark:border-dark-icon-unselected'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium dark:text-white'>Max Tokens</h4>
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

            <div className={`mt-2 text-sm ${getMaxTokensColor(maxTokens)}`}>
              {getMaxTokensDescription(maxTokens)}
            </div>
          </div>

          <div className='space-y-4 border-t pt-2 dark:border-dark-icon-unselected'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium dark:text-white'>History Limit</h4>
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

            <div
              className={`mt-2 text-sm ${getHistoryLimitColor(historyLimit)}`}
            >
              {getHistoryLimitDescription(historyLimit)}
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
  )
}

export default ModelConfigurationPanel
