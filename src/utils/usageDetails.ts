import type {
  EstimatedUsageField,
  Message,
  MessageUsageDetail,
} from '../redux/types/conversation'

type NumericUsageKey =
  | 'thinkingTokens'
  | 'visibleOutputTokens'
  | 'cachedInputTokens'
  | 'cacheWriteInputTokens'

export function usageRounds(message: Message): MessageUsageDetail[] {
  return message.usageDetails ?? []
}

export function sumUsage(message: Message, key: NumericUsageKey): number {
  return usageRounds(message).reduce(
    (total, round) => total + (round[key] ?? 0),
    0
  )
}

/** Token counts tokenized locally because the stream was stopped before the provider reported them. */
export function estimatedUsageFields(
  message: Message
): Set<EstimatedUsageField> {
  return new Set(
    usageRounds(message).flatMap((round) => round.estimatedFields ?? [])
  )
}
