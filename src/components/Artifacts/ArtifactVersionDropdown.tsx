import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { setActiveArtifact } from '@/redux/artifactSlice'
import { ChevronDown, History } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Artifact } from '@/redux/types/artifact'

interface ArtifactVersionDropdownProps {
  artifact: Artifact
  className?: string
}

/**
 * ArtifactVersionDropdown - Version switcher for artifacts
 *
 * Shows a dropdown with all versions of an artifact group.
 * Allows users to switch between versions.
 */
const ArtifactVersionDropdown: React.FC<ArtifactVersionDropdownProps> = ({
  artifact,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { artifacts } = useSelector((state: RootState) => state.artifact)

  // Get all versions in the same group from the store
  const groupVersions = React.useMemo(() => {
    if (!artifact.artifactGroupId) {
      // No group - just return current artifact
      return [artifact]
    }

    // Find all artifacts in the same group
    const versions = Object.values(artifacts).filter(
      (a) => a.artifactGroupId === artifact.artifactGroupId
    )

    // Sort by version number (descending - newest first)
    return versions.sort((a, b) => (b.version ?? 1) - (a.version ?? 1))
  }, [artifacts, artifact.artifactGroupId])

  // Don't show dropdown if only one version
  if (groupVersions.length <= 1) {
    return (
      <span
        className={cn('text-xs text-gray-500 dark:text-gray-400', className)}
      >
        v{artifact.version ?? 1}
      </span>
    )
  }

  const handleVersionSelect = (versionId: number) => {
    dispatch(setActiveArtifact(versionId))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'h-6 gap-1 px-2 text-xs text-gray-600 hover:text-gray-900',
            'dark:text-gray-400 dark:hover:text-gray-200',
            className
          )}
        >
          <History className='h-3 w-3' />v{artifact.version ?? 1}
          <ChevronDown className='h-3 w-3' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[120px]'>
        {groupVersions.map((version) => (
          <DropdownMenuItem
            key={version.id}
            onClick={() => handleVersionSelect(version.id)}
            className={cn(
              'flex items-center justify-between gap-2',
              version.id === artifact.id && 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <span>Version {version.version ?? 1}</span>
            {version.id === artifact.id && (
              <span className='text-xs text-blue-600 dark:text-blue-400'>
                Current
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ArtifactVersionDropdown
