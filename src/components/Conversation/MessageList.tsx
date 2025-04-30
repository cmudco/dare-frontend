import { useSelector } from 'react-redux'
import { useEffect, useRef, useCallback } from 'react'
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

  // Scroll to bottom utility
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Callback for when mermaid SVG is rendered
  const handleContentRendered = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    <div className='flex max-h-[90%] flex-col gap-2 overflow-y-auto pt-2'>
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
