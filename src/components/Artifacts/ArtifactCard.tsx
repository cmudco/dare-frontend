import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import {
  setActiveArtifact,
  openSidecar,
  loadArtifacts,
} from '@/redux/artifactSlice'
import {
  FileText,
  Code,
  GitBranch,
  BarChart2,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getArtifactAPI } from '@/api/artifacts'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'

interface ArtifactCardProps {
  artifactId: number
}

/**
 * ArtifactCard - Clickable card to open an artifact in the sidecar
 * Simplified for new artifact system (charts, diagrams).
 */
const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifactId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const artifact = useSelector(
    (state: RootState) => state.artifact.artifacts[String(artifactId)]
  )
  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )

  const handleClick = async () => {
    // If artifact is already loaded with content, just open sidecar
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
            id: response.id,
            title: response.title,
            content: response.content,
            artifactType: (response.artifactType as ArtifactType) || 'document',
            status: response.status || 'completed',
            filename: response.filename || '',
            contentType: response.contentType || '',
            version: response.version || 1,
            metadata: response.metadata,
          } as Artifact,
        ])
      )

      dispatch(setActiveArtifact(artifactId))
      dispatch(openSidecar())
    } catch (err) {
      console.error('Failed to fetch artifact:', err)
      setError('Failed to load artifact')
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type?: ArtifactType) => {
    switch (type) {
      case 'code':
        return <Code className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      case 'chart':
        return <BarChart2 className='h-5 w-5' />
      default:
        return <FileText className='h-5 w-5' />
    }
  }

  // Show placeholder when artifact isn't loaded
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

  return (
    <button
      onClick={handleClick}
      className={cn(
        'not-prose my-3 flex w-full max-w-md cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all',
        'hover:shadow-md',
        'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600'
      )}
    >
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
        {getIcon(artifact.artifactType)}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='truncate font-medium text-gray-900 dark:text-white'>
              {artifact.title || 'Untitled Artifact'}
            </h4>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              {artifact.artifactType}
              {artifact.version &&
                artifact.version > 1 &&
                ` • v${artifact.version}`}
            </p>
          </div>
          <ExternalLink className='h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500' />
        </div>

        {/* Status indicator */}
        <div className='mt-2'>
          <div className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            <span className='text-xs'>
              {artifact.status === 'error' ? 'Error' : 'Complete'}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default ArtifactCard
