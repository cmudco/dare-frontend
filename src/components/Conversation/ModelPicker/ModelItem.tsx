import React from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PickerModel } from '@/redux/types/conversation'
import {
  ModelTier,
  ModelTierColors,
  ReasoningLevel,
} from '@/utils/constants/model'
import { getProviderBrand } from '@/utils/providerColors'
import { categorizeEntry } from '@/utils/modelGroupingUtils'
import TierEmoji from './TierEmoji'
import ReasoningLevelIndicator from './ReasoningLevelIndicator'

// Tooltip for the reasoning dot (shown for cost_predictable or plain reasoning models).
const REASONING_TOOLTIP =
  'Reasoning model. Token use stays proportional to the task.'

interface ModelItemProps {
  entry: PickerModel
  isSelected: boolean
  onClick: () => void
  showProvider?: boolean
}

const ModelItem: React.FC<ModelItemProps> = ({
  entry,
  isSelected,
  onClick,
  showProvider,
}) => {
  const tier = (entry.tier as ModelTier) ?? ModelTier.Advanced
  const colors = ModelTierColors[tier] ?? ModelTierColors[ModelTier.Advanced]
  const brand = getProviderBrand(entry.provider)
  const isLiteLLM = entry.id.startsWith('litellm:')

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all ${
        isSelected
          ? `${colors.bg} ${colors.border} border ring-1 ${colors.ring}`
          : 'hover:bg-accent/40'
      }`}
    >
      <motion.div
        className='flex min-w-0 flex-1 flex-col'
        whileHover={{ x: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className='flex items-center gap-2'>
          {showProvider && brand.logo && (
            <div className='flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md border border-accent/20 bg-accent/30 p-0.5 shadow-xs'>
              <img
                src={brand.logo}
                alt={brand.name}
                className='h-full w-full object-contain'
              />
            </div>
          )}
          <span
            className={`truncate text-sm font-semibold ${isSelected ? colors.text : 'text-foreground'}`}
          >
            {entry.name}
          </span>
          <TierEmoji type={categorizeEntry(entry)} />
          {/* Single glyph per row, in precedence order: cost_unconstrained
              warns; otherwise cost_predictable or reasoning models
              get the purple dot; everything else shows nothing. */}
          {entry.reasoningLevel === ReasoningLevel.CostUnconstrained ? (
            <ReasoningLevelIndicator level={entry.reasoningLevel} />
          ) : entry.reasoningLevel === ReasoningLevel.CostPredictable ||
            entry.isReasoning ? (
            <div
              title={REASONING_TOOLTIP}
              className='h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500'
            />
          ) : null}
          {isLiteLLM && (
            <span className='ml-1 rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase'>
              LiteLLM
            </span>
          )}
        </div>
      </motion.div>

      <div className='flex items-center gap-2 pl-2'>
        {isSelected ? (
          <Check className={`h-4 w-4 ${colors.icon}`} />
        ) : (
          <div
            className={`h-1.5 w-1.5 rounded-full ${colors.dot} opacity-0 transition-opacity group-hover:opacity-100`}
          />
        )}
      </div>
    </motion.button>
  )
}

export default ModelItem
