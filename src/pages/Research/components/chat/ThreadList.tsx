import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { ResearchThread } from '@/redux/types/research'

interface Props {
  threads: ResearchThread[]
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  creating: boolean
}

const ThreadList = ({
  threads,
  activeId,
  onSelect,
  onNew,
  creating,
}: Props) => (
  <aside className='flex min-h-0 flex-col lg:w-56 lg:shrink-0'>
    <Button
      size='sm'
      variant='outline'
      onClick={onNew}
      disabled={creating}
      className='justify-start'
    >
      <MessageSquarePlus className='h-4 w-4' /> New thread
    </Button>
    <ul className='mt-3 flex gap-1 overflow-x-auto pb-1 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto'>
      {threads.map((thread) => (
        <li key={thread.id} className='shrink-0 lg:shrink'>
          <button
            type='button'
            onClick={() => onSelect(thread.id)}
            className={cn(
              'w-full max-w-56 rounded-lg px-3 py-2 text-left transition-colors',
              thread.id === activeId
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <p className='truncate text-sm font-medium'>
              {thread.title || 'New thread'}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {formatRelativeDate(thread.lastRunAt ?? thread.createdAt)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  </aside>
)

export default ThreadList
