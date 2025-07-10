import React from 'react'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import { Pencil, Copy } from 'lucide-react'
import { SortableConversationItemProps } from '../../redux/types/conversation'
import {
  createDragStyle,
  getConversationItemClassName,
  getConversationTitle,
} from '../../utils/conversationUtils'

const SortableConversationItem: React.FC<SortableConversationItemProps> = ({
  conversation,
  isActive,
  isSelected,
  editingId,
  editValue,
  onConversationClick,
  onEditClick,
  onCloneClick,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: conversation.conversationId })

  const style = createDragStyle(transform, transition, isDragging)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={getConversationItemClassName(isDragging, isActive, isSelected)}
      onClick={(e) => onConversationClick(conversation, e)}
    >
      <div className='flex flex-shrink-0 items-center gap-1'>
        <div
          className={`p-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <ChatBubbleLeftEllipsisIcon className='h-5 w-5' />
        </div>
      </div>

      <div className='relative min-w-0 flex-1'>
        {editingId === conversation.conversationId ? (
          <input
            className='w-full rounded border bg-white px-2 py-1 text-sm shadow outline-none dark:border-dark-icon-unselected dark:bg-transparent dark:text-white'
            value={editValue}
            autoFocus
            onChange={onEditChange}
            onBlur={onEditBlur}
            onKeyDown={onEditKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span className='block overflow-hidden text-ellipsis whitespace-nowrap pr-2 text-sm'>
              {getConversationTitle(conversation)}
            </span>
            <div className='absolute right-0 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
              <button
                className='rounded-md bg-gray-100 p-1.5 shadow-sm transition-colors duration-150 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30'
                onClick={(e) => {
                  e.stopPropagation()
                  onCloneClick(conversation)
                }}
                aria-label='Clone chat'
              >
                <Copy className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
              </button>
              <button
                className='rounded-md bg-gray-100 p-1.5 shadow-sm transition-colors duration-150 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30'
                onClick={(e) => {
                  e.stopPropagation()
                  onEditClick(conversation)
                }}
                aria-label='Rename chat'
              >
                <Pencil className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SortableConversationItem
