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

export interface TokenTotals {
  uncached: number
  cacheRead: number
  cacheWrite: number
  output: number
  cost: number
}

export const EMPTY_TOKEN_TOTALS: TokenTotals = {
  uncached: 0,
  cacheRead: 0,
  cacheWrite: 0,
  output: 0,
  cost: 0,
}

export function tokenTotals(message: Message): TokenTotals {
  const cacheRead = sumUsage(message, 'cachedInputTokens')
  const cacheWrite = sumUsage(message, 'cacheWriteInputTokens')
  return {
    uncached: (message.inputTokens ?? 0) - cacheRead - cacheWrite,
    cacheRead,
    cacheWrite,
    output: message.outputTokens ?? 0,
    cost: Number(message.cost ?? 0),
  }
}

export function addTokenTotals(a: TokenTotals, b: TokenTotals): TokenTotals {
  return {
    uncached: a.uncached + b.uncached,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
    output: a.output + b.output,
    cost: a.cost + b.cost,
  }
}

/** Ids of the files a reply read in full; null when its trace predates file ids. */
export function filesReadInFull(
  reply: Message | undefined
): Set<number> | null {
  if (!reply) return new Set()
  if (!reply.contextTrace) return null
  const ids = (
    reply.contextTrace.stages.find((stage) => stage.kind === 'files')?.files ??
    []
  )
    .filter((entry) => !entry.sandbox)
    .map((entry) => entry.id)
  return ids.every((id): id is number => id !== undefined) ? new Set(ids) : null
}
