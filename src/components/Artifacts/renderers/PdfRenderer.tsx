import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Artifact } from '@/redux/types/artifact'

interface PdfRendererProps {
  artifact: Artifact
}

/**
 * PdfRenderer - Renders PDF artifacts in an iframe.
 *
 * Converts the data: URI content to a blob URL because Safari's
 * built-in PDF viewer is unreliable with data: URIs in iframes.
 */
export const PdfRenderer: React.FC<PdfRendererProps> = ({ artifact }) => {
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
        console.error('Failed to load PDF artifact:', err)
        if (!cancelled) {
          setError('Failed to load PDF')
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
      <div className='flex h-full items-center justify-center p-8'>
        <div className='rounded-lg bg-destructive/10 p-4'>
          <p className='text-destructive'>{error}</p>
        </div>
      </div>
    )
  }

  if (!blobUrl) {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Loading PDF...</span>
        </div>
      </div>
    )
  }

  return (
    <iframe
      // Fragment params tame the built-in viewer: no toolbar/thumbnail rail,
      // page fitted to the panel width. Ignored harmlessly by Safari.
      src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH`}
      title={artifact.title}
      className='h-full w-full rounded-lg border border-border bg-white'
    />
  )
}

export default PdfRenderer
