import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, LucideIcon, User, Users } from 'lucide-react'
import type { EnsembleDepth } from '@/redux/types/conversation'
import { DEPTH_META } from '@/utils/ensemble'

const OPTIONS: { value: EnsembleDepth; icon: LucideIcon }[] = [
  { value: 'single', icon: User },
  { value: 'panel', icon: Users },
  { value: 'council', icon: Landmark },
]

interface DepthDialProps {
  value: EnsembleDepth
  onChange: (depth: EnsembleDepth) => void
}

/**
 * Single / Panel / Council. The sliding pill is the only moving part; the
 * tagline underneath explains what the person just picked.
 */
const DepthDial: React.FC<DepthDialProps> = ({ value, onChange }) => (
  <div className='space-y-1.5'>
    <div
      role='radiogroup'
      aria-label='Deliberation depth'
      className='grid grid-cols-3 gap-1 rounded-lg bg-accent/40 p-1'
    >
      {OPTIONS.map(({ value: option, icon: Icon }) => {
        const active = option === value
        return (
          <button
            key={option}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => onChange(option)}
            className={`relative flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${
              active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {active && (
              <motion.span
                layoutId='depth-dial-pill'
                className='absolute inset-0 rounded-md bg-background shadow-xs'
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className='relative z-10 h-3.5 w-3.5' />
            <span className='relative z-10'>{DEPTH_META[option].label}</span>
          </button>
        )
      })}
    </div>
    <AnimatePresence mode='wait' initial={false}>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
        className='px-1 text-xs text-muted-foreground'
      >
        {DEPTH_META[value].tagline}
      </motion.p>
    </AnimatePresence>
  </div>
)

export default DepthDial
