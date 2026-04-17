import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

interface ConversationTourWelcomeProps {
  onStart: () => void
  onSkip: () => void
  title?: string
  subtitle?: string
}

export default function ConversationTourWelcome({
  onStart,
  onSkip,
  title,
  subtitle,
}: ConversationTourWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className='relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl shadow-black/50'
    >
      {/* Close */}
      <button
        type='button'
        onClick={onSkip}
        className='absolute right-3 top-3 z-10 rounded-lg p-1.5 text-white/60 opacity-70 transition-all hover:bg-white/20 hover:opacity-100'
      >
        <X className='h-4 w-4' />
        <span className='sr-only'>Close</span>
      </button>

      {/* Gradient header band */}
      <div className='relative overflow-hidden bg-dare-gradient px-6 pb-8 pt-7'>
        {/* Blurred orb for depth */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl'
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <div className='mb-4 inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/20 p-2.5 backdrop-blur-sm'>
            <Sparkles className='h-5 w-5 text-white' />
          </div>
          <h2 className='text-xl font-bold tracking-tight text-white'>
            {title || 'Welcome to DARE Chat'}
          </h2>
          <p className='mt-1.5 text-sm leading-relaxed text-white/75'>
            {subtitle || 'A quick 60-second tour of your AI workspace'}
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
        className='flex flex-col gap-2 px-5 pb-5 pt-4'
      >
        <button
          type='button'
          onClick={onStart}
          className='group relative overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        >
          <span className='absolute inset-0 bg-dare-gradient transition-opacity group-hover:opacity-90' />
          <span className='absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full' />
          <span className='relative flex items-center justify-center gap-2'>
            <Sparkles className='h-4 w-4' />
            Start Tour
          </span>
        </button>

        <button
          type='button'
          onClick={onSkip}
          className='py-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  )
}
