/**
 * MemoryStatsHeader Component
 *
 * Displays memory statistics summary: count, categories, and last updated.
 */
import { Brain, FolderTree, Clock } from 'lucide-react'

interface MemoryStatsHeaderProps {
  totalCount: number
  categories: string[]
  lastUpdated?: string
  isLoading?: boolean
}

const MemoryStatsHeader = ({
  totalCount,
  categories,
  lastUpdated,
  isLoading,
}: MemoryStatsHeaderProps) => {
  const uniqueCategories = [...new Set(categories)]
  const categoryCount = uniqueCategories.length

  // Format relative time
  const getRelativeTime = (dateStr?: string): string => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (isLoading) {
    return (
      <div className='flex items-center gap-4 rounded-lg border border-border bg-card/50 px-4 py-3'>
        <div className='h-4 w-24 animate-pulse rounded-sm bg-muted' />
        <div className='h-4 w-1 rounded-sm bg-border' />
        <div className='h-4 w-28 animate-pulse rounded-sm bg-muted' />
        <div className='h-4 w-1 rounded-sm bg-border' />
        <div className='h-4 w-32 animate-pulse rounded-sm bg-muted' />
      </div>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 text-sm'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Brain className='h-4 w-4 text-dare' />
        <span>
          <span className='font-medium text-foreground'>{totalCount}</span>{' '}
          {totalCount === 1 ? 'memory' : 'memories'}
        </span>
      </div>

      <span className='text-border'>•</span>

      <div className='flex items-center gap-2 text-muted-foreground'>
        <FolderTree className='h-4 w-4 text-emerald-500' />
        <span>
          <span className='font-medium text-foreground'>{categoryCount}</span>{' '}
          {categoryCount === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {lastUpdated && (
        <>
          <span className='text-border'>•</span>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Clock className='h-4 w-4 text-amber-500' />
            <span>Updated {getRelativeTime(lastUpdated)}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default MemoryStatsHeader
