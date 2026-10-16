import { useState } from 'react'
import { Check, History, Loader2 } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  fetchAssistantHistory,
  openAssistantThread,
} from '@/redux/asyncThunks/assistant'
import { selectAssistant } from '@/redux/assistantSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { formatRelativeDate } from '@/utils/dateUtils'

/** Past Ask DARE conversations; picking one continues it. */
export function AssistantHistoryMenu() {
  const dispatch = useAppDispatch()
  const { history, historyStatus, threadId, isAnswering } =
    useAppSelector(selectAssistant)
  const [open, setOpen] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) dispatch(fetchAssistantHistory())
  }

  const handleSelect = (id: number) => {
    setOpen(false)
    if (id !== threadId) dispatch(openAssistantThread(id))
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={isAnswering}
          className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
          aria-label='Conversation history'
          title='Conversation history'
        >
          <History className='h-4 w-4' />
        </button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-1'>
        <p className='px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground'>
          Past conversations
        </p>
        {historyStatus === 'loading' && history.length === 0 ? (
          <div className='flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            Loading…
          </div>
        ) : historyStatus === 'failed' ? (
          <p className='px-2 py-4 text-xs text-destructive'>
            Could not load your conversations.
          </p>
        ) : history.length === 0 ? (
          <p className='px-2 py-4 text-xs text-muted-foreground'>
            No past conversations yet.
          </p>
        ) : (
          <ul className='max-h-80 overflow-y-auto'>
            {history.map((thread) => {
              const current = thread.id === threadId
              return (
                <li key={thread.id}>
                  <button
                    type='button'
                    onClick={() => handleSelect(thread.id)}
                    aria-current={current}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent',
                      current && 'bg-accent'
                    )}
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm text-foreground'>
                        {thread.title || 'Untitled conversation'}
                      </span>
                      <span className='block text-[11px] text-muted-foreground'>
                        {formatRelativeDate(thread.lastMessageAt)}
                      </span>
                    </span>
                    {current && (
                      <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary' />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
