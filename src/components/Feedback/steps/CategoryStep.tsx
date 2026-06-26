import { motion } from 'framer-motion'
import { ChevronLeft, SkipForward } from 'lucide-react'
import { CATEGORY_OPTIONS, type FeedbackCategory } from '../types'
import {
  categoryCardVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../animations'

interface CategoryStepProps {
  selectedCategory: FeedbackCategory | null
  onSelect: (category: FeedbackCategory) => void
  onBack: () => void
  onSkip: () => void
}

export function CategoryStep({
  selectedCategory,
  onSelect,
  onBack,
  onSkip,
}: CategoryStepProps) {
  return (
    <div className='flex flex-col py-2'>
      {/* Header with back button */}
      <div className='mb-4 flex items-center justify-between'>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
          aria-label='Go back to emotion selection'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkip}
          className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
          aria-label='Skip category selection'
        >
          <span>Skip</span>
          <SkipForward className='h-4 w-4' />
        </motion.button>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-1 text-center text-lg font-semibold text-foreground'
      >
        What's this about?
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className='mb-4 text-center text-sm text-muted-foreground'
      >
        Help us categorize your feedback
      </motion.p>

      {/* Category grid */}
      <motion.div
        variants={staggerContainerVariants}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-2 gap-2'
      >
        {CATEGORY_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            variants={staggerItemVariants}
            whileHover='hover'
            whileTap='tap'
            animate={selectedCategory === option.value ? 'selected' : 'initial'}
            onClick={() => onSelect(option.value)}
            className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
              selectedCategory === option.value
                ? 'bg-dare-gradient/20 border-primary/60'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            } `}
            aria-label={`Select ${option.label}`}
            aria-pressed={selectedCategory === option.value}
          >
            <motion.span
              variants={categoryCardVariants}
              className='text-2xl select-none'
            >
              {option.icon}
            </motion.span>
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                selectedCategory === option.value
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </span>
            <span className='text-center text-xs leading-tight text-muted-foreground/70'>
              {option.description}
            </span>

            {/* Selection checkmark */}
            {selectedCategory === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className='absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary'
              >
                <svg
                  className='h-3 w-3 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
