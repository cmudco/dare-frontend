/**
 * MemoryCategoryCards Component
 *
 * Displays category summaries as horizontal scrollable cards.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoryCategory } from '@/redux/types/memory'
import { FolderOpen } from 'lucide-react'

interface MemoryCategoryCardsProps {
  categories: MemoryCategory[]
  isLoading?: boolean
}

// Category-specific colors
const getCategoryColor = (categoryName: string): string => {
  const lowerName = categoryName.toLowerCase()
  if (lowerName.includes('preference')) return 'from-blue-500 to-indigo-500'
  if (lowerName.includes('work') || lowerName.includes('professional'))
    return 'from-emerald-500 to-teal-500'
  if (lowerName.includes('goal') || lowerName.includes('aspiration'))
    return 'from-amber-500 to-orange-500'
  if (lowerName.includes('personal') || lowerName.includes('life'))
    return 'from-pink-500 to-rose-500'
  if (lowerName.includes('skill') || lowerName.includes('expertise'))
    return 'from-purple-500 to-violet-500'
  return 'from-slate-500 to-gray-500'
}

const MemoryCategoryCards = ({
  categories,
  isLoading,
}: MemoryCategoryCardsProps) => {
  if (isLoading) {
    return (
      <div className='flex gap-3 overflow-x-auto pb-2'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='min-w-[280px] flex-shrink-0 animate-pulse'>
            <CardHeader className='pb-2'>
              <div className='h-4 w-24 rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='h-3 w-full rounded bg-muted' />
                <div className='h-3 w-3/4 rounded bg-muted' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      <h3 className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
        <FolderOpen className='h-4 w-4' />
        Category Insights
      </h3>
      <div className='flex gap-3 overflow-x-auto pb-2'>
        {categories.map((category, index) => (
          <Card
            key={`${category.name}-${index}`}
            className='min-w-[280px] max-w-[320px] flex-shrink-0 overflow-hidden transition-all hover:shadow-md'
          >
            <div
              className={`h-1 w-full bg-gradient-to-r ${getCategoryColor(category.name)}`}
            />
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center justify-between text-sm font-medium'>
                <span className='capitalize'>
                  {category.name.replace(/_/g, ' ')}
                </span>
                {category.score !== undefined && (
                  <span className='text-xs font-normal text-muted-foreground'>
                    {(category.score * 100).toFixed(0)}% match
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='line-clamp-3 text-xs text-muted-foreground'>
                {category.summary || 'No summary available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MemoryCategoryCards
