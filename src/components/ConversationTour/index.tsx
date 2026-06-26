import { AnimatePresence, motion } from 'framer-motion'
import { useAppSelector } from '@/redux/hooks'
import { type RootState } from '@/redux/store'
import useConversationTour from './useConversationTour'
import ConversationTourWelcome from './ConversationTourWelcome'
import ConversationTourTooltip from './ConversationTourTooltip'

const SPOTLIGHT_BORDER_RADIUS = 14
const PULSE_PADDING = 8

export default function ConversationTourOverlay() {
  const showTour = useAppSelector(
    (state: RootState) => state.conversationTour.showTour
  )

  const {
    step,
    displayStepIndex,
    displayTotalSteps,
    targetRect,
    isFirst,
    isLast,
    skipAnimation,
    next,
    back,
    skip,
    finish,
  } = useConversationTour()

  if (!showTour) return null

  const isCentered = step.placement === 'center' || !step.target
  const isWelcomeStep = isCentered && isFirst

  return (
    <div className='pointer-events-auto fixed inset-0 z-200'>
      <AnimatePresence mode='wait'>
        {isCentered ? (
          /* Centered welcome modal */
          <motion.div
            key={isWelcomeStep ? 'welcome' : `info-${step.id}`}
            className='fixed inset-0 z-200 flex items-center justify-center p-4'
            initial={skipAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className='absolute inset-0 bg-black/60 backdrop-blur-xs'
              aria-hidden='true'
              onClick={skip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Card */}
            <div className='relative z-201'>
              {isWelcomeStep && (
                <ConversationTourWelcome onStart={next} onSkip={skip} />
              )}
            </div>
          </motion.div>
        ) : (
          /* Spotlight step */
          <motion.div
            key='spotlight'
            initial={skipAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* SVG overlay with cutout mask */}
            <svg className='pointer-events-none fixed inset-0 z-200 h-full w-full'>
              <defs>
                <mask id='conversation-tour-mask'>
                  {/* White = the dark overlay area */}
                  <rect width='100%' height='100%' fill='white' />
                  {/* Black = transparent spotlight cutout */}
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

              {/* Dark overlay */}
              <rect
                width='100%'
                height='100%'
                fill='rgba(0,0,0,0.65)'
                mask='url(#conversation-tour-mask)'
              />

              {/* Pulsing ring around spotlight target */}
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

              {/* Second pulsing ring — slightly larger, more subtle (depth effect) */}
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

            {/* Click-blocker — passes clicks inside spotlight through */}
            <div
              className='fixed inset-0 z-201'
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

            {/* Tooltip */}
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
