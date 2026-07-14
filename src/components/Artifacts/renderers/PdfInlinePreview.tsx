import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Artifact } from '@/redux/types/artifact'

interface PdfInlinePreviewProps {
  artifact: Artifact
}

/**
 * PdfInlinePreview - Non-interactive first-page preview of a PDF artifact.
 *
 * Reuses PdfRenderer's blob-URL approach (Safari's built-in PDF viewer is
 * unreliable with data: URIs in iframes) but locks the viewer to the first
 * page and disables pointer events so scrolling the chat isn't hijacked.
 */
export const PdfInlinePreview: React.FC<PdfInlinePreviewProps> = ({
  artifact,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    setBlobUrl(null)
    setError(null)

    fetch(artifact.content)
      .then((response) => response.blob())
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch((err) => {
        console.error('Failed to load PDF preview:', err)
        if (!cancelled) {
          setError('Preview unavailable')
        }
      })

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [artifact.content])

  if (error) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-xs text-muted-foreground'>{error}</p>
      </div>
    )
  }

  if (!blobUrl) {
    return <Skeleton className='h-full w-full rounded-none' />
  }

  return (
    <iframe
      // Fragment params tame the built-in viewer: no toolbar/thumbnail rail,
      // first page only, fitted to the frame width. Ignored by Safari.
      src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH&page=1`}
      title={`${artifact.title} preview`}
      tabIndex={-1}
      aria-hidden='true'
      className='pointer-events-none h-full w-full bg-white'
    />
  )
}

export default PdfInlinePreview
