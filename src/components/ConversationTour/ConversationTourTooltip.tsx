import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  ConversationTourStep,
  TargetRect,
  TooltipPlacement,
} from './conversationTourSteps'

const TOOLTIP_GAP = 20
const TOOLTIP_MAX_WIDTH = 340
const TOOLTIP_MIN_WIDTH = 300

interface ConversationTourTooltipProps {
  step: ConversationTourStep
  targetRect: TargetRect
  displayStep: number
  displayTotal: number
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onFinish: () => void
}

function calculatePosition(
  targetRect: TargetRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TooltipPlacement
): { x: number; y: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cx = targetRect.x + targetRect.width / 2
  const cy = targetRect.y + targetRect.height / 2
  let x = 0
  let y = 0

  switch (placement) {
    case 'top':
      x = cx - tooltipWidth / 2
      y = targetRect.y - tooltipHeight - TOOLTIP_GAP
      if (y < 8) y = targetRect.y + targetRect.height + TOOLTIP_GAP
      break
    case 'bottom':
      x = cx - tooltipWidth / 2
      y = targetRect.y + targetRect.height + TOOLTIP_GAP
      if (y + tooltipHeight > vh - 8)
        y = targetRect.y - tooltipHeight - TOOLTIP_GAP
      break
    case 'left':
      x = targetRect.x - tooltipWidth - TOOLTIP_GAP
      y = cy - tooltipHeight / 2
      if (x < 8) x = targetRect.x + targetRect.width + TOOLTIP_GAP
      break
    case 'right':
      x = targetRect.x + targetRect.width + TOOLTIP_GAP
      y = cy - tooltipHeight / 2
      if (x + tooltipWidth > vw - 8)
        x = targetRect.x - tooltipWidth - TOOLTIP_GAP
      break
  }

  x = Math.max(8, Math.min(x, vw - tooltipWidth - 8))
  y = Math.max(8, Math.min(y, vh - tooltipHeight - 8))
  return { x, y }
}

