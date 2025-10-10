import { useSelector } from 'react-redux'
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { RootState } from '../../redux/store'
import Message from './Message'

const MessageList = ({
  onEditMessage,
}: {
  onEditMessage?: (id: string, content: string) => void
}) => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const messageEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isStreaming = useMemo(() => {
    const last = messages[messages.length - 1]
    return Boolean(last?.streaming)
  }, [messages])

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    const anchor = messageEndRef.current
    if (!container || !anchor) return

    const threshold = 120 //pixels
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight

    if (distanceFromBottom <= threshold) {
      anchor.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' })
    }
  }, [isStreaming])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleContentRendered = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    <div
      ref={containerRef}
      className='flex max-h-[90%] flex-col gap-2 overflow-y-auto pt-2'
    >
      {messages.map(
        (message, idx) =>
          message && (
            <Message
              key={idx}
              message={message}
              onEditMessage={onEditMessage}
              onContentRendered={handleContentRendered}
            />
          )
      )}
      <div ref={messageEndRef} />
    </div>
  )
}

export default MessageList
