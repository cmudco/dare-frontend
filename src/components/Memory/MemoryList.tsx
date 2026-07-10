/**
 * MemoryList Component
 *
 * Displays a list of memory items with empty state.
 */
import { Brain } from 'lucide-react'
import MemoryItem from './MemoryItem'
import { MemoryItem as MemoryItemType } from '@/redux/types/memory'

interface MemoryListProps {
  items: MemoryItemType[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

const MemoryList = ({ items, onDelete, isLoading }: MemoryListProps) => {
  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='animate-pulse rounded-lg border border-border bg-muted/30 p-4'
          >
            <div className='mb-2 h-5 w-20 rounded-sm bg-muted' />
            <div className='h-4 w-3/4 rounded-sm bg-muted/70' />
            <div className='mt-2 flex gap-2'>
              <div className='h-4 w-16 rounded-full bg-muted/70' />
              <div className='h-4 w-20 rounded-full bg-muted/70' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Filter out invalid items (empty objects without id)
  const validItems = (items ?? []).filter((item) => item && item.id)

  if (validItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center'>
        <Brain className='mb-3 h-10 w-10 text-muted-foreground' />
        <h3 className='text-lg font-medium text-foreground'>No memories yet</h3>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          Memories are extracted from your conversations and stored here. You
          can also seed demo data for testing.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {validItems.map((item) => (
        <MemoryItem key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default MemoryList
