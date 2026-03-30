import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProviderGroup } from '@/utils/modelGroupingUtils'
import { getProviderBrand } from '@/utils/providerColors'
import ModelItem from './ModelItem'

interface ProviderSectionProps {
  providerGroup: ProviderGroup
  isExpanded: boolean
  onToggle: () => void
  selectedModelId: number | null | undefined
  onSelect: (id: number) => void
}

const ProviderSection: React.FC<ProviderSectionProps> = ({
  providerGroup,
  isExpanded,
  onToggle,
  selectedModelId,
  onSelect,
}) => {
  const brand = getProviderBrand(providerGroup.provider)

  return (
    <div className='overflow-hidden rounded-xl border border-accent/20 bg-accent/5 shadow-sm dark:bg-white/5'>
      <button
        onClick={onToggle}
        className='flex w-full items-center justify-between p-3 transition-colors hover:bg-accent/40 dark:hover:bg-white/5'
      >
        <div className='flex items-center gap-2'>
          <div
            className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-md border border-accent/20 shadow-sm ${brand.lightBg} ${brand.text}`}
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className='h-4 w-4 object-contain brightness-100 dark:brightness-125'
              />
            ) : (
              <span className='text-[10px] font-bold uppercase'>
                {providerGroup.provider.charAt(0)}
              </span>
            )}
          </div>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
            {providerGroup.provider}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        ) : (
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='space-y-4 p-3 pt-0'>
              {providerGroup.groups.map((group) => (
                <div key={group.type} className='space-y-2'>
                  <div className='grid grid-cols-1 gap-1'>
                    {group.models.map((model) => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={model.id === selectedModelId}
                        onClick={() => onSelect(model.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProviderSection
