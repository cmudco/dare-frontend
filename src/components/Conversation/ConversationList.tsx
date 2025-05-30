import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
  // MoonIcon,
} from '@heroicons/react/24/outline'
import { AppDispatch, RootState } from '../../redux/store'
import { Conversation } from '../../redux/types/conversation'
import { updateActiveConversation } from '../../redux/conversationSlice'
import {
  deleteConversation,
  updateConversation,
} from '@/redux/aynscThunks/conversation'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { Pencil } from 'lucide-react'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )

  const bottomItems = [
    { name: 'Clear Conversation', icon: TrashIcon, action: 'clear' },
    // { name: 'Dark Mode', icon: MoonIcon, disabled: true },
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

  const handleEditClick = (conversation: Conversation) => {
    setEditingId(conversation.conversationId)
    setEditValue(conversation.title || 'New Chat')
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleEditBlur = async () => {
    if (editingId && editValue.trim()) {
      const conversation = conversations.find(
        (c) => c.conversationId === editingId
      )
      if (conversation && editValue !== conversation.title) {
        await dispatch(
          updateConversation({
            conversationId: conversation.conversationId,
            updates: { title: editValue.trim() },
          })
        )
      }
    }
    setEditingId(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setEditingId(null)
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
              className={`group flex w-full cursor-pointer items-center gap-3 rounded-md p-3 text-start leading-tight outline-none transition-all ${
                isActive
                  ? 'bg-pink-50 text-primary'
                  : 'focus:bg-blue-gray-50 focus:text-blue-gray-900 active:bg-blue-gray-50 active:text-blue-gray-900 hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-opacity-80 active:bg-opacity-80'
              }`}
            >
              <div>
                <ChatBubbleLeftEllipsisIcon className='w-6 font-bold' />
              </div>
              <span
                className='relative flex h-6 flex-1 items-center overflow-hidden'
                style={{ direction: 'ltr' }}
              >
                {editingId === conversationId ? (
                  <input
                    className='flex-1 rounded border bg-white px-2 py-1 text-sm shadow outline-none'
                    value={editValue}
                    autoFocus
                    onChange={handleEditChange}
                    onBlur={handleEditBlur}
                    onKeyDown={handleEditKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    style={{ minWidth: 0 }}
                  />
                ) : (
                  <>
                    <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                      {conversation.title || `New Chat`}
                    </span>
                    {editingId !== conversationId && (
                      <button
                        className='absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded bg-white p-1 opacity-0 shadow transition-opacity hover:bg-gray-200 group-hover:opacity-100'
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditClick(conversation)
                        }}
                        aria-label='Rename chat'
                        tabIndex={-1}
                      >
                        <Pencil className='h-4 w-4' />
                      </button>
                    )}
                  </>
                )}
              </span>
            </div>
          )
        })}
      </div>
      <hr className='mt-4 border-gray-200' />
      <div className=''>
        {bottomItems.map((item) => {
          const isDisabled = item.action === 'clear' && !activeConversation
          // || item.disabled === true (temporarily disabled Dark Mode)
          return (
            <div
              key={item.name}
              onClick={() => !isDisabled && handleBottomItemClick(item.action)}
              className={`flex w-full items-center rounded-md p-3 text-start font-normal leading-tight outline-none transition-all ${
                location.pathname === item.name
                  ? 'bg-pink-50 text-primary'
                  : 'hover:bg-blue-gray-50 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:text-blue-gray-900 active:bg-blue-gray-50 active:text-blue-gray-900 hover:bg-opacity-80 focus:bg-opacity-80 active:bg-opacity-80'
              } ${
                isDisabled
                  ? 'cursor-not-allowed text-gray-400 line-through opacity-50'
                  : 'cursor-pointer'
              }`}
            >
              <item.icon
                className={`mr-4 h-5 w-5 font-bold ${
                  isDisabled ? 'text-gray-400' : ''
                }`}
              />
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
