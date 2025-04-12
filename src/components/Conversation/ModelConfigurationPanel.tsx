import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { AppDispatch, RootState } from '../../redux/store'
import {
  updateTemperature,
  updateMaxTokens,
  updateMaxContextSnippets,
  updateDocumentSimilarityThreshold,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

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

  const maxContextSnippets = useSelector(
    (state: RootState) =>
      state.conversation.maxContextSnippets ?? MODEL_CONFIG.maxContextSnippets
  )

  const documentSimilarityThreshold = useSelector(
    (state: RootState) =>
      state.conversation.documentSimilarityThreshold ??
      MODEL_CONFIG.documentSimilarityThreshold
  )

  const handleTemperatureChange = (values: number[]) => {
    dispatch(updateTemperature(values[0]))
  }

  const handleMaxTokensChange = (values: number[]) => {
    dispatch(updateMaxTokens(values[0]))
  }

  const handleMaxContextSnippetsChange = (value: number) => {
    dispatch(updateMaxContextSnippets(value))
  }

  const handleDocumentSimilarityThresholdChange = (value: string) => {
    const threshold = parseFloat(value)
    dispatch(updateDocumentSimilarityThreshold(threshold))
  }

  const resetToDefaults = () => {
    if (activeConversation?.conversationId) {
      clearConversationSettings(activeConversation.conversationId)
      dispatch(updateTemperature(MODEL_CONFIG.temperature))
      dispatch(updateMaxTokens(MODEL_CONFIG.maxTokens))
      dispatch(updateMaxContextSnippets(MODEL_CONFIG.maxContextSnippets))
      dispatch(
        updateDocumentSimilarityThreshold(
          MODEL_CONFIG.documentSimilarityThreshold
        )
      )
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className='ml-4 flex h-12 w-12 items-center justify-center whitespace-nowrap rounded-lg py-0 font-normal normal-case'
          variant='outline'
        >
          <Settings className='!h-5 !w-5' />
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

          <hr />

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Max Context Snippets</h4>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    handleMaxContextSnippetsChange(
                      Math.max(1, maxContextSnippets - 1)
                    )
                  }
                >
                  -
                </Button>
                <span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-sm'>
                  {maxContextSnippets}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    handleMaxContextSnippetsChange(maxContextSnippets + 1)
                  }
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <hr />

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Document Similarity Threshold</h4>
            </div>
            <Select
              onValueChange={handleDocumentSimilarityThresholdChange}
              value={documentSimilarityThreshold.toString()}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select similarity threshold' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='0.2'>
                  Low (similarity score ≥ .20)
                </SelectItem>
                <SelectItem value='0.5'>
                  Medium (similarity score ≥ .50)
                </SelectItem>
                <SelectItem value='0.8'>
                  High (similarity score ≥ .80)
                </SelectItem>
              </SelectContent>
            </Select>
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
