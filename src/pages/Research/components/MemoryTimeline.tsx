import type { AgentMemoryChange } from '@/api/research'

/**
 * How the agent's memory got to its current state.
 *
 * Collapsed, because every current fact now carries its own date above — what
 * is left in here is the part the files genuinely cannot show: what the agent
 * dropped or replaced, and why it went.
 */
const MemoryTimeline = ({
  history,
  discarded,
}: {
  history: AgentMemoryChange[]
  discarded: string[]
}) => {
  const changes = history.filter(
    (h) =>
      h.memory.added.length ||
      h.memory.removed.length ||
      h.user.added.length ||
      h.user.removed.length
  )

  if (changes.length === 0) return null

  const wasDiscarded = (text: string) => discarded.includes(text)

  return (
    <details className='rounded-xl border border-border bg-card px-4 py-3'>
      <summary className='cursor-pointer text-sm font-medium'>
        How this memory grew · {changes.length}{' '}
        {changes.length === 1 ? 'change' : 'changes'}
      </summary>
      <p className='mt-2 mb-3 text-xs text-muted-foreground'>
        Recorded each time the files changed. Green is what the agent learned;
        struck through is what left. Entries marked{' '}
        <span className='font-mono'>you</span> are about you rather than this
        project, so they show up in every project you own.
      </p>
      <ol className='space-y-3'>
        {changes.map((h) => (
          <li key={h.id} className='rounded-lg border border-border p-3'>
            <div className='mb-2 flex items-baseline justify-between gap-3'>
              <span className='text-xs font-medium'>
                {h.isFirst ? 'First recorded' : 'Updated'}
              </span>
              <span className='text-xs text-muted-foreground'>
                {new Date(h.takenAt).toLocaleString()}
              </span>
            </div>
            <ul className='space-y-1'>
              {(['memory', 'user'] as const).flatMap((file) => [
                ...h[file].added.map((text) => (
                  <li
                    key={`${file}-a-${text}`}
                    className='flex gap-2 text-xs leading-relaxed'
                  >
                    <span className='shrink-0 font-mono text-emerald-600 dark:text-emerald-400'>
                      +
                    </span>
                    <span className='text-foreground/90'>{text}</span>
                    <span className='ml-auto shrink-0 font-mono text-[11px] text-muted-foreground'>
                      {file === 'memory' ? 'project' : 'you'}
                    </span>
                  </li>
                )),
                ...h[file].removed.map((text) => (
                  <li
                    key={`${file}-r-${text}`}
                    className='flex gap-2 text-xs leading-relaxed'
                  >
                    <span className='shrink-0 font-mono text-muted-foreground'>
                      −
                    </span>
                    <span className='text-muted-foreground line-through'>
                      {text}
                    </span>
                    {/* Without this a removal reads as the agent forgetting on
                        its own, when the usual cause is the scholar. */}
                    <span className='ml-auto shrink-0 font-mono text-[11px] text-muted-foreground'>
                      {wasDiscarded(text) ? 'you discarded this' : 'replaced'}
                    </span>
                  </li>
                )),
              ])}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  )
}

export default MemoryTimeline
