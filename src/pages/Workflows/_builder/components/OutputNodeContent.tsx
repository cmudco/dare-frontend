import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Maximize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface OutputNodeContentProps {
  response: string
  onOpenFullView: (e: React.MouseEvent) => void
  isStreaming?: boolean
}

export function OutputNodeContent({
  response,
  onOpenFullView,
  isStreaming = false,
}: OutputNodeContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const userScrolledUpRef = useRef(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Check if container is at or very near the bottom
  const isAtBottom = useCallback((): boolean => {
    const container = containerRef.current
    if (!container) return true
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom <= 10
  }, [])

  // Scroll to bottom (respects user scroll state)
  const scrollToBottom = useCallback(() => {
    if (userScrolledUpRef.current) return
    anchorRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  // Force scroll to bottom (resets user scroll state)
  const forceScrollToBottom = useCallback(() => {
    userScrolledUpRef.current = false
    setShowScrollButton(false)
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle wheel events for user scroll detection
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation() // Prevent canvas panning

      // Scrolling up - user wants to read
      if (e.deltaY < 0) {
        userScrolledUpRef.current = true
        setShowScrollButton(true)
      }

      // Scrolling down - check if at bottom to re-enable auto-scroll
      if (e.deltaY > 0) {
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

  // Auto-scroll when response changes during streaming
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom()
    }
  }, [response, isStreaming, scrollToBottom])

  // Reset scroll state when streaming starts
  useEffect(() => {
    if (isStreaming) {
      userScrolledUpRef.current = false
      setShowScrollButton(false)
    }
  }, [isStreaming])

  return (
    <div className='relative border-t border-border/30'>
      <div
        ref={containerRef}
        className='nowheel max-h-[500px] overflow-y-auto px-3 py-2'
        onWheel={handleWheel}
      >
        <div className='prose prose-sm max-w-full text-foreground dark:prose-invert prose-headings:my-2 prose-p:my-1'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
        </div>
        {/* Scroll anchor */}
        <div ref={anchorRef} />
      </div>

      {/* Scroll to bottom button - only show during streaming when user scrolled up */}
      {isStreaming && showScrollButton && (
        <button
          onClick={forceScrollToBottom}
          className='absolute bottom-12 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-md transition-all hover:bg-primary'
          title='Scroll to bottom'
        >
          <ChevronDown size={14} />
        </button>
      )}

      <div className='flex justify-end border-t border-border/30 px-3 py-1.5'>
        <button
          className='flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          onClick={onOpenFullView}
          title='Open full view'
        >
          <Maximize2 size={12} />
          <span>Full view</span>
        </button>
      </div>
    </div>
  )
}
