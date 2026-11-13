import { Image as ImageIcon, Pencil, X, Zap } from 'lucide-react'
import type { QueuedMessage } from '@/redux/messageQueueSlice'

interface MessageQueueTrayProps {
  queue: QueuedMessage[]
  paused: boolean
  onSendNow: (queued: QueuedMessage) => void
  onEdit: (queued: QueuedMessage) => void
  onRemove: (queued: QueuedMessage) => void
  onResume: () => void
}

const actionButtonClass =
  'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

const MessageQueueTray: React.FC<MessageQueueTrayProps> = ({
  queue,
  paused,
  onSendNow,
  onEdit,
  onRemove,
  onResume,
}) => {
  if (queue.length === 0) return null

  return (
    <div className='border-b border-border' aria-label='Queued messages'>
      <div className='flex items-center justify-between px-4 pt-2 pb-1 text-xs text-muted-foreground'>
        <span aria-live='polite'>
          {paused ? 'Queue paused' : `${queue.length} queued`}
        </span>
        {paused ? (
          <button
            type='button'
            onClick={onResume}
            className='cursor-pointer rounded-md border border-border px-2.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
          >
            Resume
          </button>
        ) : (
          <span>Sends when the reply finishes</span>
        )}
      </div>
      <ol className='max-h-40 overflow-y-auto'>
        {queue.map((queued, index) => (
          <li
            key={queued.id}
            className='flex items-center gap-2 border-t border-border/60 px-4 py-1.5 text-sm first:border-t-0'
          >
            <span className='w-4 shrink-0 text-xs text-muted-foreground'>
              {index + 1}
            </span>
            {queued.images.length > 0 && (
              <span
                className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground'
                title={`${queued.images.length} attached`}
              >
                <ImageIcon className='h-3.5 w-3.5' />
                {queued.images.length}
              </span>
            )}
            <span className='min-w-0 flex-1 truncate text-foreground'>
              {queued.text}
            </span>
            <button
              type='button'
              className={actionButtonClass}
              onClick={() => onSendNow(queued)}
              aria-label='Send now'
              title='Send now (stops the current reply)'
            >
              <Zap className='h-4 w-4' />
            </button>
            <button
              type='button'
              className={actionButtonClass}
              onClick={() => onEdit(queued)}
              aria-label='Edit queued message'
              title='Edit'
            >
              <Pencil className='h-4 w-4' />
            </button>
            <button
              type='button'
              className={actionButtonClass}
              onClick={() => onRemove(queued)}
              aria-label='Remove from queue'
              title='Remove'
            >
              <X className='h-4 w-4' />
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default MessageQueueTray
