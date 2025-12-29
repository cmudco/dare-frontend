import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { FeedbackStep, Emotion, FeedbackCategory } from './types'
import { EmotionStep } from './steps/EmotionStep'
import { CategoryStep } from './steps/CategoryStep'
import { DetailsStep } from './steps/DetailsStep'
import { ThankYouStep } from './steps/ThankYouStep'
import {
  panelVariants,
  stepVariants,
  backgroundGradientVariants,
} from './animations'

interface FeedbackPanelProps {
  isOpen: boolean
  currentStep: FeedbackStep
  direction: number
  emotion: Emotion | null
  category: FeedbackCategory | null
  message: string
  screenshot: string | null
  isSubmitting: boolean
  isCapturingScreenshot: boolean
  onClose: () => void
  onSetEmotion: (emotion: Emotion) => void
  onSetCategory: (category: FeedbackCategory) => void
  onSetMessage: (message: string) => void
  onCaptureScreenshot: () => void
  onRemoveScreenshot: () => void
  onSubmit: () => void
  onBack: () => void
  onSkipCategory: () => void
}

// Step order for progress indicator
const STEPS: FeedbackStep[] = ['emotion', 'category', 'details', 'thankyou']

export function FeedbackPanel({
  isOpen,
  currentStep,
  direction,
  emotion,
  category,
  message,
  screenshot,
  isSubmitting,
  isCapturingScreenshot,
  onClose,
  onSetEmotion,
  onSetCategory,
  onSetMessage,
  onCaptureScreenshot,
  onRemoveScreenshot,
  onSubmit,
  onBack,
  onSkipCategory,
}: FeedbackPanelProps) {
  const currentStepIndex = STEPS.indexOf(currentStep)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-feedback-panel
          variants={panelVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          className='fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)]'
        >
          {/* Glass morphism panel */}
          <motion.div
            variants={backgroundGradientVariants}
            initial='initial'
            animate={emotion || 'initial'}
            className='relative rounded-2xl shadow-2xl shadow-black/40'
          >
            {/* Backdrop blur layer */}
            <div className='absolute inset-0 rounded-2xl bg-background/95 backdrop-blur-xl dark:bg-[#030a12]/95' />

            {/* Gradient overlay - consistent dare-gradient */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: emotion ? 0.1 : 0 }}
              transition={{ duration: 0.5 }}
              className='absolute inset-0 rounded-2xl bg-dare-gradient'
            />

            {/* Border */}
            <div className='pointer-events-none absolute inset-0 rounded-2xl border border-white/10' />

            {/* Content */}
            <div className='relative p-4'>
              {/* Header */}
              <div className='mb-3 flex items-center justify-between'>
                {/* Progress dots */}
                {currentStep !== 'thankyou' && (
                  <div className='flex items-center gap-1.5'>
                    {STEPS.slice(0, -1).map((step, index) => (
                      <motion.div
                        key={step}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          index === currentStepIndex
                            ? 'w-4 bg-primary'
                            : index < currentStepIndex
                              ? 'bg-green-500'
                              : 'bg-white/20'
                        } `}
                      />
                    ))}
                  </div>
                )}

                {/* Spacer when showing thank you */}
                {currentStep === 'thankyou' && <div />}

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground'
                  aria-label='Close feedback'
                >
                  <X className='h-4 w-4' />
                </motion.button>
              </div>

              {/* Step content with transitions */}
              <div className='relative min-h-[200px] overflow-hidden'>
                <AnimatePresence mode='wait' custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                  >
                    {currentStep === 'emotion' && (
                      <EmotionStep
                        selectedEmotion={emotion}
                        onSelect={onSetEmotion}
                      />
                    )}
                    {currentStep === 'category' && (
                      <CategoryStep
                        selectedCategory={category}
                        onSelect={onSetCategory}
                        onBack={onBack}
                        onSkip={onSkipCategory}
                      />
                    )}
                    {currentStep === 'details' && (
                      <DetailsStep
                        message={message}
                        screenshot={screenshot}
                        isSubmitting={isSubmitting}
                        isCapturingScreenshot={isCapturingScreenshot}
                        onMessageChange={onSetMessage}
                        onCaptureScreenshot={onCaptureScreenshot}
                        onRemoveScreenshot={onRemoveScreenshot}
                        onSubmit={onSubmit}
                        onBack={onBack}
                      />
                    )}
                    {currentStep === 'thankyou' && <ThankYouStep />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
