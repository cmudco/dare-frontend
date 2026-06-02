import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAutoScrollReturn {
  containerRef: React.RefObject<HTMLDivElement>
  anchorRef: React.RefObject<HTMLDivElement>
  showScrollButton: boolean
  forceScrollToBottom: (behavior?: ScrollBehavior) => void
  scrollToBottom: (behavior?: ScrollBehavior) => void
  handleScrollToBottomClick: () => void
  resetUserScroll: () => void
}

export function useAutoScroll(): UseAutoScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const userScrolledUpRef = useRef<boolean>(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Check if container is at or very near the bottom
  const isAtBottom = useCallback((): boolean => {
    const container = containerRef.current
    if (!container) return true
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom <= 10
  }, [])

  // Force scroll to bottom - always scrolls, resets user scroll state
  const forceScrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const anchor = anchorRef.current
      if (!anchor) return

      userScrolledUpRef.current = false
      setShowScrollButton(false)

      requestAnimationFrame(() => {
        anchor.scrollIntoView({ behavior })
      })
    },
    []
  )

  // Normal scroll to bottom - respects user scroll state
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (userScrolledUpRef.current) return

    const anchor = anchorRef.current
    if (!anchor) return

    anchor.scrollIntoView({ behavior })
  }, [])

  // Reset user scroll state (re-enables auto-scroll)
  const resetUserScroll = useCallback(() => {
    userScrolledUpRef.current = false
    setShowScrollButton(false)
  }, [])

  // Handler for scroll-to-bottom button click
  const handleScrollToBottomClick = useCallback(() => {
    forceScrollToBottom('smooth')
  }, [forceScrollToBottom])

  // Wheel event handler - detect user scrolling
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      // deltaY < 0 means scrolling UP
      if (event.deltaY < 0) {
        userScrolledUpRef.current = true
        setShowScrollButton(true)
      }

      // Re-enable auto-scroll if user scrolls to bottom
      if (event.deltaY > 0) {
        // Small delay to let scroll position update
        requestAnimationFrame(() => {
          if (isAtBottom()) {
            userScrolledUpRef.current = false
            setShowScrollButton(false)
          }
        })
      }
    },
    [isAtBottom]
  )

  const handleScroll = useCallback(() => {
    const atBottom = isAtBottom()
    userScrolledUpRef.current = !atBottom
    setShowScrollButton(!atBottom)
  }, [isAtBottom])

  // Attach scroll listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, handleWheel])

  return {
    containerRef,
    anchorRef,
    showScrollButton,
    forceScrollToBottom,
    scrollToBottom,
    handleScrollToBottomClick,
    resetUserScroll,
  }
}
