import type {
  EnsembleBriefs,
  EnsembleConfig,
  EnsembleDepth,
  PickerModel,
} from '@/redux/types/conversation'

export const ENSEMBLE_MIN_RESPONDERS = 2

export const EMPTY_BRIEFS: EnsembleBriefs = {
  responder: null,
  evaluator: null,
  chairman: null,
  angles: [],
}

/** True when any role brief or seat angle differs from the defaults. */
export const hasCustomBriefs = (briefs: EnsembleBriefs): boolean =>
  briefs.responder !== null ||
  briefs.evaluator !== null ||
  briefs.chairman !== null ||
  briefs.angles.some((angle) => angle.trim().length > 0)

export const DEPTH_META: Record<
  EnsembleDepth,
  { label: string; tagline: string }
> = {
  single: { label: 'Single', tagline: 'One model answers.' },
  panel: {
    label: 'Panel',
    tagline: 'Several models answer at once, a chairman fuses them.',
  },
  council: {
    label: 'Council',
    tagline: 'Panel, then peer review, then the chairman rules.',
  },
}

export const isEnsembleActive = (ensemble: EnsembleConfig): boolean =>
  ensemble.depth !== 'single' &&
  ensemble.responderIds.length >= ENSEMBLE_MIN_RESPONDERS

/** Wire shape for `send_message`; undefined keeps single-model turns untouched. */
export const ensemblePayload = (
  ensemble: EnsembleConfig,
  selectedModel: string | null
) => {
  if (!isEnsembleActive(ensemble)) return undefined
  const { briefs } = ensemble
  return {
    depth: ensemble.depth,
    responder_ids: ensemble.responderIds,
    chairman_id: ensemble.chairmanId ?? selectedModel,
    briefs: hasCustomBriefs(briefs)
      ? {
          responder: briefs.responder ?? undefined,
          evaluator: briefs.evaluator ?? undefined,
          chairman: briefs.chairman ?? undefined,
          angles: ensemble.responderIds.map((_, i) => briefs.angles[i] ?? ''),
        }
      : undefined,
  }
}

// ---------------------------------------------------------------------------
// Cost and latency preview
// ---------------------------------------------------------------------------
//
// Rough by design: the point is to let people see the shape of the
// cost/latency curve before they send, not to bill. Output lengths and
// per-tier speeds are guesses; the prompt length is real.

const CONTEXT_OVERHEAD_TOKENS = 1200
const RESPONDER_OUTPUT_TOKENS = 450
const EVALUATION_OUTPUT_TOKENS = 250
const CHAIRMAN_OUTPUT_TOKENS = 550

const TIER_SPEED: Record<string, { ttftMs: number; tokensPerSec: number }> = {
  premium: { ttftMs: 1200, tokensPerSec: 45 },
  advanced: { ttftMs: 800, tokensPerSec: 70 },
  flash: { ttftMs: 400, tokensPerSec: 120 },
}

export interface EnsembleEstimate {
  costUsd: number
  latencyMs: number
  calls: number
  /** True when any participant has no rate on file, so cost is a floor. */
  partial: boolean
}

const speedFor = (model: PickerModel) =>
  TIER_SPEED[model.tier ?? ''] ?? TIER_SPEED.advanced

const callCost = (
  model: PickerModel,
  inputTokens: number,
  outputTokens: number
) =>
  (inputTokens * (model.inputTokenRatePerMillion ?? 0) +
    outputTokens * (model.outputTokenRatePerMillion ?? 0)) /
  1_000_000

const callLatency = (model: PickerModel, outputTokens: number) => {
  const speed = speedFor(model)
  return speed.ttftMs + (outputTokens / speed.tokensPerSec) * 1000
}

export const estimateTokens = (text: string): number =>
  Math.ceil(text.length / 4)

export const estimateEnsemble = ({
  promptChars,
  responders,
  chairman,
  depth,
}: {
  promptChars: number
  responders: PickerModel[]
  chairman: PickerModel | null
  depth: EnsembleDepth
}): EnsembleEstimate => {
  const promptTokens =
    estimateTokens(' '.repeat(promptChars)) + CONTEXT_OVERHEAD_TOKENS
  const participants = chairman ? [...responders, chairman] : responders
  const partial = participants.some(
    (m) =>
      m.inputTokenRatePerMillion == null || m.outputTokenRatePerMillion == null
  )

  if (depth === 'single' || responders.length === 0) {
    const model = chairman ?? responders[0]
    if (!model) return { costUsd: 0, latencyMs: 0, calls: 0, partial }
    return {
      costUsd: callCost(model, promptTokens, CHAIRMAN_OUTPUT_TOKENS),
      latencyMs: callLatency(model, CHAIRMAN_OUTPUT_TOKENS),
      calls: 1,
      partial,
    }
  }

  const draftsTokens = responders.length * RESPONDER_OUTPUT_TOKENS
  let costUsd = 0
  let latencyMs = 0
  let calls = 0

  // Wave 1: responders draft in parallel.
  costUsd += responders.reduce(
    (sum, m) => sum + callCost(m, promptTokens, RESPONDER_OUTPUT_TOKENS),
    0
  )
  latencyMs += Math.max(
    ...responders.map((m) => callLatency(m, RESPONDER_OUTPUT_TOKENS))
  )
  calls += responders.length

  // Wave 2 (council only): every responder reviews every draft, in parallel.
  let chairmanReads = promptTokens + draftsTokens
  if (depth === 'council') {
    const reviewInput = promptTokens + draftsTokens
    costUsd += responders.reduce(
      (sum, m) => sum + callCost(m, reviewInput, EVALUATION_OUTPUT_TOKENS),
      0
    )
    latencyMs += Math.max(
      ...responders.map((m) => callLatency(m, EVALUATION_OUTPUT_TOKENS))
    )
    calls += responders.length
    chairmanReads += responders.length * EVALUATION_OUTPUT_TOKENS
  }

  // Final wave: the chairman reads everything and writes the answer.
  if (chairman) {
    costUsd += callCost(chairman, chairmanReads, CHAIRMAN_OUTPUT_TOKENS)
    latencyMs += callLatency(chairman, CHAIRMAN_OUTPUT_TOKENS)
    calls += 1
  }

  return { costUsd, latencyMs, calls, partial }
}

export const formatEstimateCost = (usd: number): string => {
  if (usd <= 0) return '$0'
  if (usd < 0.01) return '<$0.01'
  return `~$${usd.toFixed(2)}`
}

export const formatEstimateLatency = (ms: number): string => {
  if (ms <= 0) return '—'
  const seconds = ms / 1000
  return seconds >= 10 ? `~${Math.round(seconds)}s` : `~${seconds.toFixed(1)}s`
}

/** "$3 / $15" per million tokens; null when the rates are unknown or free. */
export const formatRates = (model: PickerModel): string | null => {
  const input = model.inputTokenRatePerMillion
  const output = model.outputTokenRatePerMillion
  if (input == null || output == null || (input === 0 && output === 0)) {
    return null
  }
  const fmt = (rate: number) =>
    rate >= 1 ? `$${Math.round(rate)}` : `$${rate.toFixed(2)}`
  return `${fmt(input)} / ${fmt(output)}`
}
