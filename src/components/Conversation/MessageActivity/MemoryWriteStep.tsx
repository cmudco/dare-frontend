/**
 * What the memory writer did with this turn.
 *
 * Deliberately shows refusals as prominently as writes. The claim this feature
 * makes is not "it remembers things" — it is "you can see what it decided",
 * and a panel that only listed successes would quietly break that claim.
 */
import React from 'react'
import type { MemoryWriteData } from '@/redux/types/conversation'
import { StepHeader } from '../Timeline'
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
        <MemoryWriteChangeRow key={index} change={change} />
      ))}
    </div>
  </>
)
