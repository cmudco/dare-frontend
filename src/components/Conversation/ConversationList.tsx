import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { AppDispatch, RootState } from '../../redux/store'
import { Conversation } from '../../redux/types/conversation'
import { updateActiveConversation } from '../../redux/conversationSlice'
import { deleteConversation } from '@/redux/aynscThunks/conversation'
import { DeleteConfirmation } from '../DeleteConfirmation'

const ConversationList: React.FC = () => {
  const location = useLocation()
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  )
  const activeConversation = useSelector(
    (state: RootState) => state.conversation.activeConversation
  )
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )

  const bottomItems = [
    { name: 'Clear Conversation', icon: TrashIcon, action: 'clear' },
    { name: 'Dark Mode', icon: MoonIcon },
  ]

  const filteredConversations = conversations.filter((conversation) => {
    const title = conversation.title || 'New Chat'
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleConversationClick = (conversation: Conversation) => {
    dispatch(updateActiveConversation(conversation))
  }

  const handleBottomItemClick = (action?: string) => {
    if (action === 'clear' && activeConversation) {
      setIsDeleteConfirmOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    const conversationId = activeConversation?.conversationId
    if (conversationId) {
      await dispatch(deleteConversation(conversationId))
      navigate('/conversation')
    }
  }

  return (
    <nav className='text-blue-gray-700 flex h-full flex-col gap-1 font-sans text-base font-normal'>
      <div className='flex h-[65vh] w-full flex-col overflow-scroll'>
        {filteredConversations.map((conversation) => {
          const conversationId = conversation.conversationId
          const isActive =
            location.pathname === `/conversation/${conversationId}`
          return (
            <div
              key={conversationId}
              onClick={() => handleConversationClick(conversation)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-md p-3 text-start leading-tight outline-none transition-all ${
                isActive
                  ? 'bg-pink-50 text-primary'
                  : 'focus:bg-blue-gray-50 focus:text-blue-gray-900 active:bg-blue-gray-50 active:text-blue-gray-900 hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-opacity-80 active:bg-opacity-80'
              }`}
            >
              <div>
                <ChatBubbleLeftEllipsisIcon className='w-6 font-bold' />
              </div>
              {conversation.title || `New Chat`}
            </div>
          )
        })}
      </div>
      <hr className='mt-4 border-gray-200' />
      <div className=''>
        {bottomItems.map((item) => {
          const isDisabled = item.action === 'clear' && !activeConversation
          return (
            <div
              key={item.name}
              onClick={() => !isDisabled && handleBottomItemClick(item.action)}
              className={`flex w-full items-center rounded-md p-3 text-start font-normal leading-tight outline-none transition-all ${
                location.pathname === item.name
                  ? 'bg-pink-50 text-primary'
                  : 'hover:bg-blue-gray-50 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:text-blue-gray-900 active:bg-blue-gray-50 active:text-blue-gray-900 hover:bg-opacity-80 focus:bg-opacity-80 active:bg-opacity-80'
              } ${
                isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <item.icon className='mr-4 h-5 w-5 font-bold' />
              {item.name}
            </div>
          )
        })}
      </div>

      <DeleteConfirmation
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onDelete={handleDeleteConfirm}
        title='Clear Conversation'
        description='Are you sure you want to delete this conversation? This action cannot be undone.'
        itemName={activeConversation?.title || 'New Chat'}
        confirmText='Delete'
      />
    </nav>
  )
}

export default ConversationList
