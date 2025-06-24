import { useDispatch, useSelector } from 'react-redux'
import {
  updateConversationInput,
  updateActiveConversation,
  updateSelectedTags,
} from '../../redux/conversationSlice'
import { AppDispatch, RootState } from '../../redux/store'
import ModelPicker from './ModelPicker'
import PromptSet from './PromptSet'
import { Message } from '../../redux/types/conversation'
import { useNavigate } from 'react-router-dom'
import {
  sendMessage,
  createConversation,
} from '../../redux/asyncThunks/conversation'
import ConversationFileSelect from './ConversationFileSelect'
import ModelConfigurationPanel from './ModelConfigurationPanel'
import { ArrowUp, Pencil, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConversationPillProps {
  editMessageId?: string | null
  onCancelEdit?: () => void
}

const ConversationPill: React.FC<ConversationPillProps> = ({
  editMessageId,
  onCancelEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const conversationInput = useSelector(
    (state: RootState) => state.conversation.conversationInput
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateConversationInput(event.target.value))
  }

  const handleSendMessage = () => {
    if (conversationInput.trim() === '') return

    const newMessage: Partial<Message> = {
      message: conversationInput,
    }

    if (!activeConversation) {
      dispatch(updateSelectedTags([]))
      dispatch(createConversation())
        .unwrap()
        .then((newConversation) => {
          dispatch(updateActiveConversation(newConversation))
          navigate(`/conversation/${newConversation.conversationId}`)
        })
        .catch((error) => {
          console.error('Error creating conversation:', error)
        })
    } else {
      dispatch(sendMessage(newMessage))
      dispatch(updateConversationInput(''))
      if (editMessageId && onCancelEdit) {
        onCancelEdit()
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }
  }, [conversationInput])

  return (
    <>
      <div className='flex w-[90%] flex-col justify-end rounded-2xl border-2 border-gray-200 dark:border-dark-icon-unselected dark:bg-transparent'>
        {editMessageId && (
          <div className='mb-2 flex w-full items-center gap-2 rounded-b-sm rounded-t-2xl border-b bg-gray-100 px-6 py-3 dark:bg-dark-bg'>
            <Pencil className='mr-1 h-4 w-4 text-gray-600 dark:text-dark-icon-unselected' />
            <span className='flex-1 text-base font-bold text-gray-700 dark:text-white'>
              Editing message
            </span>
            <button
              onClick={onCancelEdit}
              className='ml-2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-dark-icon-unselected/20'
            >
              <X className='-mr-2 h-5 w-5 text-gray-500 dark:text-dark-icon-unselected' />
            </button>
          </div>
        )}
        <div className='relative flex w-full items-center rounded-md px-4'>
          <textarea
            ref={textareaRef}
            value={conversationInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder='Type message'
            className='h-14 w-full resize-none overflow-y-auto rounded-2xl py-4 pl-2 pr-12 text-sm font-normal focus:outline-none dark:bg-transparent dark:text-white dark:placeholder-dark-icon-unselected'
            rows={1}
            style={{ minHeight: '3.5rem', maxHeight: '10rem' }}
          />
          <div
            className='absolute right-[16px] top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-dark-icon-unselected/30 dark:hover:bg-dark-icon-unselected/50'
            onClick={handleSendMessage}
            aria-label='Send message'
          >
            <ArrowUp className='h-4 w-4 text-gray-600 dark:text-white' />
          </div>
        </div>

        <div className='relative mb-1 flex w-full items-center justify-between px-4'>
          <div className='flex w-full items-center gap-2'>
            <ConversationFileSelect />
            <PromptSet />
            <div className='h-8 w-[2px] rounded-lg bg-gray-300'></div>
            <ModelPicker />
          </div>
          <ModelConfigurationPanel />
        </div>
      </div>
      <p className='mt-2 text-center text-sm text-gray-500'>
        DARE Chat can make mistakes. Check important information.
      </p>
    </>
  )
}

export default ConversationPill
