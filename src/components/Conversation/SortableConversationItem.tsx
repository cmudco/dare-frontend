import React from 'react'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import { Pencil } from 'lucide-react'
import { SortableConversationItemProps } from '../../redux/types/conversation'
import { createDragStyle, getConversationItemClassName, getConversationTitle } from '../../utils/conversationUtils'

const SortableConversationItem: React.FC<SortableConversationItemProps> = ({
    conversation,
    isActive,
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
            className={getConversationItemClassName(isDragging, isActive)}
            onClick={() => onConversationClick(conversation)}
        >
            <div
                className={`flex-shrink-0 p-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                <ChatBubbleLeftEllipsisIcon className='w-5 h-5' />
            </div>

            <div className="flex-1 min-w-0 relative">
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
                        <span className='block overflow-hidden text-ellipsis whitespace-nowrap text-sm pr-2'>
                            {getConversationTitle(conversation)}
                        </span>
                        <button
                            className='absolute right-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded hover:bg-gray-100'
                            onClick={(e) => {
                                e.stopPropagation()
                                onEditClick(conversation)
                            }}
                            aria-label='Rename chat'
                        >
                            <Pencil className='h-4 w-4 text-gray-500' />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default SortableConversationItem
