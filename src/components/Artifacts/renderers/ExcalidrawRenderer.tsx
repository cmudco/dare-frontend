import { lazy, Suspense, useMemo } from 'react'
import '@excalidraw/excalidraw/index.css'

// Heavy (canvas) — lazy-loaded so it never bloats the main bundle.
const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then((m) => ({ default: m.Excalidraw }))
)

/**
 * ExcalidrawRenderer - read-only render of an Excalidraw scene.
 * `content` is the scene JSON string ({ type, version, elements, … }).
 */
export const ExcalidrawRenderer = ({ content }: { content: string }) => {
  const data = useMemo(() => {
    try {
      const scene = JSON.parse(content)
      return {
        elements: Array.isArray(scene?.elements) ? scene.elements : [],
        appState: { viewModeEnabled: true },
        scrollToContent: true,
      }
    } catch {
      return null
    }
  }, [content])

  if (!data) {
    return (
      <div className='flex h-full items-center justify-center p-8 text-sm text-muted-foreground'>
        Could not parse the Excalidraw scene.
      </div>
    )
  }

  return (
    <div className='h-full w-full'>
      <Suspense
        fallback={
          <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
            Loading canvas…
          </div>
        }
      >
        <Excalidraw initialData={data} viewModeEnabled />
      </Suspense>
    </div>
  )
}

export default ExcalidrawRenderer
