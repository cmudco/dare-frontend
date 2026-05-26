import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import {
  closeSidecar,
  setSidecarWidth,
  toggleSidecarFullscreen,
} from '@/redux/artifactSlice'
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
  Presentation,
  Maximize2,
  Minimize2,
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
  const {
    artifacts,
    activeArtifactId,
    sidecarOpen,
    sidecarWidth,
    sidecarFullscreen,
  } = useSelector((state: RootState) => state.artifact)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(sidecarWidth)

  const activeArtifact = activeArtifactId
    ? artifacts[String(activeArtifactId)]
    : null

  useEffect(() => {
    const savedWidth = Number(localStorage.getItem('artifactSidecarWidth'))
    if (Number.isFinite(savedWidth) && savedWidth > 0) {
      dispatch(setSidecarWidth(savedWidth))
    }
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('artifactSidecarWidth', String(sidecarWidth))
  }, [sidecarWidth])

  const handleClose = () => {
    dispatch(closeSidecar())
  }

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (sidecarFullscreen) return

    dragStartXRef.current = event.clientX
    dragStartWidthRef.current = sidecarWidth
    event.currentTarget.setPointerCapture(event.pointerId)

    const handleMove = (moveEvent: PointerEvent) => {
      const delta = dragStartXRef.current - moveEvent.clientX
      const maxWidth = Math.min(window.innerWidth * 0.72, 1200)
      const nextWidth = Math.min(
        Math.max(dragStartWidthRef.current + delta, 520),
        maxWidth
      )
      dispatch(setSidecarWidth(nextWidth))
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const getArtifactIcon = (type?: ArtifactType) => {
    switch (type) {
      case 'chart':
        return <BarChart2 className='h-5 w-5' />
      case 'diagram':
        return <GitBranch className='h-5 w-5' />
      case 'docx':
        return <FileText className='h-5 w-5' />
      case 'pptx':
        return <Presentation className='h-5 w-5' />
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
        'relative flex h-full shrink-0 flex-col',
        'border-l border-gray-200 bg-white',
        'dark:border-gray-700 dark:bg-dark-bg',
        sidecarFullscreen && 'fixed inset-0 z-50 border-l-0'
      )}
      style={sidecarFullscreen ? undefined : { width: sidecarWidth }}
    >
      {!sidecarFullscreen && (
        <div
          role='separator'
          aria-orientation='vertical'
          onPointerDown={handleResizeStart}
          className='absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-blue-500/30'
          title='Resize artifact panel'
        />
      )}

      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
            {getArtifactIcon(activeArtifact.artifactType)}
          </div>
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='truncate font-medium text-gray-900 dark:text-white'>
                {activeArtifact.title}
              </h2>
              <ArtifactVersionDropdown artifact={activeArtifact} />
            </div>
            <span className='truncate text-xs text-gray-500 dark:text-gray-400'>
              {activeArtifact.filename}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <ArtifactActions
            artifactId={activeArtifact.id}
            content={activeArtifact.content}
            title={activeArtifact.title}
            artifactType={activeArtifact.artifactType}
            filename={activeArtifact.filename}
            contentType={activeArtifact.contentType}
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => dispatch(toggleSidecarFullscreen())}
            className='h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            title={sidecarFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {sidecarFullscreen ? (
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )}
          </Button>
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
