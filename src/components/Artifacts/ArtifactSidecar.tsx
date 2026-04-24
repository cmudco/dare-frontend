import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { closeSidecar } from '@/redux/artifactSlice'
import ArtifactRenderer from './ArtifactRenderer'
import ArtifactActions from './ArtifactActions'
import ArtifactVersionDropdown from './ArtifactVersionDropdown'
import {
  X,
  FileText,
  Code,
  GitBranch,
  BarChart2,
  ImageIcon,
  File,
} from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import type { ArtifactType } from '@/redux/types/artifact'

/**
 * ArtifactSidecar - Side panel for displaying artifacts
 *
 * Clean implementation inspired by Claude Artifacts.
 * Uses ArtifactRenderer for type-based content rendering.
 */
const ArtifactSidecar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { artifacts, activeArtifactId, sidecarOpen } = useSelector(
    (state: RootState) => state.artifact
  )

  const activeArtifact = activeArtifactId
    ? artifacts[String(activeArtifactId)]
    : null

  const handleClose = () => {
    dispatch(closeSidecar())
  }

  const getArtifactIcon = (type?: ArtifactType) => {
    switch (type) {
      case 'chart':
        return <BarChart2 className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      case 'docx':
        return <FileText className='h-5 w-5' />
      case 'code':
        return <Code className='h-5 w-5' />
      case 'image':
        return <ImageIcon className='h-5 w-5' />
      case 'file':
        return <File className='h-5 w-5' />
      default:
        return <FileText className='h-5 w-5' />
    }
  }

  if (!sidecarOpen || !activeArtifact) {
    return null
  }

  return (
    <div
      className={cn(
        'flex h-full w-[600px] shrink-0 flex-col',
        'border-l border-gray-200 bg-white',
        'dark:border-gray-700 dark:bg-dark-bg'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
            {getArtifactIcon(activeArtifact.artifactType)}
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='font-medium text-gray-900 dark:text-white'>
                {activeArtifact.title}
              </h2>
              <ArtifactVersionDropdown artifact={activeArtifact} />
            </div>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {activeArtifact.filename}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <ArtifactActions
            content={activeArtifact.content}
            title={activeArtifact.title}
            artifactType={activeArtifact.artifactType}
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            title='Close'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        <ArtifactRenderer artifact={activeArtifact} />
      </div>

      {/* Error Message */}
      {activeArtifact.status === 'error' && activeArtifact.error && (
        <div className='border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20'>
          <p className='text-sm text-red-700 dark:text-red-400'>
            {activeArtifact.error}
          </p>
        </div>
      )}
    </div>
  )
}

export default ArtifactSidecar
