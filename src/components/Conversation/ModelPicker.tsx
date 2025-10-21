import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  toggleDropdown,
  updateSelectedModel,
} from '../../redux/conversationSlice'
import { AppDispatch, RootState } from '../../redux/store'
import {
  getAvailableModels,
  getAllModels,
  updateConversation,
} from '../../redux/asyncThunks/conversation'
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
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const loading = useSelector((state: RootState) => state.conversation.loading)
  const error = useSelector((state: RootState) => state.conversation.error)
  const user = useSelector((state: RootState) => state.user.user)
  const [providerFilter, setProviderFilter] = useState<string>('all')

  useEffect(() => {
    dispatch(getAvailableModels())
    dispatch(getAllModels())
  }, [dispatch])

  const handleModelSelect = (llmId: number) => {
    dispatch(updateSelectedModel(llmId))
    dispatch(toggleDropdown())

    if (activeConversation) {
      dispatch(
        updateConversation({
          conversationId: activeConversation.conversationId,
          updates: { selectedModel: llmId },
        })
      )
    }
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
        <Button
          variant='ghost'
          className='group flex h-9 items-center gap-2 px-3 hover:bg-gray-200 dark:hover:bg-white/10'
        >
          <Box className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white' />
          <span className='max-w-[120px] truncate text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'>
            {getModelButtonText()}
          </span>
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
            {user?.modelGroup && (
              <div className='mb-2 border-b border-border pb-2'>
                <div className='px-2 py-1'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                      {user.modelGroup.name}
                    </span>
                    {user.modelGroup.description && (
                      <span className='text-xs text-muted-foreground'>
                        {user.modelGroup.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                      : 'border-border bg-transparent text-muted-foreground hover:bg-blue-50 dark:hover:bg-primary/30 dark:hover:text-white'
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
                        : 'border-border bg-transparent text-muted-foreground hover:bg-blue-50 dark:hover:bg-primary/30 dark:hover:text-white'
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
