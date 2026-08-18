import React, { useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_VIDEO, demoVideoEmbedUrl, demoVideoPoster } from '../demoVideo'

/**
 * Click-to-load YouTube facade.
 *
 * The poster is a plain <img>; the iframe is only mounted once someone asks
 * for it, so an unwatched demo costs the landing page one image instead of
 * several hundred kilobytes of player.
 */
export const DemoVideoPlayer: React.FC<{
  /** Extra classes for the 16:9 stage. */
  className?: string
}> = ({ className }) => {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={cn('relative aspect-video overflow-hidden', className)}>
      {playing ? (
        <iframe
          src={demoVideoEmbedUrl}
          title={DEMO_VIDEO.title}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='absolute inset-0 h-full w-full border-0'
        />
      ) : (
        <button
          type='button'
          onClick={() => setPlaying(true)}
          aria-label={`Play ${DEMO_VIDEO.title} (${DEMO_VIDEO.runtime})`}
          className='group absolute inset-0 h-full w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          <img
            src={demoVideoPoster}
            alt=''
            loading='lazy'
            decoding='async'
            className='absolute inset-0 h-full w-full object-cover'
          />
          {/* Scrim over the still so the play control stays legible. */}
          <span
            aria-hidden
            className='absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/55'
          />
          <span className='absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105'>
            <Play className='h-6 w-6 translate-x-0.5 fill-current' />
          </span>
        </button>
      )}
    </div>
  )
}

export default DemoVideoPlayer
