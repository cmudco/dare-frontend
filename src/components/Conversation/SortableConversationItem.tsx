import React from 'react'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import {
  Pencil,
  Copy,
  MoreVertical,
  Globe,
  GitFork,
  Share2,
  Users,
} from 'lucide-react'
import { SortableConversationItemProps } from '../../redux/types/conversation'
import {
  createDragStyle,
  getConversationItemClassName,
  getConversationTitle,
} from '../../utils/conversationUtils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { features } from '@/config/environment'

const SortableConversationItem: React.FC<SortableConversationItemProps> = ({
  conversation,
  isActive,
  isSelected,
  editingId,
  editValue,
  isSharedTab = false,
  isSharedWithMeTab = false,
  onConversationClick,
  onEditClick,
  onCloneClick,
  onPublishClick,
  onForkClick,
  onShareClick,
  onManageSharesClick,
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
  } = useSortable({
    id: conversation.conversationId,
    disabled: isSharedTab || isSharedWithMeTab,
  })

  const style = createDragStyle(transform, transition, isDragging)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={getConversationItemClassName(isDragging, isActive, isSelected)}
      onClick={(e) => onConversationClick(conversation, e)}
    >
      <div className='flex flex-shrink-0 items-center gap-1'>
        {!isSharedTab && !isSharedWithMeTab && (
          <div
            className={`p-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatBubbleLeftEllipsisIcon className='h-5 w-5' />
          </div>
        )}
        {(isSharedTab || isSharedWithMeTab) && (
          <div className='p-1'>
            <ChatBubbleLeftEllipsisIcon className='h-5 w-5' />
          </div>
        )}
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
            <div className='flex items-center gap-1.5 pr-8'>
              <span className='block overflow-hidden text-ellipsis whitespace-nowrap text-sm'>
                {getConversationTitle(conversation)}
              </span>
              {/* Published badge for user's own conversations */}
              {features.enableSharing &&
                !isSharedTab &&
                conversation.isPublished && (
                  <span className='inline-flex shrink-0 items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                    Published
                  </span>
                )}
              {/* Forked badge for forked conversations */}
              {features.enableSharing &&
                !isSharedTab &&
                conversation.isForked && (
                  <span className='inline-flex shrink-0 items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                    Forked
                  </span>
                )}
            </div>
            {/* Owner email on shared tab */}
            {features.enableSharing &&
              isSharedTab &&
              conversation.ownerEmail && (
                <span className='block truncate text-[10px] text-gray-400 dark:text-slate-500'>
                  {conversation.ownerEmail}
                </span>
              )}
            {/* 3-dot dropdown menu */}
            <div className='absolute right-0 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='rounded-md bg-gray-100 p-1.5 shadow-sm transition-colors duration-150 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30'
                    onClick={(e) => e.stopPropagation()}
                    aria-label='Conversation actions'
                  >
                    <MoreVertical className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  {isSharedTab || isSharedWithMeTab ? (
                    /* Shared / Shared With Me tab actions */
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onForkClick?.(conversation)
                      }}
                    >
                      <GitFork className='mr-2 h-4 w-4' />
                      Fork & Continue
                    </DropdownMenuItem>
                  ) : (
                    /* My Conversations tab actions */
                    <>
                      {/* Only show publish option if NOT forked and sharing is enabled */}
                      {features.enableSharing && !conversation.isForked && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onPublishClick?.(conversation)
                          }}
                        >
                          <Globe className='mr-2 h-4 w-4' />
                          {conversation.isPublished ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                      )}
                      {/* Share with specific user */}
                      {features.enableSharing &&
                        conversation.canShare !== false && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onShareClick?.(conversation)
                            }}
                          >
                            <Share2 className='mr-2 h-4 w-4' />
                            Share with User
                          </DropdownMenuItem>
                        )}
                      {/* Manage shares */}
                      {features.enableSharing &&
                        conversation.canShare !== false && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onManageSharesClick?.(conversation)
                            }}
                          >
                            <Users className='mr-2 h-4 w-4' />
                            Manage Shares
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onCloneClick(conversation)
                        }}
                      >
                        <Copy className='mr-2 h-4 w-4' />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditClick(conversation)
                        }}
                      >
                        <Pencil className='mr-2 h-4 w-4' />
                        Rename
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SortableConversationItem
