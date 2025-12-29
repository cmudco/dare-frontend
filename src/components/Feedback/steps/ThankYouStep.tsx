import { motion } from 'framer-motion'
import {
  checkmarkVariants,
  circleVariants,
  thankYouTextVariants,
} from '../animations'

export function ThankYouStep() {
  return (
    <div className='flex flex-col items-center justify-center py-6'>
      {/* Animated checkmark */}
      <motion.div
        variants={circleVariants}
        initial='hidden'
        animate='visible'
        className='relative mb-6 h-20 w-20'
      >
        {/* Outer glow ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30'
        />

        {/* Circle background */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className='absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
        >
          {/* Checkmark SVG */}
          <svg
            className='h-10 w-10 text-white'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={3}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <motion.path
              variants={checkmarkVariants}
              initial='hidden'
              animate='visible'
              d='M5 13l4 4L19 7'
            />
          </svg>
        </motion.div>

        {/* Sparkles */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className='absolute -right-1 -top-1'
        >
          <span className='text-2xl'>✨</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className='absolute -bottom-1 -left-1'
        >
          <span className='text-xl'>✨</span>
        </motion.div>
      </motion.div>

      {/* Thank you text */}
      <motion.div
        variants={thankYouTextVariants}
        initial='hidden'
        animate='visible'
        className='text-center'
      >
        <h3 className='mb-2 text-xl font-bold text-foreground'>Thank You!</h3>
        <p className='mb-4 max-w-[200px] text-sm text-muted-foreground'>
          Your feedback helps make DARE better for everyone
        </p>
      </motion.div>

      {/* Hearts animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='mb-4 flex items-center justify-center gap-2'
      >
        {['❤️', '🧡', '💛', '💚', '💙'].map((heart, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.6 + index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
            className='text-lg'
          >
            {heart}
          </motion.span>
        ))}
      </motion.div>

      {/* Auto-close countdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className='flex items-center gap-2'
      >
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 3, ease: 'linear' }}
          className='h-1 w-20 overflow-hidden rounded-full bg-primary/30'
        >
          <div
            className='h-full rounded-full bg-primary'
            style={{ width: '100%' }}
          />
        </motion.div>
        <span className='text-xs text-muted-foreground/60'>Closing...</span>
      </motion.div>
    </div>
  )
}
