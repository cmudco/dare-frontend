import { useState } from 'react'
import { Brain } from 'lucide-react'
import { reviewMemoryProposalAPI } from '@/api/research'
import { formatRelativeDate } from '@/utils/dateUtils'
import type { MemoryProposal } from '../types'

interface Props {
  proposals: MemoryProposal[]
  /** Refetch after a decision — the files and project memory both moved. */
  onDecided: () => void
  /** Rendered above the rows when there is something waiting. */
  title: string
  /** Shown once under the title. Omitted where the surrounding panel says it. */
  note?: string
  /** What to show when the queue is empty; hidden entirely when absent. */
  emptyLine?: string
}

/**
 * The agent's memory waiting on a decision.
 *
 * Lives in both the Context tab and the Review Inbox: a fact the agent wants to
 * keep is the same kind of decision as a source it wants to cite, and a scholar
 * who only ever opens the inbox should not have to discover a second queue
 * hidden behind a tab.
 */
const MemoryProposalQueue = ({
  proposals,
  onDecided,
  title,
  note,
  emptyLine,
}: Props) => {
  // Decided rows leave immediately rather than waiting for the refetch — a
  // queue that still shows what you just actioned reads as broken.
  const [decided, setDecided] = useState<Record<number, boolean>>({})
  const [busy, setBusy] = useState<number | null>(null)

  const decide = async (id: number, decision: 'accept' | 'reject') => {
    setBusy(id)
    try {
      await reviewMemoryProposalAPI(id, decision)
      setDecided((d) => ({ ...d, [id]: true }))
      onDecided()
    } finally {
      setBusy(null)
    }
  }

  const open = proposals.filter((p) => !decided[p.id])

  if (open.length === 0) {
    return emptyLine ? (
      <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
        {emptyLine}
      </p>
    ) : null
  }

  return (
    <section className='rounded-xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
      <h3 className='flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300'>
        <Brain className='h-4 w-4' />
        {title} · {open.length}
      </h3>
      {note && (
        <p className='mt-1 text-xs text-amber-900/70 dark:text-amber-200/70'>
          {note}
        </p>
      )}
      <div className='mt-3 space-y-2'>
        {open.map((p) => (
          <div
            key={p.id}
            className='flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3'
          >
            <div className='min-w-[12rem] flex-1'>
              <p className='text-sm leading-relaxed'>{p.content}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Proposed {formatRelativeDate(p.proposedAt)}
              </p>
            </div>
            <div className='flex shrink-0 gap-2'>
              <button
                type='button'
                disabled={busy === p.id}
                onClick={() => decide(p.id, 'accept')}
                className='rounded-md border border-green-600/40 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-900/40'
              >
                Keep
              </button>
              <button
                type='button'
                disabled={busy === p.id}
                onClick={() => decide(p.id, 'reject')}
                className='rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50'
              >
                Discard
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MemoryProposalQueue
