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

/** Which token counts were tokenized locally rather than reported by the provider. */
export function estimatedUsageFields(
  message: Message
): Set<'inputTokens' | 'outputTokens'> {
  const fields = new Set<'inputTokens' | 'outputTokens'>()
  for (const round of usageRounds(message)) {
    if (!round.estimated) continue
    // Rounds recorded before estimatedFields existed estimated both sides.
    for (const field of round.estimatedFields ?? [
      'inputTokens',
      'outputTokens',
    ]) {
      fields.add(field)
    }
  }
  return fields
}
