import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ArtifactStatus } from '@/redux/types/artifact'
import { parseOutlineToSections } from './utils/sectionParser'

interface ArtifactProgressProps {
  progress: number // 0.0 - 1.0
  currentSection: number
  totalSections: number
  status: ArtifactStatus
  outline?: string // Outline for section titles
  onSectionClick?: (sectionIndex: number) => void
}

const ArtifactProgress: React.FC<ArtifactProgressProps> = ({
  progress,
  currentSection,
  totalSections,
  status,
  outline,
  onSectionClick,
}) => {
  const percentage = Math.round(progress * 100)

  // Parse outline to get section titles
  const sectionTitles = useMemo(() => {
    if (outline) {
      return parseOutlineToSections(outline)
    }
    return []
  }, [outline])

  // Use outline sections count if available, otherwise fall back to totalSections
  const sectionCount =
    sectionTitles.length > 0 ? sectionTitles.length : totalSections

  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'planning':
        return 'Creating outline...'
      case 'generating':
        return `Section ${currentSection} of ${sectionCount}`
      case 'paused':
        return `Paused at section ${currentSection} of ${sectionCount}`
      case 'completed':
        return 'Complete'
      case 'error':
        return 'Error occurred'
      default:
        return ''
    }
  }

  const handleSectionClick = (index: number) => {
    // Only allow clicking on completed sections
    if (onSectionClick && index < currentSection) {
      onSectionClick(index)
    }
  }

  const getSectionTitle = (index: number) => {
    if (sectionTitles[index]) {
      return sectionTitles[index]
    }
    return `Section ${index + 1}`
  }

  return (
    <div className='border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-medium text-gray-700 dark:text-gray-300'>
          {getStatusText()}
        </span>
        <span className='text-gray-500 dark:text-gray-400'>{percentage}%</span>
      </div>
      <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            getProgressBarColor(),
            status === 'generating' && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Section indicators */}
      {sectionCount > 1 && (
        <div className='mt-2 flex gap-1'>
          {Array.from({ length: sectionCount }).map((_, index) => {
            const isCompleted = index < currentSection
            const isCurrent =
              index === currentSection && status === 'generating'
            const isClickable = isCompleted && onSectionClick

            return (
              <button
                key={index}
                type='button'
                onClick={() => handleSectionClick(index)}
                disabled={!isClickable}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'animate-pulse bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600',
                  // Interactive states for clickable sections
                  isClickable && [
                    'cursor-pointer',
                    'hover:bg-emerald-400 hover:ring-2 hover:ring-emerald-300 hover:ring-offset-1',
                    'dark:hover:ring-emerald-600 dark:hover:ring-offset-gray-800',
                  ],
                  !isClickable && 'cursor-default'
                )}
                title={
                  isClickable
                    ? `Go to: ${getSectionTitle(index)}`
                    : getSectionTitle(index)
                }
                aria-label={`${getSectionTitle(index)}${isCompleted ? ' (completed)' : isCurrent ? ' (in progress)' : ''}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ArtifactProgress
