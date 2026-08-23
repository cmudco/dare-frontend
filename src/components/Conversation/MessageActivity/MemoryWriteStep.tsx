/**
 * What the memory writer did with this turn — and, deliberately, when.
 *
 * This did not happen while the person waited. The writer reads the finished
 * turn in a background job, so the block sits below the timeline rather than
 * on it: shown as another step it read as a tool call the turn had made.
 *
 * The headline is the OUTCOME, not the process. One "call me Abbas" produced
 * three ledger entries as the gate worked through a patch and two supersedes,
 * which is honest and unreadable. The decisions are still all here, one
 * disclosure away, because refusals are the half worth reading.
 */
import React, { useState } from 'react'
import { ChevronDown, ChevronRight, PencilLine } from 'lucide-react'
import type {
  MemoryWriteChange,
  MemoryWriteData,
} from '@/redux/types/conversation'
import MemoryWriteChangeRow from './MemoryWriteChangeRow'

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

/**
 * What the store actually holds now — the last applied decision per memory.
 *
 * Reaching one answer can take several decisions, and every step but the last
 * describes a state that no longer exists.
 */
const outcomesOf = (changes: MemoryWriteChange[]): MemoryWriteChange[] => {
  const byRecord = new Map<string, MemoryWriteChange>()
  changes
    .filter((change) => change.applied && change.action !== 'ignore')
    .forEach((change, index) => {
      byRecord.set(change.recordId || `unkeyed-${index}`, change)
    })
  return [...byRecord.values()]
}

export const MemoryWriteStep: React.FC<{ write: MemoryWriteData }> = ({
  write,
}) => {
  const [showAll, setShowAll] = useState(false)

  const outcomes = outcomesOf(write.changes)
  const hidden = write.changes.length - outcomes.length
  const shown = showAll ? write.changes : outcomes

  return (
    <div className='mt-3 border-t border-border pt-3'>
      <div className='flex items-center gap-2'>
        <PencilLine className='h-3.5 w-3.5 text-muted-foreground' />
        <span className='text-xs font-medium'>After the reply</span>
        <span className='text-xs text-muted-foreground'>
          {memoryWriteSummary(write)}
        </span>
      </div>

      <div className='mt-1 pl-5'>
        {shown.map((change, index) => (
          <MemoryWriteChangeRow key={index} change={change} />
        ))}

        {hidden > 0 && (
          <button
            type='button'
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            className='mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
          >
            {showAll ? (
              <ChevronDown className='h-3 w-3' />
            ) : (
              <ChevronRight className='h-3 w-3' />
            )}
            {showAll
              ? 'Show what changed'
              : `Show all ${write.changes.length} decisions`}
          </button>
        )}
      </div>
    </div>
  )
}
