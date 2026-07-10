import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  PptxPresentationConfig,
  PptxTheme,
} from '@/redux/types/dareToolResults'
import { MiniSlide, SlidePreview } from './PptxSlideViews'

interface PptxRendererProps {
  config: PptxPresentationConfig
}

const DEFAULT_THEME: Required<PptxTheme> = {
  primaryColor: '#2563EB',
  accentColor: '#14B8A6',
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  mutedTextColor: '#475569',
  fontFamily: 'Aptos',
}

const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720
const PREVIEW_PADDING = 48

export const PptxRenderer: React.FC<PptxRendererProps> = ({ config }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const theme = useMemo(
    () => ({ ...DEFAULT_THEME, ...(config.theme || {}) }),
    [config.theme]
  )

  const slides = config.slides || []
  const activeSlide = slides[activeIndex] || slides[0]

  useLayoutEffect(() => {
    const node = previewRef.current
    if (!node) return

    const updateScale = () => {
      const width = Math.max(node.clientWidth - PREVIEW_PADDING, 1)
      const height = Math.max(node.clientHeight - PREVIEW_PADDING, 1)
      const nextScale = Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT, 1)
      setScale(Math.max(nextScale, 0.25))
    }

    updateScale()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }

    const observer = new ResizeObserver(updateScale)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  if (!activeSlide) {
    return (
      <div className='flex h-full items-center justify-center p-8 text-sm text-muted-foreground'>
        No slides to preview.
      </div>
    )
  }

  return (
    <div className='flex h-full min-w-0 bg-muted'>
      <aside className='w-24 shrink-0 overflow-auto border-r border-border p-2 sm:w-32 sm:p-3'>
        <div className='space-y-2'>
          {slides.map((slide, index) => (
            <button
              key={`pptx-thumb-${index}`}
              type='button'
              onClick={() => setActiveIndex(index)}
              className={`block aspect-video w-full overflow-hidden rounded border text-left transition ${
                activeIndex === index
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-muted-foreground'
              }`}
              title={`Slide ${index + 1}`}
            >
              <MiniSlide slide={slide} theme={theme} />
            </button>
          ))}
        </div>
      </aside>

      <main className='flex min-w-0 flex-1 flex-col'>
        <div className='flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground'>
          <span className='min-w-0 truncate'>{config.title}</span>
          <span className='shrink-0 pl-2'>
            Slide {activeIndex + 1} of {slides.length}
          </span>
        </div>
        <div
          ref={previewRef}
          className='min-h-0 flex-1 overflow-auto p-3 sm:p-6'
        >
          <div className='flex min-h-full min-w-full items-center justify-center'>
            <div
              style={{
                width: SLIDE_WIDTH * scale,
                height: SLIDE_HEIGHT * scale,
              }}
            >
              <div
                className='overflow-hidden rounded-xs shadow-xl'
                style={{
                  width: SLIDE_WIDTH,
                  height: SLIDE_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <SlidePreview slide={activeSlide} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PptxRenderer
