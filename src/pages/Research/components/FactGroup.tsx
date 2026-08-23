import { formatRelativeDate } from '@/utils/dateUtils'
import EmptyLine from './EmptyLine'

/**
 * One group of the agent's memory, grouped by how far it reaches.
 *
 * Reach is the thing a scholar actually needs to know — that the agent knows
 * their name in every project but the working thesis only here — and it is a
 * property of the file, so the file name stays on the heading rather than
 * being the heading.
 */
const FactGroup = ({
  title,
  file,
  scope,
  entries,
  firstSeen,
  kept,
}: {
  title: string
  file: string
  scope: string
  entries: string[]
  firstSeen: Record<string, string>
  /** Entries DARE has also written into its own record. */
  kept?: Set<string>
}) => (
  <section>
    <div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-3'>
      <h3 className='text-sm font-medium'>
        {title} · {entries.length}
      </h3>
      <span className='font-mono text-[11px] text-muted-foreground'>
        {file}
      </span>
    </div>
    <p className='mb-3 text-xs text-muted-foreground'>{scope}</p>
    {entries.length === 0 ? (
      <EmptyLine>Hermes hasn't written anything here yet.</EmptyLine>
    ) : (
      <ul className='space-y-2'>
        {entries.map((entry) => (
          <li
            key={entry}
            className='flex items-baseline gap-3 rounded-lg border border-border bg-card px-4 py-3'
          >
            <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50' />
            <p className='flex-1 text-sm leading-relaxed text-foreground/90'>
              {entry}
            </p>
            {/* Names the overlap with project memory rather than leaving the
                same sentence sitting in two tabs with no relationship. */}
            {kept?.has(entry) && (
              <span className='shrink-0 text-[11px] text-green-700 dark:text-green-400'>
                in your record
              </span>
            )}
            {firstSeen[entry] && (
              <span className='shrink-0 text-[11px] text-muted-foreground'>
                {formatRelativeDate(firstSeen[entry])}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
)

export default FactGroup
