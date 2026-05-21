import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import {
  closeConversationTour,
  openConversationTour,
  CONVERSATION_TOUR_COMPLETED_KEY,
} from '@/redux/conversationTourSlice'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import {
  buildConversationTourSteps,
  type TargetRect,
} from './conversationTourSteps'

const SPOTLIGHT_PADDING = 3

export default function useConversationTour() {
  const dispatch = useAppDispatch()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [skipAnimation, setSkipAnimation] = useState(false)
  const rafRef = useRef<number>(0)
  const enableMcp = useFeatureFlag('enableMcp')

  const tourSteps = useMemo(
    () => buildConversationTourSteps(enableMcp),
    [enableMcp]
  )

  const step = tourSteps[currentStepIndex]
  const totalSteps = tourSteps.length
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === totalSteps - 1

  // Welcome step (index 0) is excluded from the step counter display
  const displayStepIndex = currentStepIndex
  const displayTotalSteps = totalSteps - 1

  const measureTarget = useCallback(() => {
    if (!step.target) {
      setTargetRect(null)
      return
    }

    const el = document.querySelector(step.target)
    if (!el) {
      // Keep previous rect so tooltip stays in place while element loads
      return
    }

    const rect = el.getBoundingClientRect()
    // Skip zero-size rects — element may be hidden or not yet laid out
    if (rect.width < 1 || rect.height < 1) {
      return
    }

    setTargetRect({
      x: rect.x - SPOTLIGHT_PADDING,
      y: rect.y - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    })
  }, [step.target])

  const prepareStep = useCallback(
    (stepIndex: number) => {
      const nextStep = tourSteps[stepIndex]
      // Scroll target into view after layout settles
      setTimeout(() => {
        if (nextStep.target) {
          const el = document.querySelector(nextStep.target)
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'center' })
          }
        }
      }, 200)
    },
    [tourSteps]
  )

  const close = useCallback(() => {
    dispatch(closeConversationTour())
    setCurrentStepIndex(0)
    setTargetRect(null)
    const raf = rafRef.current
    if (raf) cancelAnimationFrame(raf)
  }, [dispatch])

  const next = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1
      setSkipAnimation(false)
      prepareStep(nextIndex)
      setCurrentStepIndex(nextIndex)
    }
  }, [currentStepIndex, totalSteps, prepareStep])

  const back = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setSkipAnimation(false)
      prepareStep(prevIndex)
      setCurrentStepIndex(prevIndex)
    }
  }, [currentStepIndex, prepareStep])

  const skip = useCallback(() => close(), [close])
  const finish = useCallback(() => close(), [close])

  // Poll for target element — handles elements that appear after async loads
  useEffect(() => {
    const target = step.target
    if (!target) {
      setTargetRect(null)
      return
    }

    let cancelled = false
    let scrolled = false
    let attempts = 0
    const maxAttempts = 15 // poll for ~3s

    const tryMeasure = () => {
      if (cancelled) return

      const el = document.querySelector(target)
      if (el) {
        if (!scrolled) {
          scrolled = true
          const savedScrollY = window.scrollY
          el.scrollIntoView({ behavior: 'instant', block: 'nearest' })
          if (window.scrollY !== savedScrollY) {
            window.scrollTo({ top: savedScrollY, behavior: 'instant' })
          }
        }
        measureTarget()
      }

      attempts++
      if (attempts < maxAttempts && !cancelled) {
        setTimeout(tryMeasure, 200)
      }
    }

    const timer = setTimeout(tryMeasure, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [currentStepIndex, measureTarget, step.target])

  // Re-measure on resize and scroll
  useEffect(() => {
    const handleUpdate = () => measureTarget()

    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)

    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const raf = rafRef.current
      if (raf) cancelAnimationFrame(raf)
    }
  }, [measureTarget])

  return {
    step,
    currentStepIndex,
    totalSteps,
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
    close,
  }
}

export function useConversationTourAutoTrigger(): void {
  const dispatch = useAppDispatch()
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    const completed = localStorage.getItem(CONVERSATION_TOUR_COMPLETED_KEY)
    if (completed === 'true') return

    const timer = setTimeout(() => {
      if (hasFired.current) return
      hasFired.current = true
      dispatch(openConversationTour())
    }, 1500)

    return () => clearTimeout(timer)
  }, [dispatch])
}
