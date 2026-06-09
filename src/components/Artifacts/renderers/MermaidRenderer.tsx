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
  <div className='absolute right-4 top-4 z-10 flex gap-1 rounded-lg bg-white/90 p-1 shadow-md backdrop-blur-sm dark:bg-gray-800/90'>
    <button
      onClick={onZoomIn}
      className='rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
      title='Zoom in'
    >
      <MagnifyingGlassPlusIcon className='h-5 w-5' />
    </button>
    <button
      onClick={onZoomOut}
      className='rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
      title='Zoom out'
    >
      <MagnifyingGlassMinusIcon className='h-5 w-5' />
    </button>
    <button
      onClick={onReset}
      className='rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
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
            // Mermaid stamps a small intrinsic max-width on the <svg>, which
            // makes diagrams render zoomed-out in a large panel. Let it fill.
            if (isMounted)
              setSvg(svg.replace(/max-width:\s*[\d.]+px/g, 'max-width: 100%'))
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
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
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
            <pre className='mt-2 max-h-40 overflow-auto rounded bg-gray-800 p-2 text-xs text-gray-200'>
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
        <div className='flex items-center gap-2 text-gray-500'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
          Loading diagram...
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className='group relative h-full overflow-hidden bg-white dark:bg-gray-900'
    >
      <TransformWrapper
        initialScale={1}
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
                padding: '2rem',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </TransformComponent>

            {/* Hint text */}
            <div className='absolute bottom-4 left-4 rounded bg-gray-900/60 px-2 py-1 text-xs text-gray-300 opacity-0 transition-opacity group-hover:opacity-100'>
              Scroll to zoom • Drag to pan • Double-click to reset
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

export default MermaidRenderer
