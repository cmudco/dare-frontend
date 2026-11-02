import { useState } from 'react'
import { Bookmark, Check, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { reviewMemoryProposalAPI } from '@/api/research'
import { MEMORY_LAYERS } from '@/utils/constants/research'
import type {
  MemoryEvidence,
  MemoryLayer,
  MemoryProposalOrigin,
} from '@/redux/types/research'

export interface ProposalView {
  id: number
  content: string
  layer: MemoryLayer
  why: string
  origin: MemoryProposalOrigin
  status: string
  action: string
  evidence?: MemoryEvidence[]
}

interface Props {
  proposal: ProposalView
  onDecided?: () => void
  compact?: boolean
}

const ORIGIN_LABEL: Record<MemoryProposalOrigin, string> = {
  foreground: 'Proposed in conversation',
  background_review: 'From Hermes’s background review',
  legacy: 'Saved before approvals were required',
}

const actionVerb = (action: string, layer: MemoryLayer) => {
  if (layer === 'procedure') {
    if (action === 'patch' || action === 'edit') return 'Update skill'
    if (action === 'delete') return 'Retire skill'
    return 'New skill'
  }
  if (action === 'replace') return 'Update memory'
  if (action === 'remove') return 'Forget'
  return 'Remember'
}

/**
 * One thing the agent wants to learn, waiting on the scholar. The suggested
 * layer can be switched before approving — a memory between researcher-wide
 * and project-only; a procedure between every project and this one.
 */
const ProposalCard = ({ proposal, onDecided, compact }: Props) => {
  const isProcedure = proposal.layer === 'procedure'
  const [layer, setLayer] = useState<MemoryLayer>(
    isProcedure ? 'researcher' : proposal.layer
  )
  const [status, setStatus] = useState(proposal.status)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const decide = async (decision: 'accept' | 'reject') => {
    setBusy(true)
    setError('')
    try {
      const result = await reviewMemoryProposalAPI(
        proposal.id,
        decision,
        decision === 'accept' ? layer : undefined
      )
      setStatus(result.status)
      onDecided?.()
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      setError(detail || 'Could not save that decision.')
    } finally {
      setBusy(false)
    }
  }

  const otherLayer: MemoryLayer =
    layer === 'researcher' ? 'project' : 'researcher'
  const scopeLabel = isProcedure
    ? layer === 'researcher'
      ? 'Every project'
      : 'This project only'
    : MEMORY_LAYERS[layer].label

  return (
    <div className='rounded-xl border border-border bg-card p-3.5'>
      <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
        <Bookmark className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>
          {actionVerb(proposal.action, proposal.layer)}
        </span>
        <Badge variant={isProcedure ? 'default' : 'secondary'}>
          {isProcedure ? `Skill · ${scopeLabel}` : scopeLabel}
        </Badge>
        {!compact && <span>{ORIGIN_LABEL[proposal.origin]}</span>}
      </div>
      <p className='mt-2 text-sm leading-relaxed whitespace-pre-wrap'>
        {proposal.content}
      </p>
      {proposal.why && (
        <p className='mt-1 text-xs text-muted-foreground'>{proposal.why}</p>
      )}

      {status === 'proposed' ? (
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <Button size='sm' disabled={busy} onClick={() => decide('accept')}>
            {busy ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Check className='h-4 w-4' />
            )}
            Approve
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={busy}
            onClick={() => setLayer(otherLayer)}
            title={
              isProcedure
                ? 'Switch between every project and this project only'
                : MEMORY_LAYERS[otherLayer].hint
            }
          >
            {isProcedure
              ? otherLayer === 'researcher'
                ? 'Use in every project'
                : 'This project only'
              : `Make it ${MEMORY_LAYERS[otherLayer].label.toLowerCase()}`}
          </Button>
          <Button
            size='sm'
            variant='ghost'
            disabled={busy}
            onClick={() => decide('reject')}
          >
            <X className='h-4 w-4' /> Reject
          </Button>
        </div>
      ) : (
        <p className='mt-2 text-xs font-medium text-muted-foreground'>
          {status === 'accepted'
            ? `Approved · ${scopeLabel.toLowerCase()}`
            : 'Rejected · nothing saved'}
        </p>
      )}
      {error && <p className='mt-2 text-xs text-destructive'>{error}</p>}
    </div>
  )
}

export default ProposalCard
