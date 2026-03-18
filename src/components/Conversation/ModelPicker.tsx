import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { updateSelectedModel } from '../../redux/conversationSlice'
import {
  getAvailableModels,
  getAllModels,
  updateConversation,
} from '../../redux/asyncThunks/conversation'
import { LLMModel } from '@/redux/types/conversation'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import {
  Box,
  Check,
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
import { motion, AnimatePresence } from 'framer-motion'

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

  // We use our own state for Popover to allow full layout control, but sync with Redux if needed.
  const [open, setOpen] = useState(false)
  const [activeTier, setActiveTier] = useState<ModelTier | 'all'>('all')

  useEffect(() => {
    dispatch(getAvailableModels())
    dispatch(getAllModels())
  }, [dispatch])

  const handleModelSelect = (llmId: number) => {
    dispatch(updateSelectedModel(llmId))
    setOpen(false)
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

  // Derived state to only show available tiers
  const availableTiers = useMemo(() => {
    const existing = new Set(models.map((m) => m.tier))
    return ModelTierOrder.filter((tier) => existing.has(tier))
  }, [models])

  // Filter models based on the active tab
  const filteredModels = useMemo(() => {
    if (activeTier === 'all') return models
    return models.filter((m) => m.tier === activeTier)
  }, [models, activeTier])

  const selectedTierColors = selectedModelData
    ? ModelTierColors[selectedModelData.tier]
    : undefined

  const SelectedTierIcon = selectedModelData
    ? tierIcons[selectedModelData.tier]
    : Box

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex h-9 items-center gap-2 rounded-full px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background ${open ? 'bg-accent/50 ring-2 ring-primary' : 'bg-accent/30 hover:bg-accent/60 dark:bg-accent/20 dark:hover:bg-accent/40'} ${selectedTierColors ? `${selectedTierColors.border} border shadow-sm` : 'border border-transparent'} `}
        >
          <SelectedTierIcon
            className={`h-4 w-4 ${selectedTierColors ? selectedTierColors.icon : 'text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'}`}
          />
          <span
            className={`max-w-[140px] truncate text-sm transition-colors ${selectedTierColors ? selectedTierColors.text : 'text-muted-foreground group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'}`}
          >
            {selectedModelData?.name || 'Select Model'}
          </span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        sideOffset={8}
        className='w-[380px] overflow-hidden rounded-2xl border border-white/20 bg-background/80 p-0 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-background/80 sm:w-[500px]'
      >
        <div className='flex h-full max-h-[80vh] flex-col'>
          {/* Header & Tabs */}
          <div className='flex-none p-4 pb-0'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold tracking-tight text-foreground'>
                Models
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className='text-muted-foreground hover:text-foreground'>
                      <Info className='h-4 w-4' />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.modelPicker.provider.title}
                    </p>
                    <p className='text-sm'>
                      {TOOLTIP_CONTENT.modelPicker.provider.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Segmented Control for Tiers */}
            {hasModels && availableTiers.length > 0 && (
              <div className='relative mb-4 flex w-full space-x-1 rounded-xl bg-accent/40 p-1 backdrop-blur-md dark:bg-accent/20'>
                {['all', ...availableTiers].map((tier) => {
                  const isActive = activeTier === tier
                  const label =
                    tier === 'all'
                      ? 'All Models'
                      : ModelTierLabels[tier as ModelTier]
                  const colors =
                    tier !== 'all' ? ModelTierColors[tier as ModelTier] : null

                  return (
                    <button
                      key={tier}
                      onClick={() => setActiveTier(tier as ModelTier | 'all')}
                      className={`relative z-10 flex flex-1 items-center justify-center rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive
                          ? colors
                            ? colors.text
                            : 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId='activeTabBadge'
                          className={`absolute inset-0 rounded-lg shadow-sm ${
                            colors ? colors.bg : 'bg-background'
                          }`}
                          transition={{
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className='relative z-20 flex items-center gap-1'>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Model Cards Grid inside ScrollArea-like custom container */}
          <div className='flex-1 overflow-y-auto px-4 pb-4'>
            {loading ? (
              <div className='flex h-32 items-center justify-center'>
                <Spinner className='h-6 w-6 animate-spin text-primary' />
              </div>
            ) : !hasModels ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <Box className='mb-2 h-10 w-10 text-muted-foreground/30' />
                <p className='text-sm font-medium text-muted-foreground'>
                  No models available
                </p>
              </div>
            ) : (
              <AnimatePresence mode='popLayout'>
                <motion.div
                  layout
                  className='grid grid-cols-1 gap-2 sm:grid-cols-2'
                >
                  {filteredModels.map((model) => {
                    const isSelected = model.id === selectedModel
                    const colors = ModelTierColors[model.tier]
                    const TierIcon = tierIcons[model.tier]

                    return (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ opacity: { duration: 0.2 } }}
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? `${colors.bg} ${colors.border} ring-1 ${colors.ring}`
                            : `border-transparent bg-accent/20 hover:border-accent/40 hover:bg-accent/40 dark:bg-accent/10 dark:hover:bg-accent/20`
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`absolute -right-1 -top-1 rounded-full p-0.5 ${colors.bg} shadow-sm backdrop-blur-md`}
                          >
                            <Check className={`h-3 w-3 ${colors.icon}`} />
                          </div>
                        )}
                        <div className='flex w-full items-center justify-between'>
                          <div className='flex items-center gap-1.5'>
                            <TierIcon
                              className={`h-3.5 w-3.5 ${colors.icon}`}
                            />
                            <span
                              className={`text-sm font-bold tracking-tight ${isSelected ? colors.text : 'text-foreground group-hover:text-primary dark:text-gray-100'}`}
                            >
                              {model.name}
                            </span>
                          </div>
                        </div>

                        {model.description && (
                          <div className='line-clamp-2 min-h-[2rem] text-xs leading-snug text-muted-foreground'>
                            {model.description}
                          </div>
                        )}

                        <div className='mt-1 flex flex-wrap items-center gap-1.5'>
                          <Badge
                            variant='secondary'
                            className='border-none bg-background/50 text-[10px] font-bold uppercase text-muted-foreground hover:bg-background'
                          >
                            {model.provider}
                          </Badge>
                          {model.isReasoning && (
                            <Badge className='border-none bg-purple-100/50 text-[10px] font-bold uppercase text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300'>
                              Thinking
                            </Badge>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer Area */}
          <div className='flex-none border-t border-accent/20 bg-accent/10 p-2 backdrop-blur-md'>
            <Link
              to='/help'
              className='group flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground'
            >
              <HelpCircle className='h-3.5 w-3.5 transition-transform group-hover:scale-110' />
              <span>Model Documentation</span>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Simple internal generic spinner rather than importing to avoid missing component
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    ></circle>
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
)

export default ModelPicker
