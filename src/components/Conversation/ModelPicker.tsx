import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  toggleDropdown,
  updateSelectedModel,
} from '../../redux/conversationSlice'
import { AppDispatch, RootState } from '../../redux/store'
import { getAvailableModels } from '../../redux/asyncThunks/conversation'
import { LLMModel } from '@/redux/types/conversation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Box, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const ModelPicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch()
  const selectedModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
  )
  const models = useSelector(
    (state: RootState) => state.conversation.availableModels
  )
  const loading = useSelector((state: RootState) => state.conversation.loading)
  const error = useSelector((state: RootState) => state.conversation.error)
  const [providerFilter, setProviderFilter] = useState<string>('all')

  useEffect(() => {
    dispatch(getAvailableModels())
  }, [dispatch])

  const handleModelSelect = (llmId: number) => {
    dispatch(updateSelectedModel(llmId))
    dispatch(toggleDropdown())
  }

  const getModelButtonText = () => {
    const model = models.find((m: LLMModel) => m.id === selectedModel)
    return model ? model.name : 'Select Model'
  }
  const hasModels = Array.isArray(models) && models.length > 0

  const uniqueProviders = hasModels
    ? Array.from(new Set(models.map((model) => model.provider)))
    : []

  const filteredModels =
    providerFilter === 'all'
      ? models
      : models.filter((model) => model.provider === providerFilter)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='dark:bg-dark-chat-history flex h-10 border-gray-200 bg-white px-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-dark-icon-unselected dark:text-white dark:hover:bg-dark-icon-unselected'>
          <Box className='h-2 w-4' />
          {getModelButtonText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='max-h-[70vh] min-h-[20vh] w-72 overflow-y-auto rounded-md border-border bg-popover p-2 shadow-lg'
      >
        {loading && (
          <p className='py-2 text-center text-gray-500 dark:text-gray-400'>
            Loading models...
          </p>
        )}
        {error && (
          <p className='py-2 text-center text-red-500 dark:text-red-400'>
            Error loading models: {error}
          </p>
        )}

        {!loading && !error && hasModels && (
          <>
            <div className='mb-2 px-2 py-2'>
              <h4 className='mb-2.5 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Filter by provider:
              </h4>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className={`rounded-md px-4 py-1 text-sm font-medium transition-all ${
                    providerFilter === 'all'
                      ? 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setProviderFilter('all')}
                >
                  All
                </Button>
                {uniqueProviders.map((provider) => (
                  <Button
                    key={provider}
                    variant='outline'
                    size='sm'
                    className={`rounded-md px-4 py-1 text-sm font-medium capitalize transition-all ${
                      providerFilter === provider
                        ? 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setProviderFilter(provider)}
                  >
                    {provider}
                  </Button>
                ))}
              </div>
            </div>
            <DropdownMenuSeparator className='my-1 dark:border-gray-700' />
          </>
        )}

        {!loading &&
          !error &&
          hasModels &&
          filteredModels.length > 0 &&
          filteredModels.map((model: LLMModel) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`mt-1 cursor-pointer rounded-md p-3 ${
                model.id === selectedModel
                  ? 'bg-pink-50 dark:bg-pink-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              <div className='flex flex-col'>
                <span
                  className={`font-medium ${model.id === selectedModel ? 'font-semibold' : ''}`}
                >
                  {model.name}
                </span>
                <span className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  {model.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        {!loading && !error && hasModels && filteredModels.length === 0 && (
          <p className='py-2 text-center text-gray-500 dark:text-gray-400'>
            No models match the filter.
          </p>
        )}

        {!loading && !error && !hasModels && (
          <p className='py-2 text-center text-muted-foreground'>
            No models available
          </p>
        )}
        <DropdownMenuSeparator className='dark:border-gray-700' />
        <DropdownMenuItem
          asChild
          className='cursor-pointer rounded px-4 py-2 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10'
        >
          <Link to='/help' className='flex items-center'>
            <HelpCircle className='mr-2 h-4 w-4' />
            Model Information
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModelPicker
