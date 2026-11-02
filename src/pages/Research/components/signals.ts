// Presentation metadata for evidence labels and provenance tools.

import type { ReviewItem } from '../types'

type BadgeVariant = 'green' | 'red' | 'blue' | 'yellow' | 'gray'

interface EvidenceMeta {
  label: string
  /** What the label means, relative to the question the Scout was given. */
  hint: string
  badge: BadgeVariant
  dot: string
}

const EVIDENCE: Record<string, EvidenceMeta> = {
  supporting: {
    label: 'Supports',
    hint: 'Answers the question, or backs its claim',
    badge: 'green',
    dot: 'bg-green-500',
  },
  disputing: {
    label: 'Contradicts',
    hint: 'Cuts against the claim or the expected answer',
    badge: 'red',
    dot: 'bg-red-500',
  },
  partial: {
    label: 'Partly answers',
    hint: 'Answers part of the question, or only under conditions',
    badge: 'yellow',
    dot: 'bg-amber-500',
  },
  tangential: {
    label: 'Background',
    hint: 'Useful context, not an answer',
    badge: 'blue',
    dot: 'bg-sky-500',
  },
  unverifiable: {
    label: 'Unverified',
    hint: 'The Scout could not read enough to judge',
    badge: 'gray',
    dot: 'bg-muted-foreground',
  },
}

export const evidenceMeta = (label: string): EvidenceMeta =>
  EVIDENCE[label] ?? {
    label: 'Unlabelled',
    hint: 'The Scout gave no label',
    badge: 'gray',
    dot: 'bg-muted-foreground',
  }

/** Title-case a provenance tool slug, e.g. 'web' -> 'Web', 'consensus' -> 'Consensus'. */
export const toolLabel = (tool: string): string =>
  tool ? tool.charAt(0).toUpperCase() + tool.slice(1) : 'Unknown'

/** Opened, quote found on the page, nothing flagged, and the Scout is confident. */
export const isStrong = (item: ReviewItem): boolean => {
  const check = item.provenance?.check
  return (
    !!check?.read &&
    !!check.quoteFound &&
    check.flags.length === 0 &&
    (item.confidence ?? 0) >= 0.7 &&
    item.evidenceLabel !== 'unverifiable'
  )
}

export interface ScoutGroup<T extends ReviewItem> {
  key: string
  runId: number | null
  focus: string
  task: string
  items: T[]
}

/** Group findings by the Scout (and so the question) that found them, newest first. */
export const groupByScout = <T extends ReviewItem>(
  items: T[]
): ScoutGroup<T>[] => {
  const groups = new Map<string, ScoutGroup<T>>()
  for (const item of items) {
    const runId = item.provenance?.runId ?? null
    const key = runId == null ? 'none' : String(runId)
    const group = groups.get(key) ?? {
      key,
      runId,
      focus: item.focus,
      task: item.task,
      items: [],
    }
    group.items.push(item)
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => (b.runId ?? 0) - (a.runId ?? 0))
}
