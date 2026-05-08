import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Clock,
  Coins,
  HelpCircle,
  Layers,
  LayoutGrid,
  Search,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { AppDispatch, RootState } from '@/redux/store'
import { updateSelectedModel } from '@/redux/conversationSlice'
import {
  getAvailableModels,
  getAllModels,
} from '@/redux/asyncThunks/conversation'
import { PickerModel } from '@/redux/types/conversation'
import { ModelTier, ModelTierColors } from '@/utils/constants/model'
import { getProviderBrand } from '@/utils/providerColors'
import {
  groupModels,
  groupModelsByCost,
  ProviderGroup,
  ModelGroup,
  categorizeEntry,
} from '@/utils/modelGroupingUtils'

import ModeButton from './ModeButton'
import ModelSkeleton from './ModelSkeleton'
import ProviderSection from './ProviderSection'
import CostSection from './CostSection'
import ModelItem from './ModelItem'
import TypeIcon from './TypeIcon'

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

const ModelPicker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { pickerEntries, loading, selectedModel } = useSelector(
    (state: RootState) => state.conversation
  )
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [groupingMode, setGroupingMode] = useState<
    'provider' | 'cost' | 'all' | 'latest'
  >('provider')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  )

  useEffect(() => {
    dispatch(getAllModels())
    dispatch(getAvailableModels())
  }, [dispatch])

  // Initialize expanded states: only expand the group containing the selected entry
  useEffect(() => {
    if (pickerEntries.length > 0) {
      const initial: Record<string, boolean> = {}
      const selectedEntry = pickerEntries.find((e) => e.id === selectedModel)
      if (selectedEntry) {
        if (groupingMode === 'provider') {
          initial[selectedEntry.provider] = true
        } else if (groupingMode === 'cost') {
          initial[categorizeEntry(selectedEntry)] = true
        }
      }
      setExpandedGroups(initial)
    }
  }, [pickerEntries, groupingMode, selectedModel])

  const handleModelSelect = (entry: PickerModel) => {
    dispatch(updateSelectedModel(entry.id))
    setOpen(false)
  }

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return pickerEntries
    const query = searchQuery.toLowerCase()
    return pickerEntries.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.provider.toLowerCase().includes(query) ||
        (e.description !== null && e.description.toLowerCase().includes(query))
    )
  }, [pickerEntries, searchQuery])

  const groupedData = useMemo(() => {
    switch (groupingMode) {
      case 'provider':
        return groupModels(filteredEntries)
      case 'cost':
        return groupModelsByCost(filteredEntries)
      case 'all':
        return filteredEntries
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
      case 'latest':
        // Newer DB-backed LLMs (higher pk) first; LiteLLM entries (whose id
        // doesn't parse to int) sort to the end with -Infinity.
        return filteredEntries.slice().sort((a, b) => {
          const aId = Number.isNaN(Number(a.id)) ? -Infinity : Number(a.id)
          const bId = Number.isNaN(Number(b.id)) ? -Infinity : Number(b.id)
          return bId - aId
        })
      default:
        return filteredEntries
    }
  }, [filteredEntries, groupingMode])

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const selectedEntry = pickerEntries.find((e) => e.id === selectedModel)
  const selectedBrand = selectedEntry
    ? getProviderBrand(selectedEntry.provider)
    : null
  const selectedTierColors = selectedEntry?.tier
    ? ModelTierColors[selectedEntry.tier as ModelTier]
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          data-tour='model-picker'
          layout
          whileTap={{ scale: 0.98 }}
          className={`group flex h-9 items-center gap-2 rounded-full px-4 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background ${open ? 'bg-accent/50 ring-2 ring-primary' : 'bg-accent/30 hover:bg-accent/60 dark:bg-accent/20 dark:hover:bg-accent/40'} ${selectedTierColors ? `${selectedTierColors.border} border shadow-sm` : 'border border-transparent'} `}
        >
          {selectedBrand?.logo ? (
            <img
              src={selectedBrand.logo}
              alt={selectedBrand.name}
              className='h-4 w-4 object-contain brightness-100 dark:brightness-125'
            />
          ) : (
            <TypeIcon
              type={selectedEntry ? categorizeEntry(selectedEntry) : 'Premium'}
              className={`h-4 w-4 ${selectedTierColors ? selectedTierColors.icon : 'text-muted-foreground transition-colors group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'}`}
            />
          )}
          <span
            className={`max-w-[140px] truncate text-sm transition-colors ${selectedTierColors ? selectedTierColors.text : 'text-muted-foreground group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-white'}`}
          >
            {selectedEntry ? selectedEntry.name : 'Select Model'}
          </span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        sideOffset={8}
        className='w-[380px] overflow-hidden rounded-2xl border border-white/20 bg-background/90 p-0 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-background/90 sm:w-[500px]'
      >
        <motion.div layout className='flex h-full max-h-[85vh] flex-col'>
          {/* Header & Modes */}
          <div className='flex-none p-4 pb-2'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold tracking-tight text-foreground'>
                Models
              </h2>

              <div className='flex items-center gap-1 rounded-lg bg-accent/40 p-1 dark:bg-accent/20'>
                <ModeButton
                  active={groupingMode === 'provider'}
                  onClick={() => setGroupingMode('provider')}
                  icon={Layers}
                  label='Provider'
                />
                <ModeButton
                  active={groupingMode === 'cost'}
                  onClick={() => setGroupingMode('cost')}
                  icon={Coins}
                  label='Cost'
                />
                <ModeButton
                  active={groupingMode === 'all'}
                  onClick={() => setGroupingMode('all')}
                  icon={LayoutGrid}
                  label='All'
                />
                <ModeButton
                  active={groupingMode === 'latest'}
                  onClick={() => setGroupingMode('latest')}
                  icon={Clock}
                  label='Latest'
                />
              </div>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search models or providers...'
                className='h-10 border-none bg-accent/40 pl-10 focus-visible:ring-1 focus-visible:ring-primary dark:bg-accent/20'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Content */}
          <div className='custom-scrollbar min-h-[300px] flex-1 overflow-y-auto px-2 pb-4 pt-2'>
            {loading && pickerEntries.length === 0 ? (
              <ModelSkeleton />
            ) : filteredEntries.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center text-muted-foreground'>
                <Box className='mb-2 h-10 w-10 opacity-20' />
                <p className='text-sm font-medium'>No models found</p>
              </div>
            ) : (
              <AnimatePresence mode='wait'>
                <motion.div
                  key={groupingMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='space-y-4 px-2'
                >
                  {groupingMode === 'provider' &&
                    (groupedData as ProviderGroup[]).map((pg) => (
                      <ProviderSection
                        key={pg.provider}
                        providerGroup={pg}
                        isExpanded={!!expandedGroups[pg.provider]}
                        onToggle={() => toggleGroup(pg.provider)}
                        selectedId={selectedModel}
                        onSelect={handleModelSelect}
                      />
                    ))}

                  {groupingMode === 'cost' &&
                    (groupedData as ModelGroup[]).map((cg) => (
                      <CostSection
                        key={cg.type}
                        group={cg}
                        isExpanded={!!expandedGroups[cg.type]}
                        onToggle={() => toggleGroup(cg.type)}
                        selectedId={selectedModel}
                        onSelect={handleModelSelect}
                      />
                    ))}

                  {(groupingMode === 'all' || groupingMode === 'latest') && (
                    <div className='grid grid-cols-1 gap-1'>
                      {(groupedData as PickerModel[]).map((entry) => (
                        <ModelItem
                          key={entry.id}
                          entry={entry}
                          isSelected={entry.id === selectedModel}
                          onClick={() => handleModelSelect(entry)}
                          showProvider
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
            {loading && pickerEntries.length > 0 && (
              <div className='absolute right-2 top-2 rounded-full border border-accent/20 bg-background/50 p-1 shadow-sm backdrop-blur-sm'>
                <Spinner className='h-3 w-3 animate-spin text-primary' />
              </div>
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
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}

export default ModelPicker
