import { useEffect, useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'

import { getElementImageAPI } from '@/api/files'
import { Skeleton } from '@/components/ui/skeleton'

interface ElementImageProps {
  fileId: number
  order: number
  alt: string
}

// Start fetching a little before the crop scrolls into view, so it is usually
// there by the time it is on screen.
const PRELOAD_MARGIN = '300px'

/**
 * The actual pixels of one document element, cropped out of the original.
 *
 * Nothing is stored server-side: the backend re-opens the file and cuts the
 * region out using the bounding box recorded at parse time. That makes each
 * crop a real render, so they are fetched only once the row is near the
 * viewport — a 65-picture newsletter would otherwise fire 65 renders the
 * moment the panel opens.
 *
 * Fetched as a blob rather than pointed at with a plain `src`, because the
 * endpoint needs the auth header. The object URL is revoked on unmount so a
 * long document does not leak one per picture.
 */
const ElementImage = ({ fileId, order, alt }: ElementImageProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(false)
  const holder = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = holder.current
    if (!node || visible) return

    // Without IntersectionObserver, fall back to loading immediately: a
    // needlessly eager fetch is better than an image that never appears.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible) return

    let objectUrl: string | null = null
    let cancelled = false

    const load = async () => {
      try {
        const blob = await getElementImageAPI(fileId, order)
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId, order, visible])

  if (failed) {
    return (
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <ImageOff className='h-4 w-4' />
        This region could not be rendered
      </div>
    )
  }

  return (
    <div ref={holder}>
      {url ? (
        <img
          src={url}
          alt={alt}
          className='max-h-64 max-w-full rounded-sm border border-border object-contain'
        />
      ) : (
        <Skeleton className='h-32 w-full max-w-xs' />
      )}
    </div>
  )
}

export default ElementImage
