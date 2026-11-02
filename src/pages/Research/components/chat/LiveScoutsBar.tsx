import { useState } from 'react'
import { ChevronUp, Telescope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isRunInFlight } from '@/utils/constants/research'
import type { ScoutSummary } from '@/redux/types/research'
import ScoutBoard from './ScoutBoard'

interface Props {
  scouts: ScoutSummary[]
  onChanged: () => void
  onGoToReview: () => void
}

/**
 * Pinned by the composer while any Scout in the thread is working — where the
 * scholar is looking. Collapsed it says how many are running, how many steps
 * and staged so far, and the latest step; open, it is the full live card with
 * each search and read, Stop and Redirect.
 */
const LiveScoutsBar = ({ scouts, onChanged, onGoToReview }: Props) => {
  const [open, setOpen] = useState(false)
  const live = scouts.filter((s) => isRunInFlight(s.status))
  if (live.length === 0) return null
  const steps = live.reduce((sum, s) => sum + s.activity.length, 0)
  const staged = live.reduce((sum, s) => sum + s.staged, 0)
  const ordered = live
    .flatMap((s) => s.activity.map((a) => ({ ...a, focus: s.focus })))
    .sort((a, b) => a.at.localeCompare(b.at))
  const latest = ordered[ordered.length - 1]

  return (
    <div className='mb-3'>
      {open && (
        <div className='mb-2 max-h-80 overflow-y-auto'>
          <ScoutBoard
            scouts={live}
            onChanged={onChanged}
            onGoToReview={onGoToReview}
          />
        </div>
      )}
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-left text-xs transition-colors hover:bg-muted/70'
      >
        <span className='relative flex h-2.5 w-2.5 shrink-0'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none' />
          <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-primary' />
        </span>
        <Telescope className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        <span className='shrink-0 font-medium text-foreground'>
          {live.length} Scout{live.length === 1 ? '' : 's'} working
        </span>
        <span className='shrink-0 text-muted-foreground'>
          · {steps} step{steps === 1 ? '' : 's'} · {staged} staged
        </span>
        {latest && (
          <span className='min-w-0 flex-1 truncate text-muted-foreground'>
            · {latest.focus}: {latest.verb.toLowerCase()} {latest.detail}
          </span>
        )}
        <ChevronUp
          className={cn(
            'ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            !open && 'rotate-180'
          )}
        />
      </button>
    </div>
  )
}

export default LiveScoutsBar
