import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Camera,
  X,
  Loader2,
  Send,
  Image as ImageIcon,
} from 'lucide-react'

interface DetailsStepProps {
  message: string
  screenshot: string | null
  isSubmitting: boolean
  isCapturingScreenshot: boolean
  onMessageChange: (message: string) => void
  onCaptureScreenshot: () => void
  onRemoveScreenshot: () => void
  onSubmit: () => void
  onBack: () => void
}

const MAX_MESSAGE_LENGTH = 1000

export function DetailsStep({
  message,
  screenshot,
  isSubmitting,
  isCapturingScreenshot,
  onMessageChange,
  onCaptureScreenshot,
  onRemoveScreenshot,
  onSubmit,
  onBack,
}: DetailsStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`
    }
  }, [message])

  // Focus textarea on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const charactersRemaining = MAX_MESSAGE_LENGTH - message.length
  const isOverLimit = charactersRemaining < 0

  return (
    <form onSubmit={handleSubmit} className='flex flex-col py-2'>
      {/* Header with back button */}
      <div className='mb-4 flex items-center'>
        <motion.button
          type='button'
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
          aria-label='Go back to category selection'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </motion.button>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-1 text-center text-lg font-semibold text-foreground'
      >
        Tell us more
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className='mb-4 text-center text-sm text-muted-foreground'
      >
        Optional, but helps us understand better
      </motion.p>

      {/* Textarea */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`relative rounded-xl border transition-all duration-200 ${
          isFocused
            ? 'border-primary ring-1 ring-primary/30'
            : 'border-white/10 hover:border-white/20'
        } `}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder='Your feedback helps us improve DARE...'
          maxLength={MAX_MESSAGE_LENGTH + 100} // Allow some overflow for UX
          className={`max-h-[150px] min-h-[80px] w-full resize-none rounded-xl bg-transparent p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden`}
          aria-label='Feedback message'
        />

        {/* Character counter */}
        <div className='absolute right-2 bottom-2'>
          <span
            className={`text-xs transition-colors ${
              isOverLimit
                ? 'text-destructive'
                : charactersRemaining < 100
                  ? 'text-yellow-400'
                  : 'text-muted-foreground/50'
            }`}
          >
            {charactersRemaining}
          </span>
        </div>
      </motion.div>

      {/* Screenshot section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='mt-4'
      >
        <AnimatePresence mode='wait'>
          {screenshot ? (
            <motion.div
              key='screenshot-preview'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='relative overflow-hidden rounded-xl border border-white/10'
            >
              <img
                src={screenshot}
                alt='Screenshot preview'
                className='h-32 w-full object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/60 to-transparent' />
              <div className='absolute bottom-2 left-2 flex items-center gap-1.5 text-xs text-white/80'>
                <ImageIcon className='h-3.5 w-3.5' />
                <span>Screenshot attached</span>
              </div>
              <motion.button
                type='button'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemoveScreenshot}
                className='absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
                aria-label='Remove screenshot'
              >
                <X className='h-4 w-4' />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key='capture-button'
              type='button'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCaptureScreenshot}
              disabled={isCapturingScreenshot}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-muted-foreground transition-all duration-200 hover:border-white/30 hover:text-foreground ${isCapturingScreenshot ? 'cursor-not-allowed opacity-70' : ''} `}
            >
              {isCapturingScreenshot ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='text-sm'>Capturing...</span>
                </>
              ) : (
                <>
                  <Camera className='h-4 w-4' />
                  <span className='text-sm'>Capture screenshot</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit button */}
      <motion.button
        type='submit'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting || isOverLimit}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className='h-4 w-4' />
            <span>Submit Feedback</span>
          </>
        )}
      </motion.button>

      {/* Skip text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mt-3 text-center text-xs text-muted-foreground/60'
      >
        Press submit without a message for quick feedback
      </motion.p>
    </form>
  )
}
