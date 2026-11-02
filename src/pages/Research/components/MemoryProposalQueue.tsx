import { Cpu } from 'lucide-react'
import type { MemoryProposal } from '../types'
import ProposalCard from './learning/ProposalCard'

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

/** The agent's learning waiting on a decision, outside the Learning tab. */
const MemoryProposalQueue = ({
  proposals,
  onDecided,
  title,
  note,
  emptyLine,
}: Props) => {
  if (proposals.length === 0) {
    return emptyLine ? (
      <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
        {emptyLine}
      </p>
    ) : null
  }
  return (
    <section className='rounded-xl border border-border bg-muted/30 p-4'>
      <h3 className='flex items-center gap-2 text-sm font-medium'>
        <Cpu className='h-4 w-4 text-muted-foreground' />
        {title} · {proposals.length}
      </h3>
      {note && <p className='mt-1 text-xs text-muted-foreground'>{note}</p>}
      <div className='mt-3 space-y-2'>
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={{ ...p, action: 'add' }}
            onDecided={onDecided}
          />
        ))}
      </div>
    </section>
  )
}

export default MemoryProposalQueue
