import React from 'react'
import { GitFork, Loader2, Share2 } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { SharedItem, ShareableEntityType } from '@/redux/types/sharing'

interface SharedWithMeListProps {
  entityType: ShareableEntityType
  onItemClick?: (item: SharedItem) => void
  onForkClick?: (item: SharedItem) => void
}

const SharedWithMeList: React.FC<SharedWithMeListProps> = ({
  entityType,
  onItemClick,
  onForkClick,
}) => {
  const { sharedWithMe, loading } = useAppSelector((state) => state.sharing)
  const actionLabel =
    entityType === ShareableEntityType.Prompt ? 'Clone' : 'Fork'

  const filteredItems = sharedWithMe.filter(
    (item) => item.contentType === entityType
  )

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
        <Share2 className='h-8 w-8 text-muted-foreground/50' />
        <p className='text-sm text-muted-foreground'>
          No items have been shared with you yet.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-1'>
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className={`group flex items-center gap-2 rounded-md px-3 py-2.5 transition-colors hover:bg-accent ${
            onItemClick ? 'cursor-pointer' : ''
          }`}
          onClick={() => onItemClick?.(item)}
        >
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-foreground'>
              {item.entityTitle}
            </p>
            <p className='truncate text-[10px] text-muted-foreground'>
              Shared by {item.sharedByEmail}
            </p>
          </div>
          {onForkClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onForkClick(item)
              }}
              className='shrink-0 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground/10'
              title={actionLabel}
            >
              <GitFork className='h-4 w-4 text-muted-foreground' />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default SharedWithMeList
