import type { MemoryWriteData } from '@/redux/types/conversation'

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
