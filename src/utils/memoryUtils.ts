import { MemoryType } from '@/redux/types/memory'

/** Tailwind classes for a memory type badge. */
export const getTypeBadgeColor = (memoryType: string): string => {
  switch (memoryType) {
    case MemoryType.PROFILE:
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
    case MemoryType.KNOWLEDGE:
      return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
    case MemoryType.BEHAVIOR:
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
    case MemoryType.EVENT:
      return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30'
    default:
      return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
  }
}
