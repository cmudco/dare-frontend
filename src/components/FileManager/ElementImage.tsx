import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'

import { getElementImageAPI } from '@/api/files'
import { Skeleton } from '@/components/ui/skeleton'

interface ElementImageProps {
  fileId: number
  order: number
  alt: string
}

/**
 * The actual pixels of one document element, cropped out of the original.
 *
 * Fetched as a blob rather than pointed at with a plain `src`, because the
 * endpoint needs the auth header. The object URL is revoked on unmount so a
 * long document does not leak one per picture.
 */
const ElementImage = ({ fileId, order, alt }: ElementImageProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
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
  }, [fileId, order])

  if (failed) {
    return (
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <ImageOff className='h-4 w-4' />
        This region could not be rendered
      </div>
    )
  }

  if (!url) return <Skeleton className='h-32 w-full max-w-xs' />

  return (
    <img
      src={url}
      alt={alt}
      loading='lazy'
      className='max-h-64 max-w-full rounded-sm border border-border object-contain'
    />
  )
}

export default ElementImage
