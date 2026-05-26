'use client'

import { use, useEffect, useId, useState } from 'react'
import { useTheme } from 'next-themes'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { Minus, Plus, RotateCcw } from 'lucide-react'

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <CodeBlock title='Mermaid'>
        <Pre>{chart}</Pre>
      </CodeBlock>
    )
  }

  return <MermaidContent chart={chart} />
}

const cache = new Map<string, Promise<unknown>>()

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached) return cached as Promise<T>

  const promise = setPromise()
  cache.set(key, promise)
  return promise
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId()
  const [zoom, setZoom] = useState(1)
  const { resolvedTheme } = useTheme()
  const { default: mermaid } = use(
    cachePromise('mermaid', () => import('mermaid'))
  )

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 1.5rem auto 0;',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  })

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(id, chart.replaceAll('\\n', '\n'))
    )
  )

  return (
    <figure className='bg-fd-card overflow-hidden rounded-lg border'>
      <div className='text-fd-muted-foreground flex items-center justify-between border-b px-3 py-2 text-xs'>
        <span>Mermaid diagram</span>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            aria-label='Zoom out'
            className='hover:bg-fd-accent hover:text-fd-accent-foreground rounded-md p-1.5'
            onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}
          >
            <Minus className='size-3.5' />
          </button>
          <span className='min-w-10 text-center tabular-nums'>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type='button'
            aria-label='Zoom in'
            className='hover:bg-fd-accent hover:text-fd-accent-foreground rounded-md p-1.5'
            onClick={() => setZoom((value) => Math.min(2, value + 0.1))}
          >
            <Plus className='size-3.5' />
          </button>
          <button
            type='button'
            aria-label='Reset zoom'
            className='hover:bg-fd-accent hover:text-fd-accent-foreground rounded-md p-1.5'
            onClick={() => setZoom(1)}
          >
            <RotateCcw className='size-3.5' />
          </button>
        </div>
      </div>
      <div className='overflow-auto p-4'>
        <div
          className='origin-top-left transition-transform'
          style={{
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
          }}
          ref={(container) => {
            if (container) bindFunctions?.(container)
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </figure>
  )
}
