import type { Message, MessageUsageDetail } from '../redux/types/conversation'

type NumericUsageKey =
  | 'thinkingTokens'
  | 'visibleOutputTokens'
  | 'cachedInputTokens'
  | 'cacheWriteInputTokens'

export function usageRounds(message: Message): MessageUsageDetail[] {
  return Array.isArray(message.usageDetails) ? message.usageDetails : []
}

export function sumUsage(message: Message, key: NumericUsageKey): number {
  return usageRounds(message).reduce(
    (total, round) => total + (round[key] ?? 0),
    0
  )
}

export function isEstimatedUsage(message: Message): boolean {
  return usageRounds(message).some((round) => round.estimated)
}
