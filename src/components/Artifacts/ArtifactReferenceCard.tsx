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
  Presentation,
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
      case 'pptx':
        return <Presentation className='h-4 w-4' />
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
      case 'pptx':
        return 'PowerPoint'
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
      className='not-prose mt-3 flex w-full items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-left transition-all hover:border-ring hover:bg-accent'
    >
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card shadow-xs'>
        {getIcon()}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='truncate font-medium text-foreground'>
          {artifact.title}
        </div>
        <div className='text-xs text-muted-foreground'>
          {getTypeLabel()} • Click to view
        </div>
      </div>
      <ExternalLink className='h-4 w-4 shrink-0 text-muted-foreground' />
    </button>
  )
}

export default ArtifactReferenceCard
