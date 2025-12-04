import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { toggleArtifactsEnabled, openSidecar } from '@/redux/artifactSlice'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { FileText, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'

const ArtifactToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { artifactsEnabled, artifacts, activeArtifactId, sidecarOpen } =
    useSelector((state: RootState) => state.artifact)

  // Check if there's an active artifact that's not completed
  const activeArtifact = activeArtifactId ? artifacts[activeArtifactId] : null
  const hasActiveArtifact =
    activeArtifact && activeArtifact.status !== 'completed'

  const handleToggle = () => {
    dispatch(toggleArtifactsEnabled())
  }

  const handleOpenSidecar = () => {
    if (activeArtifactId) {
      dispatch(openSidecar())
    }
  }

  return (
    <div className='flex items-center gap-1'>
      <TooltipProvider>
        {/* Artifact Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={artifactsEnabled ? 'default' : 'ghost'}
              size='sm'
              onClick={handleToggle}
              className={cn(
                'h-9 px-3',
                artifactsEnabled
                  ? 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <FileText className='mr-2 h-4 w-4' />
              <span className='text-sm font-medium'>
                {artifactsEnabled ? 'Artifact Mode' : 'Artifacts'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {artifactsEnabled
                ? 'Artifact mode enabled - AI will generate long-form content in a dedicated panel'
                : 'Enable artifact mode for long-form document generation'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Open Sidecar Button (when there's an active artifact) */}
        {activeArtifactId && !sidecarOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleOpenSidecar}
                className={cn(
                  'h-9 px-2',
                  hasActiveArtifact &&
                    'border-purple-300 dark:border-purple-700'
                )}
              >
                <ScrollText
                  className={cn(
                    'h-4 w-4',
                    hasActiveArtifact && 'text-purple-600 dark:text-purple-400'
                  )}
                />
                {hasActiveArtifact && (
                  <span className='ml-1 flex h-2 w-2'>
                    <span className='absolute inline-flex h-2 w-2 animate-ping rounded-full bg-purple-400 opacity-75' />
                    <span className='relative inline-flex h-2 w-2 rounded-full bg-purple-500' />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open artifact panel</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}

export default ArtifactToggle
