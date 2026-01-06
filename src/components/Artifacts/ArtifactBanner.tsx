import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import {
  openSidecar,
  setActiveArtifact,
  clearArtifact,
} from '@/redux/artifactSlice'
import { continueArtifact } from '@/redux/asyncThunks/websocket'
import { Button } from '../ui/button'
import { FileText, Play, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtifactBannerProps {
  artifactId?: number // Optional: show specific artifact, otherwise show active paused artifact
}

const ArtifactBanner: React.FC<ArtifactBannerProps> = ({ artifactId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { artifacts, activeArtifactId, sidecarOpen } = useSelector(
    (state: RootState) => state.artifact
  )

  // Find artifact to display - use String for Redux lookup
  const targetArtifactId = artifactId ?? activeArtifactId
  const artifact =
    targetArtifactId != null ? artifacts[String(targetArtifactId)] : null

  // Only show banner for paused artifacts (or generating if sidecar is closed)
  const shouldShow =
    artifact &&
    (artifact.status === 'paused' ||
      (artifact.status === 'generating' && !sidecarOpen))

  if (!shouldShow || !artifact) {
    return null
  }

  const handleContinue = () => {
    if (targetArtifactId != null) {
      dispatch(continueArtifact({ artifactId: targetArtifactId }))
      dispatch(openSidecar())
    }
  }

  const handleOpen = () => {
    if (targetArtifactId != null) {
      dispatch(setActiveArtifact(targetArtifactId))
      dispatch(openSidecar())
    }
  }

  const handleDiscard = () => {
    if (
      targetArtifactId != null &&
      window.confirm('Are you sure you want to discard this artifact?')
    ) {
      dispatch(clearArtifact(targetArtifactId))
    }
  }

  const sectionsRemaining = artifact.estimatedSections - artifact.currentSection
  const progressPercentage = Math.round(artifact.progress * 100)

  return (
    <div
      className={cn(
        'mx-auto mb-4 w-full max-w-3xl rounded-lg border p-4',
        artifact.status === 'paused'
          ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
          : 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              artifact.status === 'paused'
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800/50 dark:text-yellow-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-400'
            )}
          >
            <FileText className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {artifact.status === 'paused'
                  ? 'Paused Artifact'
                  : 'Generating Artifact'}
              </h3>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  artifact.status === 'paused'
                    ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300'
                    : 'bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300'
                )}
              >
                {progressPercentage}%
              </span>
            </div>
            <p className='mt-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
              {artifact.title}
            </p>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              {artifact.status === 'paused'
                ? `${artifact.currentSection} of ${artifact.estimatedSections} sections complete • ${sectionsRemaining} remaining`
                : `Section ${artifact.currentSection} of ${artifact.estimatedSections} in progress`}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {artifact.status === 'paused' && (
            <Button
              variant='default'
              size='sm'
              onClick={handleContinue}
              className='bg-green-600 text-white hover:bg-green-700'
            >
              <Play className='mr-1 h-3.5 w-3.5' />
              Continue
            </Button>
          )}
          <Button variant='outline' size='sm' onClick={handleOpen}>
            <ExternalLink className='mr-1 h-3.5 w-3.5' />
            Open
          </Button>
          {artifact.status === 'paused' && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleDiscard}
              className='text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className={cn(
            'h-full transition-all duration-300',
            artifact.status === 'paused'
              ? 'bg-yellow-500'
              : 'animate-pulse bg-blue-500'
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}

export default ArtifactBanner
