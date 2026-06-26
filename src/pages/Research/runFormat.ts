// Presentation helpers for agent runs — the API returns canonical values
// (slugs, ISO timestamps, numeric cost/duration); these format them for display.

import { formatRelativeDate } from '@/utils/dateUtils'

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray'

/** Title-case a role slug, e.g. 'scout' -> 'Scout'. */
export const roleLabel = (role: string): string =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Agent'

export const runStatusBadge = (
  status: string
): { variant: BadgeVariant; label: string } => {
  switch (status) {
    case 'completed':
      return { variant: 'green', label: 'Completed' }
    case 'running':
      return { variant: 'yellow', label: 'Running' }
    case 'failed':
      return { variant: 'red', label: 'Failed' }
    case 'queued':
      return { variant: 'gray', label: 'Queued' }
    case 'started':
      return { variant: 'yellow', label: 'Started' }
    default:
      return { variant: 'gray', label: roleLabel(status) }
  }
}

/** Wall-clock duration of a run, e.g. "26s" / "1m 08s" / "—" while running. */
export const formatRunDuration = (
  startedAt: string | null,
  completedAt: string | null
): string => {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export const formatCost = (cost: number): string =>
  cost > 0 ? `$${cost.toFixed(2)}` : '—'

/** Total tokens a run consumed, e.g. "14.6k tokens". */
export const formatTokens = (totalTokens?: number | null): string => {
  if (!totalTokens) return '—'
  return totalTokens < 1000
    ? `${totalTokens} tokens`
    : `${(totalTokens / 1000).toFixed(1)}k tokens`
}

export const formatToolCallDuration = (durationMs: number | null): string => {
  if (durationMs == null) return '—'
  return durationMs < 1000
    ? `${durationMs}ms`
    : `${(durationMs / 1000).toFixed(1)}s`
}

/** Relative time a run was kicked off, e.g. "2 hours ago". */
export const formatRanAt = (ranAt: string): string => formatRelativeDate(ranAt)
