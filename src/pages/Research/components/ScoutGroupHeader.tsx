import { useState } from 'react'
import type { AgentRun } from '../types'

interface Props {
  focus: string
  task: string
  /** The Scout run, when known: adds how wide it looked. */
  run?: AgentRun
  count: number
  children?: React.ReactNode
}

/** The question a group of findings answers, and how the Scout got them. */
const ScoutGroupHeader = ({ focus, task, run, count, children }: Props) => {
  const [open, setOpen] = useState(false)
  const setAside = run?.learning?.setAside?.length ?? 0
  const coverage = run?.coverage
  const stats = [
    coverage && `${coverage.searches} searches`,
    coverage && `${coverage.reads} pages read`,
    `${count} finding${count === 1 ? '' : 's'}`,
    setAside > 0 && `${setAside} set aside`,
  ].filter(Boolean)

  return (
    <header className='flex flex-wrap items-end gap-x-3 gap-y-1'>
      <div className='min-w-0 flex-1'>
        <h3 className='text-sm font-semibold'>{focus || 'Earlier findings'}</h3>
        {task && (
          <button
            onClick={() => setOpen((v) => !v)}
            className={`mt-0.5 block text-left text-xs text-muted-foreground hover:text-foreground ${open ? '' : 'line-clamp-1'}`}
            title={open ? undefined : 'Show what the Scout was asked'}
          >
            {task}
          </button>
        )}
        <p className='mt-0.5 text-xs text-muted-foreground'>
          {stats.join(' · ')}
        </p>
      </div>
      {children}
    </header>
  )
}

export default ScoutGroupHeader
