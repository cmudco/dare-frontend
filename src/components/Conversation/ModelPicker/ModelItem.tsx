import React from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { LLMModel } from '@/redux/types/conversation'
import { ModelTier, ModelTierColors } from '@/utils/constants/model'
import { getProviderBrand } from '@/utils/providerColors'
import { categorizeModel } from '@/utils/modelGroupingUtils'
import TierEmoji from './TierEmoji'

interface ModelItemProps {
  model: LLMModel
  isSelected: boolean
  onClick: () => void
  showProvider?: boolean
}

const ModelItem: React.FC<ModelItemProps> = ({
  model,
  isSelected,
  onClick,
  showProvider,
}) => {
  const colors = ModelTierColors[model.tier as ModelTier]
  const brand = getProviderBrand(model.provider)

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
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-accent/20 bg-accent/30 p-0.5 shadow-sm'>
              <img
                src={brand.logo}
                alt={brand.name}
                className='h-full w-full object-contain brightness-100 dark:brightness-125'
              />
            </div>
          )}
          <span
            className={`truncate text-sm font-semibold ${isSelected ? colors.text : 'text-foreground'}`}
          >
            {model.name}
          </span>
          <TierEmoji type={categorizeModel(model)} />
          {model.isReasoning && (
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500' />
          )}
        </div>
        {model.description && (
          <span className='truncate text-[10px] text-muted-foreground'>
            {model.description}
          </span>
        )}
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
