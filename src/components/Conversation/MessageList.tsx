import { useSelector } from 'react-redux'
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { RootState } from '../../redux/store'
import Message from './Message'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { cn } from '@/lib/utils'

interface MessageListProps {
  onEditMessage?: (id: string, content: string) => void
  shouldShowAutoFeedbackModal?: boolean
  conversationId?: string
  userJustSentMessage?: boolean
}

const MessageList = ({
  onEditMessage,
  shouldShowAutoFeedbackModal,
  conversationId,
  userJustSentMessage,
}: MessageListProps) => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const historySidebarCollapsed = useSelector(
    (state: RootState) => state.conversation.historySidebarCollapsed
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

  // Force scroll when user sends a message
  useEffect(() => {
    if (userJustSentMessage) {
      forceScrollToBottom('smooth')
    }
  }, [userJustSentMessage, forceScrollToBottom])

  const handleContentRendered = useCallback(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth')
  }, [scrollToBottom, isStreaming])

  return (
    <div
      ref={containerRef}
      className='flex max-h-[90%] flex-col gap-2 overflow-y-auto pt-2'
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

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottomClick}
          className={cn(
            'fixed bottom-32 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl',
            historySidebarCollapsed ? 'right-20' : 'right-[300px]'
          )}
          aria-label='Scroll to bottom'
        >
          <ChevronDown className='mx-auto h-5 w-5' />
        </button>
      )}
    </div>
  )
}

export default MessageList
