import mermaid from 'mermaid'
import { useEffect, useState } from 'react'

export const MermaidBlock: React.FC<{
  code: string
  onRendered?: () => void
  streaming?: boolean
}> = ({ code, onRendered, streaming }) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)

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
          <pre className='mt-2 max-h-40 overflow-auto rounded bg-gray-800 p-2 text-xs text-gray-200'>
            {code}
          </pre>
        )}
      </div>
    )
  }
  if (!svg) {
    return (
      <div className='not-prose my-4 flex items-center gap-2 text-gray-500'>
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
        Loading diagram...
      </div>
    )
  }
  return (
    <div className='not-prose my-4' dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
