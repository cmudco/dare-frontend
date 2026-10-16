import { useState } from 'react'
import { BookOpen, CircleAlert, Search } from 'lucide-react'
import type { ScoutActivity } from '@/redux/types/research'

interface Props {
  activity: ScoutActivity[]
  live: boolean
}

const hostOf = (detail: string) => {
  try {
    const url = new URL(detail)
    return url.hostname.replace(/^www\./, '') + url.pathname.slice(0, 40)
  } catch {
    return detail
  }
}

const Row = ({ step }: { step: ScoutActivity }) => {
  const Icon = !step.ok
    ? CircleAlert
    : step.tool === 'fetch_page'
      ? BookOpen
      : Search
  return (
    <li className='flex items-start gap-2 text-xs'>
      <Icon
        className={`mt-0.5 h-3 w-3 shrink-0 ${step.ok ? 'text-muted-foreground' : 'text-destructive'}`}
      />
      <span className='min-w-0'>
        <span className='text-muted-foreground'>{step.verb} </span>
        <span className='break-words text-foreground'>
          {step.tool === 'fetch_page'
            ? hostOf(step.detail)
            : `“${step.detail}”`}
        </span>
        {!step.ok && step.error && (
          <span className='block text-muted-foreground'>{step.error}</span>
        )}
      </span>
    </li>
  )
}

/**
 * What a Scout is actually doing — each search and page read as it lands.
 * Live Scouts show their latest steps; finished ones fold them away.
 */
const ScoutActivityFeed = ({ activity, live }: Props) => {
  const [open, setOpen] = useState(false)
  if (activity.length === 0) return null
  if (live) {
    return (
      <ul className='mt-2 space-y-1 border-l border-border pl-3'>
        {activity.slice(-4).map((step, i) => (
          <Row key={`${step.at}-${i}`} step={step} />
        ))}
      </ul>
    )
  }
  return (
    <div className='mt-1.5'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className='text-xs text-muted-foreground hover:text-foreground'
      >
        {open ? 'Hide' : 'Show'} its {activity.length} searches and reads
      </button>
      {open && (
        <ul className='mt-1 space-y-1 border-l border-border pl-3'>
          {activity.map((step, i) => (
            <Row key={`${step.at}-${i}`} step={step} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default ScoutActivityFeed
