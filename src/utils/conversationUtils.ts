import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Conversation, ConversationSortOrder } from '@/redux/types/conversation'

/**
 * Filters conversations based on search query
 */
export const filterConversations = (
  conversations: Conversation[],
  searchQuery: string
): Conversation[] => {
  return conversations.filter((conversation) => {
    const title = conversation.title || 'New Chat'
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })
}

/**
 * Creates sort order updates for backend persistence
 */
export const createSortOrderUpdates = (
  conversations: Conversation[]
): ConversationSortOrder[] => {
  return conversations.map((conversation, index) => ({
    conversationId: conversation.conversationId,
    sortOrder: (index + 1) * 10,
  }))
}

/**
 * Finds the old and new indexes for drag operations
 */
export const findConversationIndexes = (
  conversations: Conversation[],
  activeId: string | number,
  overId: string | number | undefined
): { oldIndex: number; newIndex: number } => {
  const oldIndex = conversations.findIndex(
    (conversation) => conversation.conversationId === activeId
  )
  const newIndex = conversations.findIndex(
    (conversation) => conversation.conversationId === overId
  )

  return { oldIndex, newIndex }
}

/**
 * Custom hook that creates configured sensors for drag and drop operations
 */
export const useDragSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
}

/**
 * Checks if a drag operation is valid
 */
export const isDragOperationValid = (
  oldIndex: number,
  newIndex: number,
  activeId: string | number | undefined,
  overId: string | number | undefined
): boolean => {
  return activeId !== overId && oldIndex !== -1 && newIndex !== -1
}

/**
 * Gets the conversation title with fallback
 */
export const getConversationTitle = (conversation: Conversation): string => {
  return conversation.title || 'New Chat'
}

/**
 * Checks if conversation is active based on current path
 */
export const isConversationActive = (
  conversation: Conversation,
  currentPath: string
): boolean => {
  return currentPath === `/conversation/${conversation.conversationId}`
}

/**
 * Creates the drag style for sortable items
 */
export const createDragStyle = (
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
  transition: string | undefined,
  isDragging: boolean
) => ({
  transform: CSS.Transform.toString(transform),
  transition: isDragging ? 'none' : transition,
  opacity: isDragging ? 0.8 : 1,
  zIndex: isDragging ? 999 : 'auto',
})

/**
 * Gets the className for conversation item based on state
 */
export const getConversationItemClassName = (
  isDragging: boolean,
  isActive: boolean,
  isSelected?: boolean
): string => {
  const baseClasses =
    'group flex w-full items-center gap-2 rounded-md px-3 py-3 text-start leading-tight outline-hidden transition-all min-h-[48px] cursor-pointer'
  const dragClasses = isDragging ? 'shadow-lg scale-105 bg-muted/50' : ''
  const selectedClasses = isSelected
    ? 'bg-blue-50 border-2 border-blue-300'
    : ''
  const activeClasses =
    isActive && !isSelected
      ? 'bg-pink-50 dark:bg-dare-gradient dark:text-white text-primary'
      : !isSelected
        ? 'hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 active:bg-blue-50 active:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white dark:focus:bg-white/10 dark:active:bg-white/10'
        : ''

  return `${baseClasses} ${dragClasses} ${selectedClasses} ${activeClasses}`.trim()
}
