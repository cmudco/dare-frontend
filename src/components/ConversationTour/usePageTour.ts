import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { closeConversationTour } from '@/redux/conversationTourSlice'
import { getPageTourSteps, type PageTourStep } from './pageTourSteps'
import type { TargetRect } from './conversationTourSteps'

const SPOTLIGHT_PADDING = 3

export default function usePageTour() {
  const dispatch = useAppDispatch()
  const activePage = useAppSelector(
    (state) => state.conversationTour.activePage
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [skipAnimation, setSkipAnimation] = useState(false)
  const rafRef = useRef<number>(0)

  const tourSteps: PageTourStep[] = useMemo(
    () => (activePage ? getPageTourSteps(activePage) : []),
    [activePage]
  )

  // Reset step index when page changes
  useEffect(() => {
    setCurrentStepIndex(0)
    setTargetRect(null)
  }, [activePage])

  const step = tourSteps[currentStepIndex] || null
  const totalSteps = tourSteps.length
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === totalSteps - 1

  const displayStepIndex = currentStepIndex
  const displayTotalSteps = totalSteps - 1

  const measureTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null)
      return
    }

    const el = document.querySelector(step.target)
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return

    setTargetRect({
      x: rect.x - SPOTLIGHT_PADDING,
      y: rect.y - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    })
  }, [step?.target])

  const prepareStep = useCallback(
    (stepIndex: number) => {
      const nextStep = tourSteps[stepIndex]
      setTimeout(() => {
        if (nextStep?.target) {
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

  // Poll for target element
  useEffect(() => {
    const target = step?.target
    if (!target) {
      setTargetRect(null)
      return
    }

    let cancelled = false
    let scrolled = false
    let attempts = 0
    const maxAttempts = 15

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
  }, [currentStepIndex, measureTarget, step?.target])

  // Re-measure on resize and scroll
  useEffect(() => {
    const raf = rafRef.current
    const handleUpdate = () => measureTarget()
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)
    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
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
    hasSteps: tourSteps.length > 0,
    next,
    back,
    skip,
    finish,
    close,
  }
}
