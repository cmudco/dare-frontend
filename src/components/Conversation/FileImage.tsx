import React from 'react'
import { ExternalLink, ImageOff } from 'lucide-react'

import { useFileObjectUrl } from '@/hooks/useFileObjectUrl'

interface FileImageProps {
  fileId: number
  alt: string
  className?: string
  /** Show an Open link under the image and open it on click. */
  openable?: boolean
  children?: React.ReactNode
}

const openInNewTab = (url: string) => window.open(url, '_blank', 'noopener')

const FileImage: React.FC<FileImageProps> = ({
  fileId,
  alt,
  className,
  openable = false,
  children,
}) => {
  const { url, failed } = useFileObjectUrl(fileId)

  if (failed) {
    return (
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <ImageOff className='h-4 w-4' />
        {alt}
      </div>
    )
  }
  if (!url) {
    return <div className='h-40 w-64 animate-pulse rounded-lg bg-muted' />
  }

  const image = <img src={url} alt={alt} className={className} />
  if (!openable) return image

  return (
    <>
      <button type='button' onClick={() => openInNewTab(url)}>
        {image}
      </button>
      <div className='mt-2 flex gap-3 text-xs'>
        <button
          type='button'
          onClick={() => openInNewTab(url)}
          className='flex items-center gap-1 text-muted-foreground hover:text-foreground'
        >
          <ExternalLink className='h-3.5 w-3.5' />
          Open
        </button>
        {children}
      </div>
    </>
  )
}

export default FileImage
