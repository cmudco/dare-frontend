/**
 * MemoryWriteChangeRow
 *
 * One decision the writer made about a turn. A decision the gate overruled
 * says what was asked for alongside what was done — those disagreements are
 * the whole reason the panel is worth reading.
 */
import { cn } from '@/lib/utils'
import type { MemoryWriteChange } from '@/redux/types/conversation'

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

const MemoryWriteChangeRow: React.FC<{ change: MemoryWriteChange }> = ({
  change,
}) => {
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

export default MemoryWriteChangeRow
