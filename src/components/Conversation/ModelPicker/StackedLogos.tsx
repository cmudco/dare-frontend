import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PickerModel } from '@/redux/types/conversation'
import { getProviderBrand } from '@/utils/providerColors'

interface StackedLogosProps {
  entries: PickerModel[]
  max?: number
  className?: string
}

/** Overlapping provider logos, newest on top, with a "+n" tail past `max`. */
const StackedLogos: React.FC<StackedLogosProps> = ({
  entries,
  max = 3,
  className = '',
}) => {
  const shown = entries.slice(0, max)
  const extra = entries.length - shown.length

  return (
    <div className={`flex items-center ${className}`}>
      <AnimatePresence initial={false}>
        {shown.map((entry, index) => {
          const brand = getProviderBrand(entry.provider)
          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              title={entry.name}
              style={{ zIndex: shown.length - index }}
              className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-border bg-background ${
                index > 0 ? '-ml-1.5' : ''
              }`}
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className='h-3 w-3 object-contain'
                />
              ) : (
                <span className='text-[9px] font-bold uppercase'>
                  {entry.provider.charAt(0)}
                </span>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {extra > 0 && (
        <span className='-ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-muted px-1 text-[10px] font-semibold text-muted-foreground'>
          +{extra}
        </span>
      )}
    </div>
  )
}

export default StackedLogos
