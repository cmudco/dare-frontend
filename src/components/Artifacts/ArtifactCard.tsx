import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { setActiveArtifact, openSidecar } from '@/redux/artifactSlice'
import { fetchArtifactById } from '@/redux/asyncThunks/artifact'
import {
  FileText,
  FileType,
  Code,
  GitBranch,
  BarChart2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import PdfInlinePreview from './renderers/PdfInlinePreview'
import type { ArtifactType } from '@/redux/types/artifact'

interface ArtifactCardProps {
  artifactId: number
}

/**
 * ArtifactCard - Clickable card to open an artifact in the sidecar
 * Simplified for new artifact system (charts, diagrams).
 * PDF artifacts render a richer inline first-page preview.
 */
const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifactId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoLoadStartedRef = useRef(false)

  const artifact = useSelector(
    (state: RootState) => state.artifact.artifacts[String(artifactId)]
  )
  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )

  const loadArtifact = useCallback(async () => {
    if (!conversationId) {
      throw new Error('No conversation selected')
    }
    await dispatch(fetchArtifactById({ conversationId, artifactId })).unwrap()
  }, [artifactId, conversationId, dispatch])

  // Lazily hydrate artifacts referenced by messages: REST-loaded conversations
  // only carry artifactId, so fetch content up front (PDF cards need it for
  // the inline preview; other types resolve their title/type).
  useEffect(() => {
    if (artifact?.content || !conversationId || autoLoadStartedRef.current) {
      return
    }
    autoLoadStartedRef.current = true
    setIsLoading(true)
    loadArtifact()
      .catch((err) => {
        // Silent failure: the card stays clickable and retries on click.
        console.error('Failed to fetch artifact:', err)
      })
      .finally(() => setIsLoading(false))
  }, [artifact?.content, conversationId, loadArtifact])

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
      await loadArtifact()
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
      case 'pptx':
        return <Presentation className='h-5 w-5' />
      case 'pdf':
        return <FileType className='h-5 w-5' />
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
          'border-border bg-card',
          isLoading && 'cursor-wait opacity-70'
        )}
      >
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
          {isLoading ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <FileText className='h-5 w-5' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <h4 className='font-medium text-foreground'>
                {isLoading ? 'Loading artifact...' : 'View Artifact'}
              </h4>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {error ? (
                  <span className='text-red-500'>{error}</span>
                ) : isLoading ? (
                  'Fetching content...'
                ) : (
                  'Click to view content'
                )}
              </p>
            </div>
            <ExternalLink className='h-4 w-4 shrink-0 text-muted-foreground' />
          </div>
        </div>
      </button>
    )
  }

  // PDF artifacts get an interactive inline first-page preview
  if (artifact.artifactType === 'pdf') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'not-prose my-3 block w-full max-w-md cursor-pointer rounded-xl border p-3 text-left transition-all',
          'border-border bg-card hover:border-ring hover:shadow-md'
        )}
      >
        {/* Header row */}
        <div className='flex items-center gap-3 pb-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
            <FileType className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <h4 className='truncate font-medium text-foreground'>
              {artifact.title || 'Untitled Artifact'}
            </h4>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              PDF · v{artifact.version ?? 1}
            </p>
          </div>
          <span className='flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground'>
            Open
            <ChevronRight className='h-3.5 w-3.5' />
          </span>
        </div>

        {/* First-page preview; fixed height so the chat never shifts */}
        <div className='h-64 overflow-hidden rounded-lg border border-border bg-muted'>
          {artifact.content ? (
            <PdfInlinePreview artifact={artifact} />
          ) : (
            <Skeleton className='h-full w-full rounded-none' />
          )}
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
        'border-border bg-card hover:border-purple-300 dark:hover:border-purple-600'
      )}
    >
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
        {getIcon(artifact.artifactType)}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='truncate font-medium text-foreground'>
              {artifact.title || 'Untitled Artifact'}
            </h4>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {artifact.artifactType}
              {artifact.version &&
                artifact.version > 1 &&
                ` • v${artifact.version}`}
            </p>
          </div>
          <ExternalLink className='h-4 w-4 shrink-0 text-muted-foreground' />
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
