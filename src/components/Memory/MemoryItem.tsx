/**
 * MemoryItem Component
 *
 * Displays a single memory item with type badge, categories, and delete action.
 */
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemoryItem as MemoryItemType } from '@/redux/types/memory'
import { getTypeBadgeColor } from '@/utils/memoryUtils'

interface MemoryItemProps {
  item: MemoryItemType
  onDelete: (id: string) => void
  isDeleting?: boolean
}

const MemoryItem = ({ item, onDelete, isDeleting }: MemoryItemProps) => {
  // Guard against incomplete data
  if (!item || !item.id) {
    return null
  }

  const categories = item.categories ?? []
  const content = item.content ?? 'No content'
  const memoryType = item.memoryType ?? 'unknown'

  return (
    <div className='group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent'>
      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className={`text-xs capitalize ${getTypeBadgeColor(memoryType)}`}
          >
            {memoryType}
          </Badge>
          {item.score !== undefined && (
            <Badge variant='outline' className='text-xs text-muted-foreground'>
              Score: {(item.score * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        <p className='text-sm text-foreground'>{content}</p>
        {categories.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
            {categories.map((category, index) => (
              <span
                key={`${item.id}-${category}-${index}`}
                className='rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => onDelete(item.id)}
        disabled={isDeleting}
        className='shrink-0 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100'
        title='Delete memory'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default MemoryItem
