import { useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import { RootState } from '../../redux/store'
import Message from './Message'

const MessageList = () => {
  const messages = useSelector(
    (state: RootState) => state.conversation.activeConversationMessages
  )
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className='flex max-h-[90%] flex-col gap-2 overflow-y-auto pt-2'>
      {messages.map(
        (message, idx) => message && <Message key={idx} message={message} />
      )}
      <div ref={messageEndRef} />
    </div>
  )
}

export default MessageList
