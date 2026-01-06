import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ChatBubbleLeftEllipsisIcon,
  MoonIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AppDispatch, RootState } from '../../redux/store'
import { Conversation } from '../../redux/types/conversation'
import {
  updateActiveConversation,
  updateConversationOrder,
  toggleConversationSelection,
  clearSelectedConversations,
} from '../../redux/conversationSlice'
import {
  deleteConversation,
  updateConversation,
  updateConversationSortOrder,
  deleteMultipleConversations,
  cloneConversation,
} from '@/redux/asyncThunks/conversation'
import { toggleDarkMode } from '../../redux/themeSlice'
import { DeleteConfirmation } from '../DeleteConfirmation'
import SortableConversationItem from './SortableConversationItem'
import {
  filterConversations,
  createSortOrderUpdates,
  findConversationIndexes,
  useDragSensors,
  isDragOperationValid,
  isConversationActive,
  getConversationTitle,
} from '../../utils/conversationUtils'

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
  const [activeId, setActiveId] = useState<string | null>(null)
  const searchQuery = useSelector(
    (state: RootState) => state.conversation?.searchQuery || ''
  )
  const selectedConversations = useSelector(
    (state: RootState) => state.conversation.selectedConversations
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

  const sensors = useDragSensors()

  const bottomItems = [
    { name: 'Clear Conversation', icon: TrashIcon, action: 'clear' },
    {
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: MoonIcon,
      action: 'darkMode',
      disabled: false,
      currentTheme: isDarkMode ? 'dark' : 'light',
    },
  ]

  const filteredConversations = filterConversations(conversations, searchQuery)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (active.id !== over?.id) {
      const { oldIndex, newIndex } = findConversationIndexes(
        conversations,
        active.id,
        over?.id
      )

      if (isDragOperationValid(oldIndex, newIndex, active.id, over?.id)) {
        const newOrder = arrayMove(conversations, oldIndex, newIndex)
        const orderedIds = newOrder.map(
          (conversation) => conversation.conversationId
        )

        dispatch(updateConversationOrder(orderedIds))

        const sortOrderUpdates = createSortOrderUpdates(newOrder)

        try {
          await dispatch(updateConversationSortOrder(sortOrderUpdates))
        } catch (error) {
          console.error('Failed to update conversation sort order:', error)
        }
      }
    }
  }

  const handleConversationClick = (
    conversation: Conversation,
    event?: React.MouseEvent
  ) => {
    if (event && (event.metaKey || event.ctrlKey)) {
      // Multi-select with Cmd/Ctrl + click
      dispatch(toggleConversationSelection(conversation.conversationId))
    } else {
      dispatch(updateActiveConversation(conversation))
      dispatch(clearSelectedConversations())
    }
  }

  const handleDeleteConfirm = async () => {
    if (selectedConversations.length > 0) {
      await dispatch(deleteMultipleConversations(selectedConversations))
      navigate('/conversation')
    } else if (activeConversation) {
      await dispatch(deleteConversation(activeConversation.conversationId))
      navigate('/conversation')
    }
  }

  const handleBottomItemClick = (action?: string) => {
    if (action === 'clear') {
      if (selectedConversations.length > 0) {
        setIsDeleteConfirmOpen(true)
      } else if (activeConversation) {
        setIsDeleteConfirmOpen(true)
      }
    } else if (action === 'darkMode') {
      dispatch(toggleDarkMode())
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

  const handleCloneClick = async (conversation: Conversation) => {
    try {
      const clonedConversation = await dispatch(
        cloneConversation(conversation.conversationId)
      ).unwrap()
      dispatch(updateActiveConversation(clonedConversation))
      navigate(`/conversation/${clonedConversation.conversationId}`)
    } catch (error) {
      console.error('Error cloning conversation:', error)
    }
  }

  return (
    <TooltipProvider>
      <nav className='text-blue-gray-700 flex h-full flex-col gap-1 font-sans text-base font-normal'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className='flex h-[65vh] w-full flex-col gap-1 overflow-scroll'>
            <SortableContext
              items={filteredConversations.map((c) => c.conversationId)}
              strategy={verticalListSortingStrategy}
            >
              {filteredConversations.map((conversation) => {
                const conversationId = conversation.conversationId
                const isActive = isConversationActive(
                  conversation,
                  location.pathname
                )
                const isSelected =
                  selectedConversations.includes(conversationId)
                return (
                  <SortableConversationItem
                    key={conversationId}
                    conversation={conversation}
                    isActive={isActive}
                    isSelected={isSelected}
                    editingId={editingId}
                    editValue={editValue}
                    onConversationClick={handleConversationClick}
                    onEditClick={handleEditClick}
                    onCloneClick={handleCloneClick}
                    onEditChange={handleEditChange}
                    onEditBlur={handleEditBlur}
                    onEditKeyDown={handleEditKeyDown}
                  />
                )
              })}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className='dark:bg-dark-chat-history min-h-[48px] rounded-md border border-gray-200 bg-white px-3 py-3 opacity-95 shadow-lg dark:border-dark-icon-unselected'>
                {(() => {
                  const draggedConversation = conversations.find(
                    (c) => c.conversationId === activeId
                  )
                  return draggedConversation ? (
                    <div className='flex items-center'>
                      <ChatBubbleLeftEllipsisIcon className='mr-3 h-6 w-6 text-gray-600 dark:text-white' />
                      <span className='text-gray-900 dark:text-white'>
                        {getConversationTitle(draggedConversation)}
                      </span>
                    </div>
                  ) : null
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <hr className='mt-4 border-gray-200 dark:border-dark-icon-unselected' />
        <div className='space-y-1'>
          {bottomItems.map((item) => {
            const hasSelectedConversations = selectedConversations.length > 0
            const isDisabled =
              item.action === 'clear' &&
              !activeConversation &&
              !hasSelectedConversations
            const buttonText =
              item.action === 'clear' && hasSelectedConversations
                ? 'Clear Selected Conversations'
                : item.name

            return item.action === 'clear' ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() =>
                      !isDisabled && handleBottomItemClick(item.action)
                    }
                    className={`flex w-full items-center rounded-md p-3 text-start font-normal leading-tight text-gray-700 outline-none transition-all dark:text-white ${
                      location.pathname === item.name
                        ? 'bg-pink-50 text-primary dark:bg-dark-button-primary dark:text-white'
                        : 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-dark-icon-unselected/20 dark:hover:text-white'
                    } ${
                      isDisabled
                        ? 'cursor-not-allowed text-gray-400 line-through opacity-50 dark:text-dark-icon-unselected'
                        : 'cursor-pointer'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-5 w-5 font-bold ${
                        isDisabled
                          ? 'text-gray-400 dark:text-dark-icon-unselected'
                          : 'text-gray-700 dark:text-white'
                      }`}
                    />
                    <span className='text-gray-700 dark:text-white'>
                      {buttonText}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {TOOLTIP_CONTENT.conversations.clearConversation.title}
                    </p>
                    <p className='text-sm'>
                      {
                        TOOLTIP_CONTENT.conversations.clearConversation
                          .description
                      }
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      💡 {TOOLTIP_CONTENT.conversations.clearConversation.tip}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                key={item.name}
                onClick={() =>
                  !isDisabled && handleBottomItemClick(item.action)
                }
                className={`flex w-full items-center rounded-md p-3 text-start font-normal leading-tight text-gray-700 outline-none transition-all dark:text-white ${
                  location.pathname === item.name
                    ? 'bg-pink-50 text-primary dark:bg-dark-button-primary dark:text-white'
                    : 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-dark-icon-unselected/20 dark:hover:text-white'
                } ${
                  isDisabled
                    ? 'cursor-not-allowed text-gray-400 line-through opacity-50 dark:text-dark-icon-unselected'
                    : 'cursor-pointer'
                }`}
              >
                <item.icon
                  className={`mr-4 h-5 w-5 font-bold ${
                    isDisabled
                      ? 'text-gray-400 dark:text-dark-icon-unselected'
                      : 'text-gray-700 dark:text-white'
                  }`}
                />
                <span className='text-gray-700 dark:text-white'>
                  {buttonText}
                </span>
              </div>
            )
          })}
        </div>

        <DeleteConfirmation
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onDelete={handleDeleteConfirm}
          title={
            selectedConversations.length > 0
              ? 'Delete Conversations'
              : 'Clear Conversation'
          }
          description={
            selectedConversations.length > 0
              ? `Are you sure you want to delete ${selectedConversations.length} selected conversation${selectedConversations.length > 1 ? 's' : ''}? This action cannot be undone.`
              : 'Are you sure you want to delete this conversation? This action cannot be undone.'
          }
          itemName={
            selectedConversations.length > 0
              ? `${selectedConversations.length} conversation${selectedConversations.length > 1 ? 's' : ''}`
              : activeConversation?.title || 'New Chat'
          }
          confirmText='Delete'
        />
      </nav>
    </TooltipProvider>
  )
}

export default ConversationList
