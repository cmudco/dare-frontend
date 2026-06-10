import { motion } from 'framer-motion'
import { EMOTION_OPTIONS, type Emotion } from '../types'
import {
  emojiVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../animations'

interface EmotionStepProps {
  selectedEmotion: Emotion | null
  onSelect: (emotion: Emotion) => void
}

export function EmotionStep({ selectedEmotion, onSelect }: EmotionStepProps) {
  return (
    <div className='flex flex-col items-center py-2'>
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-2 text-lg font-semibold text-foreground'
      >
        How are you feeling about DARE?
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className='mb-6 text-sm text-muted-foreground'
      >
        Click to share your experience
      </motion.p>

      <motion.div
        variants={staggerContainerVariants}
        initial='hidden'
        animate='visible'
        className='flex items-center justify-center gap-3'
      >
        {EMOTION_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            variants={staggerItemVariants}
            whileHover='hover'
            whileTap='tap'
            animate={selectedEmotion === option.value ? 'selected' : 'initial'}
            onClick={() => onSelect(option.value)}
            className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
              selectedEmotion === option.value
                ? 'bg-dare-gradient/20 ring-2 ring-primary/60'
                : 'hover:bg-white/5'
            } `}
            aria-label={`Rate as ${option.label}`}
            aria-pressed={selectedEmotion === option.value}
          >
            <motion.span
              variants={emojiVariants}
              className='text-4xl select-none'
              style={{
                filter:
                  selectedEmotion === option.value
                    ? 'drop-shadow(0 0 8px var(--primary))'
                    : 'none',
              }}
            >
              {option.emoji}
            </motion.span>
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                selectedEmotion === option.value
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </span>

            {/* Selection indicator ring */}
            {selectedEmotion === option.value && (
              <motion.div
                layoutId='emotion-selection-ring'
                className='absolute inset-0 rounded-xl ring-2 ring-primary/60'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
