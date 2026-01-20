/**
 * MemoryItem Component
 *
 * Displays a single memory item with type badge, categories, and delete action.
 */
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemoryItem as MemoryItemType, MemoryType } from '@/redux/types/memory'

interface MemoryItemProps {
  item: MemoryItemType
  onDelete: (id: string) => void
  isDeleting?: boolean
}

const getTypeBadgeColor = (memoryType: string): string => {
  switch (memoryType) {
    case MemoryType.PROFILE:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case MemoryType.KNOWLEDGE:
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case MemoryType.BEHAVIOR:
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case MemoryType.EVENT:
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
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
    <div className='group flex items-start gap-4 rounded-lg border border-dark-blue/50 bg-dark-primary/50 p-4 transition-all hover:border-dark-blue hover:bg-dark-primary/80'>
      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className={`text-xs capitalize ${getTypeBadgeColor(memoryType)}`}
          >
            {memoryType}
          </Badge>
          {item.score !== undefined && (
            <Badge variant='outline' className='text-xs text-gray-400'>
              Score: {(item.score * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        <p className='text-sm text-gray-200'>{content}</p>
        {categories.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
            {categories.map((category, index) => (
              <span
                key={`${item.id}-${category}-${index}`}
                className='rounded-full bg-dark-blue/50 px-2 py-0.5 text-xs text-gray-400'
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
