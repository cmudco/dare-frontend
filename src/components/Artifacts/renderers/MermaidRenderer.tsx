import mermaid from 'mermaid'
import { useCallback, useEffect, useState, useRef } from 'react'
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
}) => (
  <div className='absolute top-4 right-4 z-10 flex gap-1 rounded-lg bg-card/90 p-1 shadow-md backdrop-blur-xs'>
    <button
      onClick={onZoomIn}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Zoom in'
    >
      <MagnifyingGlassPlusIcon className='h-5 w-5' />
    </button>
    <button
      onClick={onZoomOut}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Zoom out'
    >
      <MagnifyingGlassMinusIcon className='h-5 w-5' />
    </button>
    <button
      onClick={onReset}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Reset view'
    >
      <ArrowsPointingOutIcon className='h-5 w-5' />
    </button>
  </div>
)

interface MermaidRendererProps {
  /** Mermaid diagram code */
  code: string
}

/**
 * MermaidRenderer - Renders Mermaid diagrams for artifact panel
 * Adapted from MermaidBlock for use in unified artifact system
 */
export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)

  // Open perfectly framed: scale the diagram so it fills the visible panel
  // (capped so small diagrams aren't blown up into pixel soup).
  const fitToView = useCallback(() => {
    const api = transformRef.current
    const wrapper = containerRef.current
    // Scope to the diagram wrapper — the container also holds the zoom
    // control icons, which are SVGs too.
    const svgEl = diagramRef.current?.querySelector('svg')
    if (!api || !wrapper || !svgEl) return
    // Measure the laid-out diagram (un-zoomed): the viewBox often carries
    // padding that would underscale the fit.
    const currentScale = api.instance?.transformState?.scale || 1
    const rect = svgEl.getBoundingClientRect()
    const width = rect.width / currentScale
    const height = rect.height / currentScale
    if (!width || !height) return
    const scale = Math.min(
      (wrapper.clientWidth - 48) / width,
      (wrapper.clientHeight - 48) / height
    )
    api.centerView(Math.min(Math.max(scale, 0.2), 2.5), 0)
  }, [])

  useEffect(() => {
    if (!svg) return
    const frame = requestAnimationFrame(fitToView)
    return () => cancelAnimationFrame(frame)
  }, [svg, fitToView])

  useEffect(() => {
    let isMounted = true
    setSvg(null)
    setError(null)

    Promise.resolve().then(() => {
      try {
        mermaid.parse(code)
        const id = 'mermaid_svg_' + Math.random().toString(36).substring(2, 10)
        mermaid
          .render(id, code)
          .then(({ svg }) => {
            // Mermaid emits width="100%" + a max-width cap. In the zoom
            // container's shrink-to-fit content box a percentage width
            // collapses to the 300px replaced-element default, wrecking the
            // fit math. Pin the svg to its intrinsic (viewBox) size instead.
            if (!isMounted) return
            const vb =
              /viewBox="[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/.exec(
                svg
              )
            const size = vb
              ? `width:${vb[1]}px;height:${vb[2]}px;max-width:none`
              : 'max-width:none'
            setSvg(svg.replace(/max-width:\s*[\d.]+px/g, size))
          })
          .catch((err) => {
            if (isMounted)
              setError(err.message || 'Error rendering mermaid diagram')
            console.error('Mermaid rendering error:', err)
          })
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Invalid mermaid diagram'
        if (isMounted) setError(message)
        console.error('Mermaid parsing error:', err)
      }
    })
    return () => {
      isMounted = false
    }
  }, [code])

  if (error) {
    return (
      <div className='flex h-full flex-col p-4'>
        <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-medium text-destructive'>
              Diagram Error
            </span>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className='text-xs text-destructive underline hover:text-destructive/80'
            >
              {showRaw ? 'Hide code' : 'Show code'}
            </button>
          </div>
          <p className='text-sm text-destructive'>{error}</p>
          {showRaw && (
            <pre className='mt-2 max-h-40 overflow-auto rounded-sm bg-muted p-2 text-xs text-foreground'>
              {code}
            </pre>
          )}
        </div>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary' />
          Loading diagram...
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className='group relative h-full min-w-0 overflow-hidden bg-background'
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.15 }}
        doubleClick={{ disabled: true }}
        onInit={fitToView}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            {/* Controls - visible on hover */}
            <div className='opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <ZoomControls
                onZoomIn={() => zoomIn()}
                onZoomOut={() => zoomOut()}
                onReset={fitToView}
              />
            </div>

            {/* Zoomable/pannable diagram */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
              }}
            >
              <div ref={diagramRef} onDoubleClick={fitToView}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            </TransformComponent>

            {/* Hint text */}
            <div className='absolute bottom-4 left-4 rounded-sm bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
              Scroll to zoom • Drag to pan • Double-click to fit
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

export default MermaidRenderer
