import mermaid from 'mermaid'
import { useEffect, useState, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
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
  <div className='absolute top-2 right-2 z-10 flex gap-1 rounded-lg bg-card/90 p-1 shadow-md backdrop-blur-xs'>
    <button
      onClick={onZoomIn}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Zoom in'
    >
      <MagnifyingGlassPlusIcon className='h-4 w-4' />
    </button>
    <button
      onClick={onZoomOut}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Zoom out'
    >
      <MagnifyingGlassMinusIcon className='h-4 w-4' />
    </button>
    <button
      onClick={onReset}
      className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      title='Reset view'
    >
      <ArrowsPointingOutIcon className='h-4 w-4' />
    </button>
  </div>
)

export const MermaidBlock: React.FC<{
  code: string
  onRendered?: () => void
  streaming?: boolean
}> = ({ code, onRendered, streaming }) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
            if (isMounted) setSvg(svg)
            if (isMounted && onRendered && !streaming) {
              setTimeout(() => {
                onRendered()
              }, 0)
            }
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
  }, [code, onRendered, streaming])

  if (error) {
    return (
      <div className='not-prose my-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium text-red-600 dark:text-red-400'>
            Diagram Error
          </span>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className='text-xs text-red-500 underline hover:text-red-700'
          >
            {showRaw ? 'Hide code' : 'Show code'}
          </button>
        </div>
        <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        {showRaw && (
          <pre className='mt-2 max-h-40 overflow-auto rounded-sm bg-muted p-2 text-xs text-foreground'>
            {code}
          </pre>
        )}
      </div>
    )
  }

  if (!svg) {
    return (
      <div className='not-prose my-4 flex items-center gap-2 text-muted-foreground'>
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-500' />
        Loading diagram...
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className='not-prose group relative my-4 h-[500px] overflow-hidden rounded-lg border border-border bg-card'
    >
      <TransformWrapper
        initialScale={1.5}
        minScale={0.1}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.15 }}
        doubleClick={{ mode: 'reset' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls - visible on hover */}
            <div className='opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <ZoomControls
                onZoomIn={() => zoomIn()}
                onZoomOut={() => zoomOut()}
                onReset={() => resetTransform()}
              />
            </div>

            {/* Zoomable/pannable diagram */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
              }}
              contentStyle={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </TransformComponent>

            {/* Hint text */}
            <div className='absolute bottom-2 left-2 rounded-sm bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
              Scroll to zoom • Drag to pan • Double-click to reset
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
