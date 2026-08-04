import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  X,
  FileText,
  FileType,
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
  setActiveArtifact,
  setSidecarWidth,
  toggleSidecarFullscreen,
} from '@/redux/artifactSlice'
import {
  fetchArtifactById,
  fetchConversationArtifacts,
} from '@/redux/asyncThunks/artifact'
import { RootState, AppDispatch } from '@/redux/store'
import type { Artifact, ArtifactType } from '@/redux/types/artifact'
import {
  ARTIFACT_SIDECAR_DESKTOP_BREAKPOINT,
  ARTIFACT_SIDECAR_MAX_VIEWPORT_FRACTION,
  ARTIFACT_SIDECAR_MAX_WIDTH,
  ARTIFACT_SIDECAR_MIN_WIDTH,
  ARTIFACT_SIDECAR_OVERLAY_VIEWPORT_FRACTION,
  CONVERSATION_MIN_WIDTH,
} from '@/utils/constants/layout'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/utils/dateUtils'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import ArtifactRenderer from './ArtifactRenderer'
import ArtifactActions from './ArtifactActions'
import ArtifactVersionDropdown from './ArtifactVersionDropdown'

type SidecarTab = 'preview' | 'all'

const getTypeLabel = (type?: ArtifactType): string => {
  switch (type) {
    case 'pdf':
    case 'docx':
    case 'pptx':
    case 'html':
    case 'svg':
      return type.toUpperCase()
    default:
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Document'
  }
}

/**
 * ArtifactSidecar - Side panel for displaying artifacts
 *
 * Clean implementation inspired by Claude Artifacts.
 * Uses ArtifactRenderer for type-based content rendering.
 * A tab strip switches between the single-artifact preview and a list of
 * every artifact in the active conversation.
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
  const [activeTab, setActiveTab] = useState<SidecarTab>('preview')
  const [fetchedArtifactIds, setFetchedArtifactIds] = useState<number[]>([])
  const listFetchedForRef = useRef<string | null>(null)

  const conversationId = useSelector(
    (state: RootState) => state.conversation.activeConversation?.conversationId
  )
  // Primitive key so streaming message updates only re-render the sidecar
  // when the set of message-referenced artifacts actually changes.
  const messageArtifactIdsKey = useSelector((state: RootState) =>
    (state.conversation.activeConversationMessages || [])
      .map((message) => message.artifactId)
      .filter(Boolean)
      .join(',')
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

  // Snap back to the preview whenever the active artifact changes
  // (row click, new artifact via socket, version switch).
  useEffect(() => {
    setActiveTab('preview')
  }, [activeArtifactId])

  // Reset the conversation-scoped artifact list when switching conversations
  useEffect(() => {
    setFetchedArtifactIds([])
    listFetchedForRef.current = null
  }, [conversationId])

  // Fetch the conversation's artifact list: once per conversation for the
  // tab count badge, refreshed whenever the list tab is opened.
  useEffect(() => {
    if (!sidecarOpen || !conversationId) return
    if (activeTab !== 'all' && listFetchedForRef.current === conversationId) {
      return
    }
    listFetchedForRef.current = conversationId
    dispatch(fetchConversationArtifacts({ conversationId }))
      .unwrap()
      .then((list) => setFetchedArtifactIds(list.map((item) => item.id)))
      .catch(() => {
        // Thunk logs; the list falls back to message-referenced artifacts.
      })
  }, [sidecarOpen, conversationId, activeTab, dispatch])

  // Every artifact of the active conversation: union of the list endpoint
  // response and message-referenced artifacts (covers socket-created ones),
  // deduped to the latest version per artifact group. Older versions stay
  // reachable via the version dropdown in the preview tab.
  const conversationArtifacts = useMemo(() => {
    const ids = new Set<number>(fetchedArtifactIds)
    messageArtifactIdsKey
      .split(',')
      .map(Number)
      .filter(Boolean)
      .forEach((id) => ids.add(id))

    const latestByGroup = new Map<number, Artifact>()
    ids.forEach((id) => {
      const candidate = artifacts[String(id)]
      if (!candidate) return
      const groupKey = candidate.artifactGroupId ?? candidate.id
      const current = latestByGroup.get(groupKey)
      if (!current || (candidate.version ?? 1) > (current.version ?? 1)) {
        latestByGroup.set(groupKey, candidate)
      }
    })

    return Array.from(latestByGroup.values()).sort((a, b) => b.id - a.id)
  }, [artifacts, fetchedArtifactIds, messageArtifactIdsKey])

  const handleSelectArtifact = async (artifact: Artifact) => {
    // List responses may omit content; hydrate before previewing.
    if (!artifact.content && conversationId) {
      try {
        await dispatch(
          fetchArtifactById({ conversationId, artifactId: artifact.id })
        ).unwrap()
      } catch {
        // Thunk logs; the preview shows whatever is in the store.
      }
    }
    dispatch(setActiveArtifact(artifact.id))
    setActiveTab('preview')
  }

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
      case 'pdf':
        return <FileType className='h-5 w-5' />
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

      {/* Content: preview / all-artifacts tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SidecarTab)}
        className='flex min-h-0 flex-1 flex-col'
      >
        <div className='shrink-0 border-b border-border px-4 py-2'>
          <TabsList className='h-8'>
            <TabsTrigger value='preview' className='h-6 px-2.5 text-xs'>
              Preview
            </TabsTrigger>
            <TabsTrigger value='all' className='h-6 px-2.5 text-xs'>
              All artifacts ({conversationArtifacts.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value='preview'
          className='mt-0 min-h-0 flex-1 overflow-hidden'
        >
          <ArtifactRenderer artifact={activeArtifact} />
        </TabsContent>

        <TabsContent
          value='all'
          className='mt-0 min-h-0 flex-1 overflow-y-auto p-4'
        >
          {conversationArtifacts.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              No artifacts in this conversation yet.
            </p>
          ) : (
            <div className='space-y-2'>
              {conversationArtifacts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectArtifact(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                    item.id === activeArtifact.id
                      ? 'border-ring bg-accent'
                      : 'border-border bg-card hover:border-ring hover:bg-accent'
                  )}
                >
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    {getArtifactIcon(item.artifactType)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-sm font-medium text-foreground'>
                      {item.title || 'Untitled Artifact'}
                    </div>
                    <div className='mt-0.5 truncate text-xs text-muted-foreground'>
                      {getTypeLabel(item.artifactType)} · v{item.version ?? 1}
                      {item.updatedAt &&
                        ` · ${formatRelativeDate(item.updatedAt)}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
