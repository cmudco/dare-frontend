import React from 'react'
import { cn } from '@/lib/utils'
import type {
  MemoryWriteChange,
  MemoryWriteData,
} from '@/redux/types/conversation'
import { StepHeader } from '../Timeline'

/**
 * What the memory writer did with this turn.
 *
 * Deliberately shows refusals as prominently as writes. The claim this feature
 * makes is not "it remembers things" — it is "you can see what it decided",
 * and a panel that only listed successes would quietly break that claim.
 */

/** Past-tense labels for what actually happened, keyed by the ledger's action. */
const ACTION_LABEL: Record<string, string> = {
  add_fact: 'Remembered',
  add_procedure: 'Learned a rule',
  patch_user: 'Added to your profile',
  supersede: 'Replaced',
  edit: 'Corrected',
  forget: 'Forgot',
  hold: 'Held back',
  release: 'Released',
  ignore: 'Passed over',
}

const labelFor = (change: MemoryWriteChange): string =>
  ACTION_LABEL[change.action] ?? change.action.replace(/_/g, ' ')

/** A decision the gate overruled reads differently from one it waved through. */
const wasOverruled = (change: MemoryWriteChange): boolean =>
  change.proposedAction !== change.action

const ChangeRow: React.FC<{ change: MemoryWriteChange }> = ({ change }) => {
  const overruled = wasOverruled(change)
  const passive = change.action === 'ignore' || !change.applied

  return (
    <div className='py-1'>
      <div className='flex items-start justify-between gap-2'>
        <p
          className={cn(
            'min-w-0 flex-1 text-xs',
            passive ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          <span className='font-medium'>{labelFor(change)}</span>
          {change.detail && <span className='text-muted-foreground'> · </span>}
          {change.detail}
        </p>
        {overruled && (
          <span className='shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
            asked to {change.proposedAction.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      {change.reason && (
        <p className='mt-0.5 text-xs text-muted-foreground'>{change.reason}</p>
      )}
      {change.note && (
        <p className='mt-0.5 text-xs text-muted-foreground italic'>
          {change.note}
        </p>
      )}
    </div>
  )
}

/** "Remembered 1 · retired 1", or an honest nothing. */
export const memoryWriteSummary = (write: MemoryWriteData): string => {
  const parts: string[] = []
  if (write.created) parts.push(`remembered ${write.created}`)
  if (write.retired) parts.push(`retired ${write.retired}`)
  if (write.reinforced) parts.push(`reinforced ${write.reinforced}`)
  if (write.profileChanged) parts.push('updated your profile')
  if (parts.length) return parts.join(' · ')
  return write.considered
    ? `considered ${write.considered}, kept nothing`
    : 'nothing to remember'
}

export const MemoryWriteStep: React.FC<{ write: MemoryWriteData }> = ({
  write,
}) => (
  <>
    <StepHeader title='Memory updated'>
      <span className='font-normal text-muted-foreground'>
        {memoryWriteSummary(write)}
      </span>
    </StepHeader>
    <div className='mt-1'>
      {write.changes.map((change, index) => (
        <ChangeRow key={index} change={change} />
      ))}
    </div>
  </>
)
