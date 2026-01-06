import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import {
  setActiveArtifact,
  openSidecar,
  loadArtifacts,
} from '@/redux/artifactSlice'
import { FileText, Code, GitBranch, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getArtifactAPI } from '@/api/artifacts'

interface ArtifactCardProps {
  artifactId: number
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifactId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use String(artifactId) for Redux store lookup since keys are strings
  const artifact = useSelector(
    (state: RootState) => state.artifact.artifacts[String(artifactId)]
  )
  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )

  const handleClick = async () => {
    // If artifact is already loaded WITH content, just open sidecar
    // (artifacts from list have empty content, need to fetch full data)
    if (artifact && artifact.content) {
      dispatch(setActiveArtifact(artifactId))
      dispatch(openSidecar())
      return
    }

    // Fetch artifact from API
    if (!conversationId) {
      setError('No conversation selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getArtifactAPI(conversationId, artifactId)

      // Load artifact into Redux state
      dispatch(
        loadArtifacts([
          {
            id: response.id, // Use response.id (number from backend)
            title: response.title,
            outline: response.outline || '',
            content: response.content,
            artifactType: response.artifactType || 'document',
            status: response.status || 'completed',
            estimatedSections: response.estimatedSections || 1,
            currentSection: response.currentSection || 1,
            progress: response.progress || 1,
            wordCount: response.wordCount,
            language: response.language,
            version: response.version || 1,
          },
        ])
      )

      // Open sidecar with the loaded artifact
      dispatch(setActiveArtifact(artifactId))
      dispatch(openSidecar())
    } catch (err) {
      console.error('Failed to fetch artifact:', err)
      setError('Failed to load artifact')
    } finally {
      setIsLoading(false)
    }
  }

  // Show clickable placeholder card when artifact data isn't loaded
  if (!artifact) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'not-prose my-3 flex w-full max-w-md cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all',
          'hover:border-purple-300 hover:shadow-md dark:hover:border-purple-600',
          'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          isLoading && 'cursor-wait opacity-70'
        )}
      >
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'>
          {isLoading ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <FileText className='h-5 w-5' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <h4 className='font-medium text-gray-700 dark:text-gray-300'>
                {isLoading ? 'Loading artifact...' : 'View Artifact'}
              </h4>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                {error ? (
                  <span className='text-red-500'>{error}</span>
                ) : isLoading ? (
                  'Fetching content...'
                ) : (
                  'Click to view content'
                )}
              </p>
            </div>
            <ExternalLink className='h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500' />
          </div>
        </div>
      </button>
    )
  }

  const getIcon = () => {
    switch (artifact.artifactType) {
      case 'code':
        return <Code className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      default:
        return <FileText className='h-5 w-5' />
    }
  }

  const getStatusIndicator = () => {
    switch (artifact.status) {
      case 'planning':
        return (
          <div className='flex items-center gap-1.5 text-blue-600 dark:text-blue-400'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            <span className='text-xs'>Planning...</span>
          </div>
        )
      case 'generating':
        return (
          <div className='flex items-center gap-1.5 text-green-600 dark:text-green-400'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            <span className='text-xs'>
              Generating ({Math.round(artifact.progress * 100)}%)
            </span>
          </div>
        )
      case 'paused':
        return (
          <div className='flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400'>
            <span className='h-2 w-2 rounded-full bg-yellow-500' />
            <span className='text-xs'>
              Paused ({artifact.currentSection}/{artifact.estimatedSections})
            </span>
          </div>
        )
      case 'completed':
        return (
          <div className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            <span className='text-xs'>
              Complete
              {artifact.wordCount
                ? ` • ${artifact.wordCount.toLocaleString()} words`
                : ''}
            </span>
          </div>
        )
      case 'error':
        return (
          <div className='flex items-center gap-1.5 text-red-600 dark:text-red-400'>
            <span className='h-2 w-2 rounded-full bg-red-500' />
            <span className='text-xs'>Error</span>
          </div>
        )
      default:
        return null
    }
  }

  const getTypeLabel = () => {
    switch (artifact.artifactType) {
      case 'code':
        return artifact.language ? `Code (${artifact.language})` : 'Code'
      case 'diagram':
        return 'Diagram'
      default:
        return 'Document'
    }
  }

  const isActive =
    artifact.status === 'generating' || artifact.status === 'planning'

  return (
    <button
      onClick={handleClick}
      className={cn(
        'not-prose my-3 flex w-full max-w-md cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all',
        'hover:shadow-md',
        isActive
          ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
          : 'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          isActive
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-800/50 dark:text-purple-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        )}
      >
        {getIcon()}
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='truncate font-medium text-gray-900 dark:text-white'>
              {artifact.title || 'Untitled Artifact'}
            </h4>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              {getTypeLabel()}
            </p>
          </div>
          <ExternalLink className='h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500' />
        </div>

        {/* Status and Progress */}
        <div className='mt-2'>
          {getStatusIndicator()}
          {(artifact.status === 'generating' ||
            artifact.status === 'paused') && (
            <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  artifact.status === 'generating'
                    ? 'animate-pulse bg-purple-500'
                    : 'bg-yellow-500'
                )}
                style={{ width: `${Math.round(artifact.progress * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default ArtifactCard
