import { FolderMinus, MessageSquare, MoreHorizontal, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeDate } from '@/utils/dateUtils'
import { getConversationTitle } from '@/utils/conversationUtils'
import type { Conversation } from '@/redux/types/conversation'

interface Props {
  conversations: Conversation[]
  onOpen: (conversation: Conversation) => void
  onRemove: (conversation: Conversation) => void
  onAddExisting: () => void
}

const ProjectChatList = ({
  conversations,
  onOpen,
  onRemove,
  onAddExisting,
}: Props) => (
  <ul className='flex flex-col'>
    <li>
      <button
        onClick={onAddExisting}
        className='flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-muted'>
          <Plus className='h-4 w-4' />
        </span>
        Add existing chats
      </button>
    </li>
    {conversations.map((conversation) => {
      const title = getConversationTitle(conversation)
      return (
        <li
          key={conversation.conversationId}
          className='group relative border-t border-border'
        >
          <button
            onClick={() => onOpen(conversation)}
            className='flex w-full items-center gap-3 rounded-xl px-3 py-3 pr-12 text-left transition-colors hover:bg-accent focus:outline-hidden focus-visible:bg-accent'
          >
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground'>
              <MessageSquare className='h-4 w-4' />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-medium'>
                {title}
              </span>
              <span className='block text-xs text-muted-foreground'>
                {formatRelativeDate(conversation.createdAt)}
              </span>
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={`Actions for ${title}`}
                className='absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-100 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-foreground data-[state=open]:opacity-100 sm:opacity-0'
              >
                <MoreHorizontal className='h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onSelect={() => onRemove(conversation)}>
                <FolderMinus className='mr-2 h-4 w-4' />
                Remove from project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      )
    })}
  </ul>
)

export default ProjectChatList
