/**
 * MemoryTidyUp
 *
 * What the store would like to fix about itself, and nothing more. The sweep
 * finds duplicates, facts repeated enough to belong in the profile, slots
 * named for what they used to hold, and a profile with more pinned to it than
 * fits — then waits.
 *
 * It is opt-in rather than always-on because a panel that permanently says
 * "6 things need your attention" is a chore, not a tool. Asked for, it either
 * has something to say or tells you plainly that it does not.
 */
import { useState } from 'react'
import { Loader2, Sparkle } from 'lucide-react'
import type { MemoryProposal, MemorySweep } from '@/redux/types/memory'
import { Button } from '@/components/ui/button'
import MemoryProposalCard from './MemoryProposalCard'

interface MemoryTidyUpProps {
  sweep: MemorySweep | null
  loading: boolean
  applyingProposal: string | null
  onRun: () => void
  onApprove: (proposal: MemoryProposal) => void
}

const MemoryTidyUp: React.FC<MemoryTidyUpProps> = ({
  sweep,
  loading,
  applyingProposal,
  onRun,
  onApprove,
}) => {
  // Dismissals live here rather than in each card, so the panel can tell the
  // difference between "nothing was suggested" and "you have been through
  // them all" — otherwise the last "Leave it" empties the panel silently.
  const [passed, setPassed] = useState<string[]>([])
  const keyOf = (proposal: MemoryProposal) =>
    `${proposal.kind}-${proposal.recordId}`

  const all = sweep?.proposals ?? []
  const proposals = all.filter((item) => !passed.includes(keyOf(item)))
  const reviewed = sweep !== null && all.length > 0 && proposals.length === 0

  return (
    <div className='rounded-xl border border-dashed border-border p-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <Sparkle className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Tidy up</span>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            {sweep
              ? `Looked over ${sweep.examined} memories. Nothing changes until you say so.`
              : 'Check for duplicates, stale labels, and things worth keeping closer.'}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            setPassed([])
            onRun()
          }}
          disabled={loading}
          className='gap-1.5'
        >
          {loading && (
            <Loader2 className='h-3.5 w-3.5 animate-spin motion-reduce:animate-none' />
          )}
          {sweep ? 'Check again' : 'Check my memory'}
        </Button>
      </div>

      {sweep && all.length === 0 && (
        <p className='mt-3 text-sm text-muted-foreground'>
          Nothing to tidy — no duplicates, and every label still matches what it
          holds.
        </p>
      )}

      {reviewed && (
        <p className='mt-3 text-sm text-muted-foreground'>
          That is everything. Check again whenever you like — the store keeps
          changing as you talk.
        </p>
      )}

      {proposals.length > 0 && (
        <div className='mt-3 space-y-3'>
          {proposals.map((proposal) => (
            <MemoryProposalCard
              key={`${proposal.kind}-${proposal.recordId}`}
              proposal={proposal}
              applying={applyingProposal === proposal.recordId}
              onApprove={onApprove}
              onPass={(item) => setPassed((seen) => [...seen, keyOf(item)])}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MemoryTidyUp
