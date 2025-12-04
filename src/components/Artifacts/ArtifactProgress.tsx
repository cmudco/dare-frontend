import React from 'react'
import { cn } from '@/lib/utils'
import type { ArtifactStatus } from '@/redux/types/artifact'

interface ArtifactProgressProps {
  progress: number // 0.0 - 1.0
  currentSection: number
  totalSections: number
  status: ArtifactStatus
}

const ArtifactProgress: React.FC<ArtifactProgressProps> = ({
  progress,
  currentSection,
  totalSections,
  status,
}) => {
  const percentage = Math.round(progress * 100)

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
        return `Section ${currentSection} of ${totalSections}`
      case 'paused':
        return `Paused at section ${currentSection} of ${totalSections}`
      case 'completed':
        return 'Complete'
      case 'error':
        return 'Error occurred'
      default:
        return ''
    }
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
      {totalSections > 1 && (
        <div className='mt-2 flex gap-1'>
          {Array.from({ length: totalSections }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index < currentSection
                  ? 'bg-emerald-500'
                  : index === currentSection && status === 'generating'
                    ? 'animate-pulse bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
              )}
              title={`Section ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArtifactProgress
