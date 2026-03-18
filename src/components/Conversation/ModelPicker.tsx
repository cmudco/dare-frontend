import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '../../redux/store'
import {
  toggleDropdown,
  updateSelectedModel,
} from '../../redux/conversationSlice'
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
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Box,
  Check,
  ChevronDown,
  Crown,
  HelpCircle,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import {
  ModelTier,
  ModelTierLabels,
  ModelTierColors,
  ModelTierOrder,
} from '@/utils/constants/model'

const tierIcons = {
  [ModelTier.Premium]: Crown,
  [ModelTier.Standard]: Sparkles,
  [ModelTier.Economy]: Zap,
}

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
  const [expandedTiers, setExpandedTiers] = useState<Set<ModelTier>>(new Set())

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

  const selectedModelData = useMemo(
    () => models.find((m: LLMModel) => m.id === selectedModel),
    [models, selectedModel]
  )

  const hasModels = Array.isArray(models) && models.length > 0

  const uniqueProviders = hasModels
    ? Array.from(new Set(models.map((model) => model.provider)))
    : []

  const filteredModels =
    providerFilter === 'all'
      ? models
      : models.filter((model) => model.provider === providerFilter)

  const toggleTier = (tier: ModelTier) => {
    setExpandedTiers((prev) => {
      const next = new Set(prev)
      if (next.has(tier)) {
        next.delete(tier)
      } else {
        next.add(tier)
      }
      return next
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setExpandedTiers(new Set())
    }
  }

  const tierGroups = useMemo(() => {
    return ModelTierOrder.map((tier) => ({
      tier,
      models: filteredModels.filter((model) => model.tier === tier),
    })).filter((group) => group.models.length > 0)
  }, [filteredModels])

  return (
    <TooltipProvider>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='group flex h-9 items-center gap-2 px-3 hover:bg-gray-200 dark:hover:bg-white/10'
          >
            <Box className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white' />
            <span className='max-w-[140px] truncate text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'>
              {selectedModelData?.name || 'Select Model'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='max-h-[70vh] min-h-[20vh] w-80 overflow-y-auto rounded-lg border-border bg-popover p-0 shadow-xl'
        >
          {loading && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              Loading models...
            </p>
          )}
          {error && (
            <p className='py-6 text-center text-sm text-red-500 dark:text-red-400'>
              Error loading models: {error}
            </p>
          )}

          {!loading && !error && hasModels && (
            <>
              {user?.modelGroup && (
                <div className='border-b border-border px-3 py-2'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                      {user.modelGroup.name}
                    </span>
                    {user.modelGroup.description && (
                      <span className='text-xs text-muted-foreground'>
                        {user.modelGroup.description}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Provider filter */}
              <div className='border-b border-border px-3 py-2.5'>
                <div className='mb-2 flex items-center gap-1.5'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Provider
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3 w-3 cursor-help text-muted-foreground/60' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>
                          {TOOLTIP_CONTENT.modelPicker.provider.title}
                        </p>
                        <p className='text-sm'>
                          {TOOLTIP_CONTENT.modelPicker.provider.description}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  <button
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      providerFilter === 'all'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                    onClick={() => setProviderFilter('all')}
                  >
                    All
                  </button>
                  {uniqueProviders.map((provider) => (
                    <button
                      key={provider}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                        providerFilter === provider
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                      onClick={() => setProviderFilter(provider)}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier-grouped models */}
              <div className='py-1'>
                {tierGroups.map((group, groupIndex) => {
                  const TierIcon = tierIcons[group.tier]
                  const colors = ModelTierColors[group.tier]

                  return (
                    <div key={group.tier}>
                      {groupIndex > 0 && (
                        <DropdownMenuSeparator className='my-1' />
                      )}
                      {/* Tier header — clickable to collapse/expand */}
                      <button
                        type='button'
                        onClick={() => toggleTier(group.tier)}
                        className='flex w-full items-center gap-2 px-3 py-1.5 transition-colors hover:bg-accent/30'
                      >
                        <TierIcon className={`h-3 w-3 ${colors.icon}`} />
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}
                        >
                          {ModelTierLabels[group.tier]}
                        </span>
                        <Badge
                          variant='outline'
                          className={`ml-auto h-4 px-1.5 text-[10px] font-normal ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {group.models.length}
                        </Badge>
                        <ChevronDown
                          className={`h-3 w-3 text-muted-foreground transition-transform ${
                            expandedTiers.has(group.tier) ? '' : '-rotate-90'
                          }`}
                        />
                      </button>

                      {/* Model items — hidden by default, shown when expanded */}
                      {expandedTiers.has(group.tier) &&
                        group.models.map((model) => {
                          const isSelected = model.id === selectedModel
                          return (
                            <DropdownMenuItem
                              key={model.id}
                              onClick={() => handleModelSelect(model.id)}
                              className={`mx-1 cursor-pointer rounded-md px-3 py-2.5 transition-colors ${
                                isSelected
                                  ? `${colors.bg} ring-1 ${colors.ring}`
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <div className='flex w-full items-center gap-2'>
                                <div className='min-w-0 flex-1'>
                                  <div className='flex items-center gap-2'>
                                    <span
                                      className={`truncate text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}
                                    >
                                      {model.name}
                                    </span>
                                    {model.isReasoning && (
                                      <Badge
                                        variant='outline'
                                        className='h-4 shrink-0 border-purple-200 bg-purple-50 px-1 text-[10px] text-purple-600 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400'
                                      >
                                        Reasoning
                                      </Badge>
                                    )}
                                  </div>
                                  {model.description && (
                                    <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                                      {model.description}
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className='h-4 w-4 shrink-0 text-foreground' />
                                )}
                              </div>
                            </DropdownMenuItem>
                          )
                        })}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {!loading && !error && hasModels && filteredModels.length === 0 && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No models match the filter.
            </p>
          )}

          {!loading && !error && !hasModels && (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              No models available
            </p>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className='mx-1 mb-1 cursor-pointer rounded-md px-3 py-2 text-muted-foreground hover:text-foreground'
          >
            <Link to='/help' className='flex items-center'>
              <HelpCircle className='mr-2 h-4 w-4' />
              <span className='text-sm'>Model Information</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

export default ModelPicker
