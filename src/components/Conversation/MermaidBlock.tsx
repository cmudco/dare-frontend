import mermaid from 'mermaid'
import { useEffect, useState } from 'react'

// Mermaid reserved keywords that need to be prefixed
const RESERVED_KEYWORDS = [
  'end',
  'graph',
  'subgraph',
  'direction',
  'click',
  'style',
  'note',
]

/**
 * Sanitize mermaid code to fix common LLM-generated issues
 */
function sanitizeMermaidCode(code: string): string {
  let sanitized = code

  // Fix reserved keyword "end" used as node ID
  // Pattern: end["..."] or end([...]) or -->end or end-->
  RESERVED_KEYWORDS.forEach((keyword) => {
    // Match keyword as standalone node definition or reference
    const patterns = [
      // Node definitions: end["label"] -> node_end["label"]
      new RegExp(`\\b${keyword}(\\[|\\(|\\{)`, 'gi'),
      // Edge targets: -->end -> -->node_end
      new RegExp(`(-->|-.->|==>)${keyword}\\b`, 'gi'),
      // Edge sources: end--> -> node_end-->
      new RegExp(`\\b${keyword}(-->|-.->|==>)`, 'gi'),
    ]

    sanitized = sanitized.replace(patterns[0], `node_${keyword}$1`)
    sanitized = sanitized.replace(patterns[1], `$1node_${keyword}`)
    sanitized = sanitized.replace(patterns[2], `node_${keyword}$1`)
  })

  // Fix special characters in edge labels that break mermaid
  // Remove parentheses, brackets, and other problematic characters from edge labels
  sanitized = sanitized.replace(
    /(-->|-.->|==>)\|([^|]*)\|/g,
    (_, arrow, label) => {
      // Remove all problematic characters from label
      const cleanLabel = label
        .replace(/[()[\]{}]/g, '') // Remove brackets/parens
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      return `${arrow}|${cleanLabel}|`
    }
  )

  return sanitized
}

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

    // Sanitize the code to fix common issues
    const sanitizedCode = sanitizeMermaidCode(code)

    Promise.resolve().then(() => {
      try {
        mermaid.parse(sanitizedCode)
        const id = 'mermaid_svg_' + Math.random().toString(36).substring(2, 10)
        mermaid
          .render(id, sanitizedCode)
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
