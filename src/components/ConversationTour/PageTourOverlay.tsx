import { AnimatePresence, motion } from 'framer-motion'
import { useAppSelector } from '@/redux/hooks'
import { type RootState } from '@/redux/store'
import usePageTour from './usePageTour'
import ConversationTourWelcome from './ConversationTourWelcome'
import ConversationTourTooltip from './ConversationTourTooltip'

const SPOTLIGHT_BORDER_RADIUS = 14
const PULSE_PADDING = 8

/**
 * Generic page tour overlay — renders for any page except 'conversation'
 * (conversation has its own overlay mounted inside ConversationLayout).
 */
export default function PageTourOverlay() {
  const { showTour, activePage } = useAppSelector(
    (state: RootState) => state.conversationTour
  )

  const {
    step,
    displayStepIndex,
    displayTotalSteps,
    targetRect,
    isFirst,
    isLast,
    skipAnimation,
    hasSteps,
    next,
    back,
    skip,
    finish,
  } = usePageTour()

  // Don't render for conversation page (it has its own overlay) or if no steps
  if (!showTour || activePage === 'conversation' || !hasSteps || !step)
    return null

  const isCentered = step.placement === 'center' || !step.target
  const isWelcomeStep = isCentered && isFirst

  return (
    <div className='pointer-events-auto fixed inset-0 z-[200]'>
      <AnimatePresence mode='wait'>
        {isCentered ? (
          <motion.div
            key={isWelcomeStep ? 'welcome' : `info-${step.id}`}
            className='fixed inset-0 z-[200] flex items-center justify-center p-4'
            initial={skipAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
              aria-hidden='true'
              onClick={skip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className='relative z-[201]'>
              {isWelcomeStep && (
                <ConversationTourWelcome
                  onStart={next}
                  onSkip={skip}
                  title={step.title}
                  subtitle={step.description}
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='spotlight'
            initial={skipAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className='pointer-events-none fixed inset-0 z-[200] h-full w-full'>
              <defs>
                <mask id='page-tour-mask'>
                  <rect width='100%' height='100%' fill='white' />
                  {targetRect && (
                    <motion.rect
                      fill='black'
                      rx={SPOTLIGHT_BORDER_RADIUS}
                      ry={SPOTLIGHT_BORDER_RADIUS}
                      initial={false}
                      animate={{
                        x: targetRect.x,
                        y: targetRect.y,
                        width: targetRect.width,
                        height: targetRect.height,
                      }}
                      transition={{
                        type: 'tween',
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  )}
                </mask>
              </defs>

              <rect
                width='100%'
                height='100%'
                fill='rgba(0,0,0,0.65)'
                mask='url(#page-tour-mask)'
              />

              {targetRect && (
                <motion.rect
                  fill='none'
                  stroke='rgba(238,24,60,0.7)'
                  strokeWidth='1.5'
                  rx={SPOTLIGHT_BORDER_RADIUS + PULSE_PADDING}
                  ry={SPOTLIGHT_BORDER_RADIUS + PULSE_PADDING}
                  initial={false}
                  animate={{
                    x: targetRect.x - PULSE_PADDING,
                    y: targetRect.y - PULSE_PADDING,
                    width: targetRect.width + PULSE_PADDING * 2,
                    height: targetRect.height + PULSE_PADDING * 2,
                    opacity: [0.9, 0.2, 0.9],
                  }}
                  transition={{
                    x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    y: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    width: {
                      type: 'tween',
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    height: {
                      type: 'tween',
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    opacity: {
                      repeat: Infinity,
                      duration: 2,
                      ease: 'easeInOut',
                    },
                  }}
                />
              )}

              {targetRect && (
                <motion.rect
                  fill='none'
                  stroke='rgba(238,24,60,0.3)'
                  strokeWidth='1'
                  rx={SPOTLIGHT_BORDER_RADIUS + PULSE_PADDING + 6}
                  ry={SPOTLIGHT_BORDER_RADIUS + PULSE_PADDING + 6}
                  initial={false}
                  animate={{
                    x: targetRect.x - PULSE_PADDING - 6,
                    y: targetRect.y - PULSE_PADDING - 6,
                    width: targetRect.width + (PULSE_PADDING + 6) * 2,
                    height: targetRect.height + (PULSE_PADDING + 6) * 2,
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    y: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    width: {
                      type: 'tween',
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    height: {
                      type: 'tween',
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    opacity: {
                      repeat: Infinity,
                      duration: 2,
                      ease: 'easeInOut',
                      delay: 0.4,
                    },
                  }}
                />
              )}
            </svg>

            <div
              className='fixed inset-0 z-[201]'
              onClick={(e) => {
                if (targetRect) {
                  const { clientX: cx, clientY: cy } = e
                  const inSpotlight =
                    cx >= targetRect.x &&
                    cx <= targetRect.x + targetRect.width &&
                    cy >= targetRect.y &&
                    cy <= targetRect.y + targetRect.height
                  if (inSpotlight) return
                }
                e.stopPropagation()
              }}
            />

            {targetRect && (
              <ConversationTourTooltip
                step={step}
                targetRect={targetRect}
                displayStep={displayStepIndex}
                displayTotal={displayTotalSteps}
                isFirst={isFirst}
                isLast={isLast}
                onNext={next}
                onBack={back}
                onSkip={skip}
                onFinish={finish}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
