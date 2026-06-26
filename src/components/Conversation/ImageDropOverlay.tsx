import React from 'react'
import { Upload } from 'lucide-react'

interface ImageDropOverlayProps {
  isVisible: boolean
}

const ImageDropOverlay: React.FC<ImageDropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-linear-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-md'>
      <div className='animate-in rounded-3xl border-4 border-dashed border-blue-500 bg-card/95 px-16 py-12 shadow-2xl duration-200 zoom-in-95 dark:border-blue-400'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
            <Upload className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              Drop your images here
            </p>
            <p className='mt-2 text-sm text-muted-foreground'>
              Images will be attached to your message
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageDropOverlay
