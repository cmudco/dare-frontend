import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThumbsUp, X } from 'lucide-react'
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
import { fabVariants } from './animations'

export function FeedbackWidget() {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()

  // Hide feedback widget on workflow builder pages (create/edit)
  const isWorkflowBuilderPage =
    location.pathname.includes('/workflows/') &&
    (location.pathname.includes('/edit') ||
      location.pathname.includes('/create'))

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

  // Don't render on workflow builder pages
  if (isWorkflowBuilderPage) {
    return null
  }

  return (
    <div
      ref={feedbackRef}
      data-feedback-widget
      className='fixed right-4 bottom-4 z-50'
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
        className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-dare-gradient text-white shadow-md shadow-black/25 transition-shadow duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isOpen ? 'shadow-lg shadow-primary/40' : ''} `}
        aria-label={isOpen ? 'Close feedback' : 'Send feedback'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className='h-3.5 w-3.5' />
        ) : (
          <ThumbsUp className='h-3.5 w-3.5' />
        )}
      </motion.button>
    </div>
  )
}