export default function ConversationTourTooltip({
  step,
  targetRect,
  displayStep,
  displayTotal,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  onFinish,
}: ConversationTourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const hasInitialized = useRef(false)
  const [visible, setVisible] = useState(false)
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>(
    'forward'
  )

  const Icon = step.icon
  const placementRef = useRef(step.placement)
  placementRef.current = step.placement

  const stableTargetRect = useMemo(
    () => targetRect,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRect.x, targetRect.y, targetRect.width, targetRect.height]
  )

  const updatePosition = useCallback(() => {
    if (!tooltipRef.current) return
    const rect = tooltipRef.current.getBoundingClientRect()
    const pos = calculatePosition(
      stableTargetRect,
      rect.width,
      rect.height,
      placementRef.current
    )
    setPosition({ x: pos.x, y: pos.y })
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setVisible(true)
    }
  }, [stableTargetRect])

  useEffect(() => {
    hasInitialized.current = false
    setVisible(false)
  }, [step.id])

  useEffect(() => {
    const raf = requestAnimationFrame(() => updatePosition())
    return () => cancelAnimationFrame(raf)
  }, [updatePosition])

  const progressPercent =
    displayTotal > 0 ? (displayStep / displayTotal) * 100 : 0

  const handleNext = () => {
    setNavDirection('forward')
    onNext()
  }

  const handleBack = () => {
    setNavDirection('back')
    onBack()
  }

  const stepVariants = {
    enter: (dir: 'forward' | 'back') => ({
      y: dir === 'forward' ? 10 : -10,
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (dir: 'forward' | 'back') => ({
      y: dir === 'forward' ? -10 : 10,
      opacity: 0,
    }),
  }

  return (
    <motion.div
      ref={tooltipRef}
      className='fixed z-[202]'
      style={{
        width: 'max-content',
        maxWidth: TOOLTIP_MAX_WIDTH,
        minWidth: TOOLTIP_MIN_WIDTH,
      }}
      animate={{ x: position.x, y: position.y, opacity: visible ? 1 : 0 }}
      transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Gradient border wrapper */}
      <div className='relative rounded-2xl bg-gradient-to-br from-primary/40 via-primary/10 to-transparent p-px shadow-2xl shadow-black/40'>
        {/* Glass card */}
        <div className='relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-xl'>
          {/* Top accent line */}
          <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent' />

          {/* Subtle inner glow */}
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent' />

          <div className='relative flex flex-col gap-4 p-5'>
            {/* Header row */}
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-3'>
                {/* Glowing icon */}
                <div className='relative flex-shrink-0'>
                  <div className='absolute inset-0 rounded-xl bg-primary/30 blur-md' />
                  <div className='relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10'>
                    <Icon className='h-4 w-4 text-primary' />
                  </div>
                </div>

                {/* Animated title */}
                <AnimatePresence mode='wait' custom={navDirection}>
                  <motion.h3
                    key={step.id + '-title'}
                    custom={navDirection}
                    variants={stepVariants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className='text-sm font-semibold leading-tight text-foreground'
                  >
                    {step.title}
                  </motion.h3>
                </AnimatePresence>
              </div>

              {/* Close — onPointerDown bypasses Radix focus trap */}
              <button
                type='button'
                className='flex-shrink-0 rounded-lg p-1 opacity-40 transition-all hover:bg-primary/10 hover:opacity-100'
                onPointerDown={(e) => {
                  e.preventDefault()
                  onSkip()
                }}
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='text-foreground'
                >
                  <line x1='18' x2='6' y1='6' y2='18' />
                  <line x1='6' x2='18' y1='6' y2='18' />
                </svg>
                <span className='sr-only'>Close</span>
              </button>
            </div>

            {/* Animated description */}
            <AnimatePresence mode='wait' custom={navDirection}>
              <motion.p
                key={step.id + '-desc'}
                custom={navDirection}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.18, ease: 'easeOut', delay: 0.03 }}
                className='text-xs leading-relaxed text-muted-foreground sm:text-sm'
              >
                {step.description}
              </motion.p>
            </AnimatePresence>

            {/* Progress */}
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  {/* Animated step number */}
                  <AnimatePresence mode='wait' custom={navDirection}>
                    <motion.span
                      key={`step-num-${displayStep}`}
                      custom={navDirection}
                      variants={stepVariants}
                      initial='enter'
                      animate='center'
                      exit='exit'
                      transition={{ duration: 0.15 }}
                      className='text-xs font-semibold tabular-nums text-primary'
                    >
                      {displayStep}
                    </motion.span>
                  </AnimatePresence>
                  <span className='text-xs text-muted-foreground/60'>
                    / {displayTotal}
                  </span>
                </div>
                <span className='text-xs tabular-nums text-muted-foreground/50'>
                  {Math.round(progressPercent)}%
                </span>
              </div>

              {/* Gradient progress track */}
              <div className='h-1 w-full overflow-hidden rounded-full bg-secondary/80'>
                <motion.div
                  className='h-full rounded-full bg-gradient-to-r from-primary to-rose-400'
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Nav buttons */}
            <div className='flex items-center justify-between gap-2'>
              <button
                type='button'
                onPointerDown={(e) => {
                  if (!isFirst) {
                    e.preventDefault()
                    handleBack()
                  }
                }}
                disabled={isFirst}
                className='rounded-xl border border-border/60 bg-secondary/60 px-3.5 py-2 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30'
              >
                Back
              </button>

              <div className='flex items-center gap-2'>
                {!isLast && (
                  <button
                    type='button'
                    onPointerDown={(e) => {
                      e.preventDefault()
                      onSkip()
                    }}
                    className='px-2 py-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground'
                  >
                    Skip tour
                  </button>
                )}

                <button
                  type='button'
                  onPointerDown={(e) => {
                    e.preventDefault()
                    if (isLast) {
                      onFinish()
                    } else {
                      handleNext()
                    }
                  }}
                  className='group relative overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all'
                >
                  {/* Gradient background */}
                  <span className='absolute inset-0 bg-gradient-to-r from-primary to-rose-500 transition-opacity group-hover:opacity-90' />
                  {/* Shine sweep */}
                  <span className='absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full' />
                  <span className='relative'>{isLast ? 'Finish' : 'Next'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
