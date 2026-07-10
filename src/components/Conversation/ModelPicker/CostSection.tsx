import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PickerModel } from '@/redux/types/conversation'
import { ModelGroup } from '@/utils/modelGroupingUtils'
import ModelItem from './ModelItem'
import TypeIcon from './TypeIcon'

interface CostSectionProps {
  group: ModelGroup
  isExpanded: boolean
  onToggle: () => void
  selectedId: string | null
  onSelect: (entry: PickerModel) => void
}

const CostSection: React.FC<CostSectionProps> = ({
  group,
  isExpanded,
  onToggle,
  selectedId,
  onSelect,
}) => {
  return (
    <div className='overflow-hidden rounded-xl border border-accent/20 bg-accent/5 shadow-xs'>
      <button
        onClick={onToggle}
        className='flex w-full items-center justify-between p-3 transition-colors hover:bg-accent/40'
      >
        <div className='flex items-center gap-2'>
          <TypeIcon type={group.type} className='h-4 w-4' />
          <span className='text-xs font-bold tracking-wider text-muted-foreground uppercase'>
            {group.type} Models
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
            <div className='grid grid-cols-1 gap-1 p-3 pt-0'>
              {group.entries.map((entry) => (
                <ModelItem
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedId}
                  onClick={() => onSelect(entry)}
                  showProvider
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CostSection
