import mermaid from 'mermaid'
import { useEffect, useState } from 'react'

export const MermaidBlock: React.FC<{
  code: string
  onRendered?: () => void
  streaming?: boolean
}> = ({ code, onRendered, streaming }) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
            if (isMounted) setError('Error rendering mermaid diagram')
            console.error('Mermaid rendering error:', err)
          })
      } catch (err) {
        if (isMounted) setError('Invalid mermaid diagram')
        console.error('Mermaid parsing error:', err)
      }
    })
    return () => {
      isMounted = false
    }
  }, [code, onRendered, streaming])

  if (error) {
    return (
      <div className='not-prose my-4'>
        <pre style={{ color: 'red' }}>{error}</pre>
      </div>
    )
  }
  if (!svg) {
    return <div className='not-prose my-4'>Loading diagram...</div>
  }
  return (
    <div className='not-prose my-4' dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
