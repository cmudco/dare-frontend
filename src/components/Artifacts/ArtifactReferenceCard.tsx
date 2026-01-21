import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { setActiveArtifact, openSidecar } from '@/redux/artifactSlice'
import {
  FileText,
  BarChart2,
  GitBranch,
  Code,
  ExternalLink,
} from 'lucide-react'

interface ArtifactReferenceCardProps {
  artifactId: number
}

/**
 * ArtifactReferenceCard - Compact clickable card in message bubble
 *
 * Shows a small reference to an artifact that was created by a DARE tool.
 * Clicking opens the artifact in the sidecar panel.
 */
export const ArtifactReferenceCard: React.FC<ArtifactReferenceCardProps> = ({
  artifactId,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const artifact = useSelector(
    (state: RootState) => state.artifact.artifacts[String(artifactId)]
  )

  if (!artifact) return null

  const getIcon = () => {
    switch (artifact.artifactType) {
      case 'chart':
        return <BarChart2 className='h-4 w-4' />
      case 'diagram':
        return <GitBranch className='h-4 w-4' />
      case 'code':
        return <Code className='h-4 w-4' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  const getTypeLabel = () => {
    switch (artifact.artifactType) {
      case 'chart':
        return 'Chart'
      case 'diagram':
        return 'Diagram'
      case 'code':
        return 'Code'
      default:
        return 'Document'
    }
  }

  const handleClick = () => {
    dispatch(setActiveArtifact(artifactId))
    dispatch(openSidecar())
  }

  return (
    <button
      onClick={handleClick}
      className='not-prose mt-3 flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/30'
    >
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700'>
        {getIcon()}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='truncate font-medium text-gray-900 dark:text-white'>
          {artifact.title}
        </div>
        <div className='text-xs text-gray-500 dark:text-gray-400'>
          {getTypeLabel()} • Click to view
        </div>
      </div>
      <ExternalLink className='h-4 w-4 flex-shrink-0 text-gray-400' />
    </button>
  )
}

export default ArtifactReferenceCard
