import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
import {
  closeSidecar,
  setSidecarWidth,
  toggleSidecarFullscreen,
} from '@/redux/artifactSlice'
import { RootState, AppDispatch } from '@/redux/store'
import type { ArtifactType } from '@/redux/types/artifact'
import {
  ARTIFACT_SIDECAR_DESKTOP_BREAKPOINT,
  ARTIFACT_SIDECAR_MAX_VIEWPORT_FRACTION,
  ARTIFACT_SIDECAR_MAX_WIDTH,
  ARTIFACT_SIDECAR_MIN_WIDTH,
  ARTIFACT_SIDECAR_OVERLAY_VIEWPORT_FRACTION,
  CONVERSATION_MIN_WIDTH,
} from '@/utils/constants/layout'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import ArtifactRenderer from './ArtifactRenderer'
import ArtifactActions from './ArtifactActions'
import ArtifactVersionDropdown from './ArtifactVersionDropdown'

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
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined'
      ? ARTIFACT_SIDECAR_DESKTOP_BREAKPOINT
      : window.innerWidth
  )

  const activeArtifact = activeArtifactId
    ? artifacts[String(activeArtifactId)]
    : null

  const isOverlay = useMemo(() => {
    return (
      !sidecarFullscreen &&
      (viewportWidth < ARTIFACT_SIDECAR_DESKTOP_BREAKPOINT ||
        viewportWidth - sidecarWidth < CONVERSATION_MIN_WIDTH)
    )
  }, [sidecarFullscreen, sidecarWidth, viewportWidth])

  const clampWidth = useCallback(
    (width: number, nextViewportWidth = viewportWidth, overlay = isOverlay) => {
      const maxFraction = overlay
        ? ARTIFACT_SIDECAR_OVERLAY_VIEWPORT_FRACTION
        : ARTIFACT_SIDECAR_MAX_VIEWPORT_FRACTION
      const maxWidth = Math.max(
        ARTIFACT_SIDECAR_MIN_WIDTH,
        Math.min(nextViewportWidth * maxFraction, ARTIFACT_SIDECAR_MAX_WIDTH)
      )

      return Math.min(Math.max(width, ARTIFACT_SIDECAR_MIN_WIDTH), maxWidth)
    },
    [isOverlay, viewportWidth]
  )

  useEffect(() => {
    const handleViewportResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleViewportResize)
    handleViewportResize()

    return () => window.removeEventListener('resize', handleViewportResize)
  }, [])

  useEffect(() => {
    const savedWidth = Number(localStorage.getItem('artifactSidecarWidth'))
    if (Number.isFinite(savedWidth) && savedWidth > 0) {
      dispatch(
        setSidecarWidth(
          clampWidth(
            savedWidth,
            viewportWidth,
            viewportWidth < ARTIFACT_SIDECAR_DESKTOP_BREAKPOINT
          )
        )
      )
    }
    // Load persisted width once after viewport measurement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('artifactSidecarWidth', String(sidecarWidth))
  }, [sidecarWidth])

  useEffect(() => {
    const clampedWidth = clampWidth(sidecarWidth)
    if (clampedWidth !== sidecarWidth) {
      dispatch(setSidecarWidth(clampedWidth))
    }
  }, [clampWidth, dispatch, sidecarWidth])

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
      const nextWidth = clampWidth(
        dragStartWidthRef.current + delta,
        window.innerWidth,
        false
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
        'flex h-full shrink-0 flex-col',
        'border-l border-border bg-background',
        isOverlay
          ? 'absolute inset-y-0 right-0 z-40 max-w-full shadow-2xl'
          : 'relative',
        sidecarFullscreen && 'fixed inset-0 z-50 border-l-0'
      )}
      style={
        sidecarFullscreen
          ? undefined
          : { width: clampWidth(sidecarWidth), maxWidth: '100%' }
      }
    >
      {!sidecarFullscreen && !isOverlay && (
        <div
          role='separator'
          aria-orientation='vertical'
          onPointerDown={handleResizeStart}
          className='absolute top-0 -left-1 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-blue-500/30'
          title='Resize artifact panel'
        />
      )}

      {/* Header */}
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
            {getArtifactIcon(activeArtifact.artifactType)}
          </div>
          <div className='flex min-w-0 flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='truncate font-medium text-foreground'>
                {activeArtifact.title}
              </h2>
              <ArtifactVersionDropdown artifact={activeArtifact} />
            </div>
            <span className='truncate text-xs text-muted-foreground'>
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
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
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
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
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
        <div className='border-t border-destructive/30 bg-destructive/10 px-4 py-3'>
          <p className='text-sm text-destructive'>{activeArtifact.error}</p>
        </div>
      )}
    </div>
  )
}

export default ArtifactSidecar
