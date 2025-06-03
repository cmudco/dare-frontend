import React from 'react'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import { Pencil } from 'lucide-react'
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
      <div className='flex flex-shrink-0 items-center gap-2'>
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
            className='w-full rounded border bg-white px-2 py-1 text-sm shadow outline-none'
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
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 rounded-md bg-white p-1.5 opacity-0 shadow-sm transition-opacity duration-150 hover:bg-gray-100 group-hover:opacity-100'
              onClick={(e) => {
                e.stopPropagation()
                onEditClick(conversation)
              }}
              aria-label='Rename chat'
            >
              <Pencil className='h-4 w-4 text-gray-600' />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default SortableConversationItem
