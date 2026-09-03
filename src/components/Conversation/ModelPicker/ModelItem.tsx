import React from 'react'
import { Check, Gavel } from 'lucide-react'
import { motion } from 'framer-motion'
import { PickerModel } from '@/redux/types/conversation'
import {
  ModelTier,
  ModelTierColors,
  ReasoningLevel,
} from '@/utils/constants/model'
import { getProviderBrand } from '@/utils/providerColors'
import { categorizeEntry } from '@/utils/modelGroupingUtils'
import { formatRates } from '@/utils/ensemble'
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
  /** Bench mode: rows toggle membership and show their rates. */
  multi?: boolean
  isChairman?: boolean
  onMakeChairman?: () => void
}

const ModelItem: React.FC<ModelItemProps> = ({
  entry,
  isSelected,
  onClick,
  showProvider,
  multi = false,
  isChairman = false,
  onMakeChairman,
}) => {
  const tier = (entry.tier as ModelTier) ?? ModelTier.Advanced
  const colors = ModelTierColors[tier] ?? ModelTierColors[ModelTier.Advanced]
  const brand = getProviderBrand(entry.provider)
  const isLiteLLM = entry.id.startsWith('litellm:')
  const rates = multi ? formatRates(entry) : null
  // Panels compile to a workflow, and workflow steps reference catalog
  // models; proxy-routed entries have no row to reference yet.
  const benched = multi && isLiteLLM

  return (
    <motion.button
      whileTap={benched ? undefined : { scale: 0.98 }}
      onClick={benched ? undefined : onClick}
      disabled={benched}
      title={benched ? 'Panels use wallet models for now' : undefined}
      role={multi ? 'checkbox' : undefined}
      aria-checked={multi ? isSelected : undefined}
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all ${
        isSelected
          ? `${colors.bg} ${colors.border} border ring-1 ${colors.ring}`
          : benched
            ? 'cursor-not-allowed opacity-40'
            : 'hover:bg-accent/40'
      }`}
    >
      {multi && (
        <span
          aria-hidden='true'
          className={`mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
            isSelected
              ? `${colors.dot} border-transparent text-white`
              : 'border-muted-foreground/40 group-hover:border-foreground'
          }`}
        >
          <Check
            className={`h-3 w-3 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}
            strokeWidth={3}
          />
        </span>
      )}
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
        {rates && (
          <span className='text-[11px] whitespace-nowrap text-muted-foreground tabular-nums'>
            {rates}
          </span>
        )}
        {multi && onMakeChairman && !benched && (
          <span
            role='button'
            tabIndex={0}
            aria-label={
              isChairman ? 'Chairman' : `Make ${entry.name} the chairman`
            }
            aria-pressed={isChairman}
            title={
              isChairman
                ? 'Chairman: reads every draft and writes the answer'
                : 'Make this model the chairman'
            }
            onClick={(event) => {
              event.stopPropagation()
              onMakeChairman()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                onMakeChairman()
              }
            }}
            className={`flex h-6 shrink-0 items-center gap-1 rounded-full px-1.5 text-[10px] font-semibold transition-all ${
              isChairman
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary focus-visible:opacity-100'
            }`}
          >
            <Gavel className='h-3 w-3' />
            {isChairman && <span>Chair</span>}
          </span>
        )}
        {multi ? null : isSelected ? (
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
