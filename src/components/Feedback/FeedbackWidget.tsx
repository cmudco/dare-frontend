import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  toggleFeedback,
  closeFeedback,
  setEmotion,
  setCategory,
  setMessage,
  removeScreenshot,
  prevStep,
  skipCategory,
  captureScreenshot,
  submitFeedback,
} from '@/redux/feedbackSlice'
import { FeedbackPanel } from './FeedbackPanel'
import {
  fabVariants,
  pulseRingVariants,
  iconRotateVariants,
} from './animations'

export function FeedbackWidget() {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch<AppDispatch>()

  const {
    isOpen,
    currentStep,
    direction,
    data,
    isSubmitting,
    isCapturingScreenshot,
  } = useSelector((state: RootState) => state.feedback)

  // Auto-close after thank you step
  useEffect(() => {
    if (currentStep === 'thankyou') {
      const timer = setTimeout(() => {
        dispatch(closeFeedback())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, dispatch])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        feedbackRef.current &&
        !feedbackRef.current.contains(event.target as Node)
      ) {
        if (isOpen && currentStep !== 'thankyou' && !isCapturingScreenshot) {
          dispatch(closeFeedback())
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, currentStep, isCapturingScreenshot, dispatch])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        dispatch(closeFeedback())
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, dispatch])

  const handleToggle = () => dispatch(toggleFeedback())
  const handleClose = () => dispatch(closeFeedback())
  const handleSetEmotion = (emotion: Parameters<typeof setEmotion>[0]) =>
    dispatch(setEmotion(emotion))
  const handleSetCategory = (category: Parameters<typeof setCategory>[0]) =>
    dispatch(setCategory(category))
  const handleSetMessage = (message: string) => dispatch(setMessage(message))
  const handleCaptureScreenshot = () => dispatch(captureScreenshot())
  const handleRemoveScreenshot = () => dispatch(removeScreenshot())
  const handleSubmit = () => dispatch(submitFeedback())
  const handleBack = () => dispatch(prevStep())
  const handleSkipCategory = () => dispatch(skipCategory())

  return (
    <div
      ref={feedbackRef}
      data-feedback-widget
      className='fixed bottom-6 right-6 z-50'
    >
      {/* Feedback Panel */}
      <FeedbackPanel
        isOpen={isOpen}
        currentStep={currentStep}
        direction={direction}
        emotion={data.emotion}
        category={data.category}
        message={data.message}
        screenshot={data.screenshot}
        isSubmitting={isSubmitting}
        isCapturingScreenshot={isCapturingScreenshot}
        onClose={handleClose}
        onSetEmotion={handleSetEmotion}
        onSetCategory={handleSetCategory}
        onSetMessage={handleSetMessage}
        onCaptureScreenshot={handleCaptureScreenshot}
        onRemoveScreenshot={handleRemoveScreenshot}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onSkipCategory={handleSkipCategory}
      />

      {/* FAB Button */}
      <motion.button
        variants={fabVariants}
        initial='idle'
        animate={isOpen ? 'tap' : 'idle'}
        whileHover='hover'
        whileTap='tap'
        onClick={handleToggle}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-dare-gradient text-white shadow-lg shadow-black/30 transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isOpen ? 'shadow-xl shadow-primary/40' : ''} `}
        aria-label={isOpen ? 'Close feedback' : 'Send feedback'}
        aria-expanded={isOpen}
      >
        {/* Pulse ring animation (only when closed) */}
        <AnimatePresence>
          {!isOpen && (
            <>
              {/* First pulse ring */}
              <motion.span
                variants={pulseRingVariants}
                initial='initial'
                animate='animate'
                exit={{ opacity: 0, scale: 1 }}
                className='absolute inset-0 rounded-full bg-primary/40'
                style={{ willChange: 'transform, opacity' }}
              />
              {/* Second pulse ring (offset) */}
              <motion.span
                variants={pulseRingVariants}
                initial='initial'
                animate='animate'
                exit={{ opacity: 0, scale: 1 }}
                className='absolute inset-0 rounded-full bg-primary/30'
                style={{
                  willChange: 'transform, opacity',
                  animationDelay: '0.5s',
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon with rotation */}
        <motion.div
          variants={iconRotateVariants}
          initial='closed'
          animate={isOpen ? 'open' : 'closed'}
          className='relative z-10'
        >
          <AnimatePresence mode='wait'>
            {isOpen ? (
              <motion.div
                key='close'
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                <X className='h-6 w-6' />
              </motion.div>
            ) : (
              <motion.div
                key='message'
                initial={{ opacity: 0, rotate: 45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -45 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className='h-6 w-6' />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hover glow effect */}
        <div className='absolute inset-0 rounded-full bg-white/0 transition-colors duration-200 hover:bg-white/10' />
      </motion.button>
    </div>
  )
}
