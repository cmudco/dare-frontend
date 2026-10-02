import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SquarePen, X } from 'lucide-react'
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

export type HelpTab = 'assistant' | 'feedback'

const TABS: { id: HelpTab; label: string }[] = [
  { id: 'assistant', label: 'Ask DARE' },
  { id: 'feedback', label: 'Feedback' },
]

interface FeedbackPanelProps {
  isOpen: boolean
  tab: HelpTab
  onTabChange: (tab: HelpTab) => void
  assistant: ReactNode
  onNewAssistantChat: () => void
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
  tab,
  onTabChange,
  assistant,
  onNewAssistantChat,
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
          className='fixed right-6 bottom-16 z-50 w-[420px] max-w-[calc(100vw-48px)]'
        >
          {/* Glass morphism panel */}
          <motion.div
            variants={backgroundGradientVariants}
            initial='initial'
            animate={(tab === 'feedback' && emotion) || 'initial'}
            className='relative rounded-2xl shadow-2xl shadow-black/40'
          >
            {/* Backdrop blur layer */}
            <div className='absolute inset-0 rounded-2xl bg-background/95 backdrop-blur-xl' />

            {/* Gradient overlay - consistent dare-gradient */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: tab === 'feedback' && emotion ? 0.1 : 0 }}
              transition={{ duration: 0.5 }}
              className='absolute inset-0 rounded-2xl bg-dare-gradient'
            />

            {/* Border */}
            <div className='pointer-events-none absolute inset-0 rounded-2xl border border-white/10' />

            {/* Content */}
            <div className='relative flex flex-col'>
              {/* Header: tabs + actions */}
              <div className='flex items-center justify-between border-b border-border px-3 py-2'>
                <div
                  role='tablist'
                  aria-label='Help'
                  className='flex items-center gap-1 rounded-lg bg-muted p-0.5'
                >
                  {TABS.map(({ id, label }) => (
                    <button
                      key={id}
                      type='button'
                      role='tab'
                      aria-selected={tab === id}
                      onClick={() => onTabChange(id)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        tab === id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className='flex items-center gap-1'>
                  {tab === 'assistant' && (
                    <button
                      type='button'
                      onClick={onNewAssistantChat}
                      className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                      aria-label='New chat'
                      title='New chat'
                    >
                      <SquarePen className='h-4 w-4' />
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    aria-label='Close help panel'
                  >
                    <X className='h-4 w-4' />
                  </motion.button>
                </div>
              </div>

              {tab === 'assistant' ? (
                <div className='h-[min(560px,calc(100vh-160px))]'>
                  {assistant}
                </div>
              ) : (
                <div className='p-4'>
                  {/* Progress dots */}
                  {currentStep !== 'thankyou' && (
                    <div className='mb-3 flex items-center gap-1.5'>
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
                                : 'bg-muted-foreground/30'
                          } `}
                        />
                      ))}
                    </div>
                  )}

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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
