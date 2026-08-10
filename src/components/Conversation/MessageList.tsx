import { useSelector } from 'react-redux'
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { RootState } from '../../redux/store'
import Message from './Message'
import { useAutoScroll } from '../../hooks/useAutoScroll'

interface MessageListProps {
  onEditMessage?: (id: string, content: string) => void
  shouldShowAutoFeedbackModal?: boolean
  conversationId?: string
  scrollToBottomRequest?: number
}

const MessageList = ({
  onEditMessage,
  shouldShowAutoFeedbackModal,
  conversationId,
  scrollToBottomRequest = 0,
}: MessageListProps) => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )

  const {
    containerRef,
    anchorRef,
    showScrollButton,
    forceScrollToBottom,
    scrollToBottom,
    handleScrollToBottomClick,
  } = useAutoScroll()

  const prevConversationIdRef = useRef<string | undefined>(conversationId)

  const isStreaming = useMemo(() => {
    const last = messages[messages.length - 1]
    return Boolean(last?.streaming)
  }, [messages])

  // Force scroll on conversation switch
  useEffect(() => {
    if (conversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = conversationId
      // Small delay to allow messages to render
      requestAnimationFrame(() => {
        forceScrollToBottom('auto')
      })
    }
  }, [conversationId, forceScrollToBottom])

  // Scroll on new messages - respects user scroll state
  useEffect(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth')
  }, [messages, scrollToBottom, isStreaming])

  // A send request originates from the composer, so it cannot be missed if
  // user and assistant socket messages arrive in the same render.
  useEffect(() => {
    if (scrollToBottomRequest > 0) forceScrollToBottom('auto')
  }, [scrollToBottomRequest, forceScrollToBottom])

  const handleContentRendered = useCallback(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth')
  }, [scrollToBottom, isStreaming])

  return (
    <div className='relative min-h-0 flex-1'>
      <div
        ref={containerRef}
        className='flex h-full min-w-0 flex-col gap-2 overflow-y-auto pt-2'
      >
        {messages.map((message, idx) => {
          const isLastMessage = idx === messages.length - 1

          return (
            message && (
              <Message
                key={message.id || idx}
                message={message}
                onEditMessage={onEditMessage}
                onContentRendered={handleContentRendered}
                shouldShowAutoFeedback={
                  shouldShowAutoFeedbackModal && isLastMessage
                }
              />
            )
          )
        })}
        <div ref={anchorRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottomClick}
          className='absolute right-4 bottom-4 z-30 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl'
          aria-label='Scroll to bottom'
        >
          <ChevronDown className='mx-auto h-5 w-5' />
        </button>
      )}
    </div>
  )
}

export default MessageList
