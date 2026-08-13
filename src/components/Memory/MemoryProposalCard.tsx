/**
 * MemoryProposalCard
 *
 * One suggestion from the tidy-up sweep. It leads with the memory, not the
 * verb — the question being asked is "is this right about you?", and that is
 * answered by reading the sentence, not by parsing what "merge" means.
 *
 * Both buttons are safe. Approving retires rather than deletes, and passing
 * simply leaves the store as it is.
 */
import { ArrowRight, Check, Loader2, X } from 'lucide-react'
import type { MemoryProposal } from '@/redux/types/memory'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MemoryProposalCardProps {
  proposal: MemoryProposal
  applying: boolean
  onApprove: (proposal: MemoryProposal) => void
  /** Dismissal is the panel's business — it has to know when nothing is left. */
  onPass: (proposal: MemoryProposal) => void
}

/** What each suggestion is called, in the language of the thing it does. */
const LABEL: Record<
  string,
  { title: string; variant: 'blue' | 'green' | 'yellow' | 'purple' }
> = {
  merge: { title: 'Duplicate', variant: 'yellow' },
  promote: { title: 'Worth keeping close', variant: 'green' },
  rekey: { title: 'Stale label', variant: 'blue' },
  evict: { title: 'Profile is full', variant: 'purple' },
}

const MemoryProposalCard: React.FC<MemoryProposalCardProps> = ({
  proposal,
  applying,
  onApprove,
  onPass,
}) => {
  const label = LABEL[proposal.kind] ?? {
    title: proposal.kind,
    variant: 'blue' as const,
  }

  return (
    <div className='rounded-xl border border-border bg-card p-4 shadow-xs'>
      <Badge variant={label.variant}>{label.title}</Badge>

      <p className='mt-2 text-sm text-foreground'>{proposal.text}</p>

      {proposal.otherText && (
        <div className='mt-1 flex items-start gap-2'>
          <ArrowRight className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
          <p className='text-sm text-muted-foreground line-through decoration-muted-foreground/40'>
            {proposal.otherText}
          </p>
        </div>
      )}

      <p className='mt-2 text-xs text-muted-foreground'>{proposal.reason}</p>

      <div className='mt-3 flex items-center gap-2'>
        <Button
          size='sm'
          onClick={() => onApprove(proposal)}
          disabled={applying}
          className='gap-1.5'
        >
          {applying ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin motion-reduce:animate-none' />
          ) : (
            <Check className='h-3.5 w-3.5' />
          )}
          {proposal.detail}
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onPass(proposal)}
          disabled={applying}
          className='gap-1.5 text-muted-foreground'
        >
          <X className='h-3.5 w-3.5' />
          Leave it
        </Button>
      </div>
    </div>
  )
}

export default MemoryProposalCard
