import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { openSidecar, setActiveArtifact } from '@/redux/artifactSlice'
import { Button } from '../ui/button'
import { FileText, ExternalLink, BarChart2, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtifactBannerProps {
  artifactId?: number
}

/**
 * ArtifactBanner - Shows a banner for the currently active artifact
 * Simplified for new artifact system (charts, diagrams).
 */
const ArtifactBanner: React.FC<ArtifactBannerProps> = ({ artifactId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { artifacts, activeArtifactId, sidecarOpen } = useSelector(
    (state: RootState) => state.artifact
  )

  const targetArtifactId = artifactId ?? activeArtifactId
  const artifact =
    targetArtifactId != null ? artifacts[String(targetArtifactId)] : null

  // Show banner when there's an artifact but sidecar is closed
  const shouldShow = artifact && !sidecarOpen

  if (!shouldShow || !artifact) {
    return null
  }

  const handleOpen = () => {
    if (targetArtifactId != null) {
      dispatch(setActiveArtifact(targetArtifactId))
      dispatch(openSidecar())
    }
  }

  const getIcon = () => {
    switch (artifact.artifactType) {
      case 'chart':
        return <BarChart2 className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      default:
        return <FileText className='h-5 w-5' />
    }
  }

  return (
    <div
      className={cn(
        'mx-auto mb-4 w-full max-w-3xl rounded-lg border p-4',
        'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
      )}
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-400'>
            {getIcon()}
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              {artifact.title}
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {artifact.artifactType} • {artifact.filename}
            </p>
          </div>
        </div>

        <Button variant='outline' size='sm' onClick={handleOpen}>
          <ExternalLink className='mr-1 h-3.5 w-3.5' />
          Open
        </Button>
      </div>
    </div>
  )
}

export default ArtifactBanner
